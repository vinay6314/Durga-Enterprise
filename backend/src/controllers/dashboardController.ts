import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { ChallanStatuses } from '../types';

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  const customerWhere: any = {};
  const challanWhere: any = {};

  const [
    totalCustomers,
    activeCustomers,
    leadCustomers,
    totalProducts,
    allProducts,
    totalChallans,
    confirmedChallans,
    recentChallans,
  ] = await Promise.all([
    prisma.customer.count({ where: customerWhere }),
    prisma.customer.count({ where: { ...customerWhere, status: 'ACTIVE' } }),
    prisma.customer.count({ where: { ...customerWhere, status: 'LEAD' } }),
    prisma.product.count(),
    prisma.product.findMany({ select: { currentStock: true, minStockAlert: true, unitPrice: true } }),
    prisma.salesChallan.count({ where: challanWhere }),
    prisma.salesChallan.findMany({
      where: { ...challanWhere, status: ChallanStatuses.CONFIRMED },
      select: { totalAmount: true },
    }),
    prisma.salesChallan.findMany({
      where: challanWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, businessName: true } },
      },
    }),
  ]);

  const lowStockProductsCount = allProducts.filter((p) => p.currentStock <= p.minStockAlert).length;
  const totalStockValue = allProducts.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
  const totalRevenue = confirmedChallans.reduce((acc, c) => acc + c.totalAmount, 0);

  return res.json({
    success: true,
    data: {
      metrics: {
        totalCustomers,
        activeCustomers,
        leadCustomers,
        totalProducts,
        lowStockProductsCount,
        totalStockValue,
        totalChallans,
        totalRevenue,
      },
      recentChallans,
    },
  });
};
