import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateSalesChallanPdf } from '../services/pdfService';
import { ChallanStatuses, MovementTypes, ChallanStatus } from '../types';

const prisma = new PrismaClient();

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

const createChallanSchema = z.object({
  customerId: z.string().uuid(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).default('DRAFT'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required in the sales challan'),
});

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']),
});

export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string | undefined;
  const search = (req.query.search as string) || '';

  const skip = (page - 1) * limit;
  const whereCondition: any = {};
  const andConditions: any[] = [];

  if (status) {
    whereCondition.status = status;
  }

  if (search) {
    andConditions.push({
      OR: [
        { challanNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { businessName: { contains: search } } },
      ],
    });
  }

  if (andConditions.length > 0) {
    whereCondition.AND = andConditions;
  }

  const [challans, total] = await Promise.all([
    prisma.salesChallan.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, businessName: true, mobile: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        items: true,
      },
    }),
    prisma.salesChallan.count({ where: whereCondition }),
  ]);

  return res.json({
    success: true,
    data: challans,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getChallanById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: true,
    },
  });

  if (!challan) {
    return res.status(404).json({ success: false, error: 'Sales Challan not found.' });
  }

  return res.json({ success: true, data: challan });
};

export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, status, items } = createChallanSchema.parse(req.body);

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Selected customer not found.' });
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    return res.status(400).json({ success: false, error: 'One or more selected products do not exist.' });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  if (status === ChallanStatuses.CONFIRMED) {
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`,
        });
      }
    }
  }

  let totalQuantity = 0;
  let totalAmount = 0;

  const itemsToCreate = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const lineTotal = product.unitPrice * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += lineTotal;

    return {
      productId: product.id,
      productSnapshot: JSON.stringify({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: product.unitPrice,
        location: product.location,
      }),
      quantity: item.quantity,
      unitPrice: product.unitPrice,
      lineTotal,
    };
  });

  const year = new Date().getFullYear();
  const count = await prisma.salesChallan.count();
  const challanNumber = `CHLN-${year}-${String(count + 1).padStart(4, '0')}`;

  const customerSnapshot = JSON.stringify({
    id: customer.id,
    name: customer.name,
    mobile: customer.mobile,
    email: customer.email,
    businessName: customer.businessName,
    gstNumber: customer.gstNumber,
    address: customer.address,
    customerType: customer.customerType,
  });

  const newChallan = await prisma.$transaction(async (tx) => {
    const createdChallan = await tx.salesChallan.create({
      data: {
        challanNumber,
        customerId,
        customerSnapshot,
        totalQuantity,
        totalAmount,
        status,
        createdById: req.user!.id,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: true,
        customer: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (status === ChallanStatuses.CONFIRMED) {
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const newStock = product.currentStock - item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: newStock },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: item.quantity,
            movementType: MovementTypes.OUT,
            reason: `Sales Challan Dispatch (${challanNumber})`,
            createdById: req.user!.id,
          },
        });
      }
    }

    return createdChallan;
  });

  return res.status(201).json({ success: true, data: newChallan });
};

export const updateChallanStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status: newStatus } = updateStatusSchema.parse(req.body);

  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!challan) {
    return res.status(404).json({ success: false, error: 'Sales Challan not found.' });
  }

  if (challan.status === newStatus) {
    return res.json({ success: true, data: challan, message: 'Status is already updated.' });
  }

  try {
    const updatedChallan = await prisma.$transaction(async (tx) => {
      if (challan.status === ChallanStatuses.DRAFT && newStatus === ChallanStatuses.CONFIRMED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new Error(`Product reference not found for ID ${item.productId}`);
          }

          if (product.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`
            );
          }

          const newStock = product.currentStock - item.quantity;

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: item.quantity,
              movementType: MovementTypes.OUT,
              reason: `Challan Confirmation Dispatch (${challan.challanNumber})`,
              createdById: req.user!.id,
            },
          });
        }
      }

      if (challan.status === ChallanStatuses.CONFIRMED && newStatus === ChallanStatuses.CANCELLED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const newStock = product.currentStock + item.quantity;

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: newStock },
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantityChanged: item.quantity,
                movementType: MovementTypes.IN,
                reason: `Challan Cancellation Restock (${challan.challanNumber})`,
                createdById: req.user!.id,
              },
            });
          }
        }
      }

      return await tx.salesChallan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          items: true,
          customer: true,
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    });

    return res.json({ success: true, data: updatedChallan });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || 'Failed to update status' });
  }
};

export const downloadChallanPdf = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: true,
    },
  });

  if (!challan) {
    return res.status(404).json({ success: false, error: 'Sales Challan not found.' });
  }

  const pdfBuffer = await generateSalesChallanPdf(challan, req.user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${challan.challanNumber}.pdf`);
  return res.send(pdfBuffer);
};
