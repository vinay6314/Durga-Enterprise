import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { MovementTypes } from '../types';
import { generateStockLogsPdf } from '../services/pdfService';

const prisma = new PrismaClient();

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().nonnegative('Current stock cannot be negative').default(0),
  minStockAlert: z.number().int().nonnegative('Min stock alert cannot be negative').default(10),
  location: z.string().min(2, 'Location/warehouse is required'),
});

const stockMovementSchema = z.object({
  quantityChanged: z.number().int().positive('Quantity changed must be a positive integer'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(2, 'Reason for movement is required'),
});

export const getProducts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const category = (req.query.category as string) || '';
  const lowStockOnly = req.query.lowStockOnly === 'true';

  const skip = (page - 1) * limit;

  const whereCondition: any = {};

  if (search) {
    whereCondition.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { category: { contains: search } },
    ];
  }

  if (category) {
    whereCondition.category = category;
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { updatedAt: 'desc' },
  });

  const filteredProducts = lowStockOnly
    ? products.filter((p) => p.currentStock <= p.minStockAlert)
    : products;

  const paginatedProducts = filteredProducts.slice(skip, skip + limit);

  return res.json({
    success: true,
    data: paginatedProducts,
    pagination: {
      total: filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
    },
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      },
    },
  });

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  return res.json({ success: true, data: product });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const payload = productSchema.parse(req.body);

  const existingSku = await prisma.product.findUnique({ where: { sku: payload.sku } });
  if (existingSku) {
    return res.status(400).json({ success: false, error: `Product SKU '${payload.sku}' already exists.` });
  }

  const product = await prisma.product.create({
    data: payload,
  });

  if (payload.currentStock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantityChanged: payload.currentStock,
        movementType: MovementTypes.IN,
        reason: 'Initial Product Setup Stock',
        createdById: req.user!.id,
      },
    });
  }

  return res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = productSchema.partial().parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  if (payload.sku && payload.sku !== existing.sku) {
    const existingSku = await prisma.product.findUnique({ where: { sku: payload.sku } });
    if (existingSku) {
      return res.status(400).json({ success: false, error: `Product SKU '${payload.sku}' already exists.` });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: payload,
  });

  return res.json({ success: true, data: updated });
};

export const recordStockMovement = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { quantityChanged, movementType, reason } = stockMovementSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  if (movementType === MovementTypes.OUT && product.currentStock < quantityChanged) {
    return res.status(400).json({
      success: false,
      error: `Insufficient stock for SKU ${product.sku}. Available: ${product.currentStock}, Requested: ${quantityChanged}`,
    });
  }

  const newStock =
    movementType === MovementTypes.IN
      ? product.currentStock + quantityChanged
      : product.currentStock - quantityChanged;

  const [updatedProduct, movement] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { currentStock: newStock },
    }),
    prisma.stockMovement.create({
      data: {
        productId: id,
        quantityChanged,
        movementType,
        reason,
        createdById: req.user!.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
  ]);

  return res.status(201).json({
    success: true,
    data: {
      product: updatedProduct,
      movement,
    },
  });
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  // Delete related stock movements first (cascade-safe)
  await prisma.stockMovement.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return res.json({ success: true, message: `Product "${product.name}" deleted successfully.` });
};

export const getStockMovements = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const skip = (page - 1) * limit;

  const whereCondition: any = {};

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.stockMovement.count({ where: whereCondition }),
  ]);

  return res.json({
    success: true,
    data: movements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const downloadStockLogsPdf = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const whereCondition: any = {};

    const movements = await prisma.stockMovement.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const pdfBuffer = await generateStockLogsPdf(movements);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Stock_Movement_Audit_Logs.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating stock logs PDF:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate PDF.' });
  }
};
