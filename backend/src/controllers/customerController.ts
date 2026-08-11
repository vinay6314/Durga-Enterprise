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
  const payload = customerSchema.parse(req.body);

  const customer = await prisma.customer.create({
    data: {
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      businessName: payload.businessName,
      gstNumber: payload.gstNumber,
      customerType: payload.customerType,
      address: payload.address,
      status: payload.status,
      notes: payload.notes,
      followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
      createdById: req.user?.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return res.status(201).json({ success: true, data: customer });
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = customerSchema.partial().parse(req.body);

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Customer not found.' });
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.mobile && { mobile: payload.mobile }),
      ...(payload.email && { email: payload.email }),
      ...(payload.businessName && { businessName: payload.businessName }),
      ...(payload.gstNumber !== undefined && { gstNumber: payload.gstNumber }),
      ...(payload.customerType && { customerType: payload.customerType }),
      ...(payload.address && { address: payload.address }),
      ...(payload.status && { status: payload.status }),
      ...(payload.notes !== undefined && { notes: payload.notes }),
      ...(payload.followUpDate !== undefined && {
        followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
      }),
    },
  });

  return res.json({ success: true, data: updated });
};

export const addFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
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
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Customer not found.' });
  }

  // Delete related follow-ups first
  await prisma.customerFollowUp.deleteMany({ where: { customerId: id } });
  
  // Delete customer
  await prisma.customer.delete({ where: { id } });

  return res.json({ success: true, message: `Customer "${customer.name}" deleted successfully.` });
};
