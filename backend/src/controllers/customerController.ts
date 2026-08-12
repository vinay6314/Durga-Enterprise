import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { CustomerType, CustomerStatus } from '../types';

const prisma = new PrismaClient();

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(5, 'Mobile number is required'),
  email: z.string().email(),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.string().default('RETAIL'),
  address: z.string().min(3, 'Address is required'),
  status: z.string().default('LEAD'),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const followUpSchema = z.object({
  note: z.string().min(2, 'Follow-up note cannot be empty'),
});

const parseDateSafely = (dateStr?: string | null): Date | null => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return null;

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);

    // Format DD-MM-YYYY
    if (p1 <= 31 && p2 <= 12 && p3 > 1900) {
      const customDate = new Date(p3, p2 - 1, p1);
      if (!isNaN(customDate.getTime())) return customDate;
    }
    // Format YYYY-MM-DD
    if (p1 > 1900 && p2 <= 12 && p3 <= 31) {
      const customDate = new Date(p1, p2 - 1, p3);
      if (!isNaN(customDate.getTime())) return customDate;
    }
  }

  return null;
};

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const status = req.query.status as string | undefined;
  const customerType = req.query.customerType as string | undefined;

  const skip = (page - 1) * limit;
  const whereCondition: any = {};
  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search } },
        { businessName: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ],
    });
  }

  if (status) {
    whereCondition.status = status;
  }

  if (customerType) {
    whereCondition.customerType = customerType;
  }

  if (andConditions.length > 0) {
    whereCondition.AND = andConditions;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { followUps: true, challans: true } },
      },
    }),
    prisma.customer.count({ where: whereCondition }),
  ]);

  return res.json({
    success: true,
    data: customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      challans: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          challanNumber: true,
          totalQuantity: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found.' });
  }

  return res.json({ success: true, data: customer });
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = customerSchema.parse(req.body);
    const followUpDate = parseDateSafely(payload.followUpDate);

    const customer = await prisma.customer.create({
      data: {
        name: payload.name,
        mobile: payload.mobile,
        email: payload.email,
        businessName: payload.businessName,
        gstNumber: payload.gstNumber || null,
        customerType: payload.customerType,
        address: payload.address,
        status: payload.status,
        notes: payload.notes || null,
        followUpDate,
        createdById: req.user?.id || null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: messages });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to save customer.' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payload = customerSchema.partial().parse(req.body);

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const followUpDate = payload.followUpDate !== undefined ? parseDateSafely(payload.followUpDate) : undefined;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.mobile && { mobile: payload.mobile }),
        ...(payload.email && { email: payload.email }),
        ...(payload.businessName && { businessName: payload.businessName }),
        ...(payload.gstNumber !== undefined && { gstNumber: payload.gstNumber || null }),
        ...(payload.customerType && { customerType: payload.customerType }),
        ...(payload.address && { address: payload.address }),
        ...(payload.status && { status: payload.status }),
        ...(payload.notes !== undefined && { notes: payload.notes || null }),
        ...(followUpDate !== undefined && { followUpDate }),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: messages });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to save customer.' });
  }
};

export const addFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { note } = followUpSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId: id,
        note,
        createdById: req.user!.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.status(201).json({ success: true, data: followUp });
  } catch (error: any) {
    console.error('Error adding follow up note:', error);
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, error: messages });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to add follow-up note.' });
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          select: { id: true },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    const challanIds = customer.challans.map((c) => c.id);

    await prisma.$transaction(async (tx) => {
      // Delete items of associated sales challans if any exist
      if (challanIds.length > 0) {
        await tx.salesChallanItem.deleteMany({
          where: { challanId: { in: challanIds } },
        });

        // Delete associated sales challans
        await tx.salesChallan.deleteMany({
          where: { id: { in: challanIds } },
        });
      }

      // Delete related follow-up notes
      await tx.customerFollowUp.deleteMany({ where: { customerId: id } });

      // Delete customer
      await tx.customer.delete({ where: { id } });
    });

    return res.json({
      success: true,
      message: `Customer "${customer.name}" and associated records deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete customer.',
    });
  }
};
