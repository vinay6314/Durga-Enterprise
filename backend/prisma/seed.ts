import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// String Constants for Enum values
const Role = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
};

const CustomerType = {
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  DISTRIBUTOR: 'DISTRIBUTOR',
};

const CustomerStatus = {
  LEAD: 'LEAD',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
};

const ChallanStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

async function main() {
  console.log('🌱 Starting seed operation...');

  // 1. Clear existing data
  await prisma.salesChallanItem.deleteMany({});
  await prisma.salesChallan.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.customerFollowUp.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create seed users with hashed passwords
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);
  const salesPasswordHash = await bcrypt.hash('Sales@123', 10);
  const warehousePasswordHash = await bcrypt.hash('Warehouse@123', 10);
  const accountsPasswordHash = await bcrypt.hash('Accounts@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Vinay Choudary',
      email: 'vinaychoudary63@gmail.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Sales',
      email: 'sales@erp.com',
      passwordHash: salesPasswordHash,
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Wayne Warehouse',
      email: 'warehouse@erp.com',
      passwordHash: warehousePasswordHash,
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Adam Accounts',
      email: 'accounts@erp.com',
      passwordHash: accountsPasswordHash,
      role: Role.ACCOUNTS,
    },
  });

  console.log('✅ Created default system users: Admin, Sales, Warehouse, Accounts.');
  console.log('ℹ️  Personal users (gmail, etc.) register themselves via Sign Up — no seed data added for them.');

  // 3. Create Sample Customers — all owned by system users (default demo data)
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Apex Wholesale Traders',
      mobile: '+91 9876543210',
      email: 'contact@apexwholesale.com',
      businessName: 'Apex Enterprise Pvt Ltd',
      gstNumber: '27AAACA12341Z2',
      customerType: CustomerType.WHOLESALE,
      address: 'Suite 401, Commerce Towers, Tech Hub, Mumbai 400051',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-15'),
      notes: 'Key bulk buyer for electronics and hardware tools. Prefers 30-day payment term.',
      createdById: admin.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Bright Retail Store',
      mobile: '+91 9812345678',
      email: 'orders@brightretail.com',
      businessName: 'Bright Retails Store LLC',
      gstNumber: '29BBBCA98761Z5',
      customerType: CustomerType.RETAIL,
      address: '12 Main Street, Market Complex, Bengaluru 560001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-12'),
      notes: 'Interested in initial trial stock of 50 units. Scheduled demo call.',
      createdById: salesUser.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Omni Global Distributors',
      mobile: '+91 9900112233',
      email: 'procurement@omniglobal.in',
      businessName: 'Omni Distribution Logistics',
      gstNumber: '07CCCCA55551Z9',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 88, Logistics Park, Sector 18, Gurugram 122015',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date('2026-08-20'),
      notes: 'Regional distributor covering North India zone.',
      createdById: admin.id,
    },
  });

  // Follow-ups
  await prisma.customerFollowUp.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Quarterly review meeting held. Customer requested 5% discount on orders > 500 units.',
        createdById: salesUser.id,
        createdAt: new Date('2026-08-01'),
      },
      {
        customerId: customer2.id,
        note: 'Sent product catalog and price list via email.',
        createdById: salesUser.id,
        createdAt: new Date('2026-08-05'),
      },
    ],
  });

  console.log('✅ Created sample customers and follow-up notes.');

  // 4. Create Sample Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Industrial Heavy Duty Drill Machine',
      sku: 'SKU-DRL-850W',
      category: 'Power Tools',
      unitPrice: 3499.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Rack A-12, Warehouse 1',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Ergonomic Executive Office Chair',
      sku: 'SKU-CHR-ERG01',
      category: 'Furniture',
      unitPrice: 6200.0,
      currentStock: 18,
      minStockAlert: 5,
      location: 'Floor B, Zone 3',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'High Precision Digital Vernier Caliper',
      sku: 'SKU-TOOL-VC150',
      category: 'Measurement Tools',
      unitPrice: 1250.0,
      currentStock: 8, // Low stock!
      minStockAlert: 15,
      location: 'Drawer C-04',
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Safety Steel Toe Work Boots (Size 9)',
      sku: 'SKU-SAF-BT09',
      category: 'Safety Equipment',
      unitPrice: 1899.0,
      currentStock: 60,
      minStockAlert: 20,
      location: 'Shelf S-09, Warehouse 2',
    },
  });

  console.log('✅ Created sample products.');

  // Stock Movement Logs
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: prod1.id,
        quantityChanged: 50,
        movementType: MovementType.IN,
        reason: 'Initial Stock Purchase Receipt PO-2026-01',
        createdById: warehouseUser.id,
        createdAt: new Date('2026-07-20'),
      },
      {
        productId: prod1.id,
        quantityChanged: 5,
        movementType: MovementType.OUT,
        reason: 'Sample unit dispatch to regional showroom',
        createdById: warehouseUser.id,
        createdAt: new Date('2026-07-25'),
      },
      {
        productId: prod3.id,
        quantityChanged: 8,
        movementType: MovementType.IN,
        reason: 'Vendor replenishment receipt',
        createdById: warehouseUser.id,
        createdAt: new Date('2026-08-02'),
      },
    ],
  });

  // 5. Create Sample Sales Challans
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CHLN-2026-0001',
      customerId: customer1.id,
      customerSnapshot: JSON.stringify({
        name: customer1.name,
        mobile: customer1.mobile,
        email: customer1.email,
        businessName: customer1.businessName,
        gstNumber: customer1.gstNumber,
        address: customer1.address,
      }),
      totalQuantity: 3,
      totalAmount: 10497.0,
      status: ChallanStatus.CONFIRMED,
      createdById: salesUser.id,
      createdAt: new Date('2026-08-08'),
      items: {
        create: [
          {
            productId: prod1.id,
            productSnapshot: JSON.stringify({
              name: prod1.name,
              sku: prod1.sku,
              category: prod1.category,
              unitPrice: prod1.unitPrice,
            }),
            quantity: 3,
            unitPrice: 3499.0,
            lineTotal: 10497.0,
          },
        ],
      },
    },
  });

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CHLN-2026-0002',
      customerId: customer3.id,
      customerSnapshot: JSON.stringify({
        name: customer3.name,
        mobile: customer3.mobile,
        email: customer3.email,
        businessName: customer3.businessName,
        gstNumber: customer3.gstNumber,
        address: customer3.address,
      }),
      totalQuantity: 4,
      totalAmount: 16198.0,
      status: ChallanStatus.DRAFT,
      createdById: salesUser.id,
      createdAt: new Date('2026-08-10'),
      items: {
        create: [
          {
            productId: prod2.id,
            productSnapshot: JSON.stringify({
              name: prod2.name,
              sku: prod2.sku,
              category: prod2.category,
              unitPrice: prod2.unitPrice,
            }),
            quantity: 2,
            unitPrice: 6200.0,
            lineTotal: 12400.0,
          },
          {
            productId: prod4.id,
            productSnapshot: JSON.stringify({
              name: prod4.name,
              sku: prod4.sku,
              category: prod4.category,
              unitPrice: prod4.unitPrice,
            }),
            quantity: 2,
            unitPrice: 1899.0,
            lineTotal: 3798.0,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample sales challans.');
  console.log('🚀 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
