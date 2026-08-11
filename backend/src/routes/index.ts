import { Router } from 'express';
import { login, register, getMe, updateProfile } from '../controllers/authController';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUpNote,
} from '../controllers/customerController';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  recordStockMovement,
  getStockMovements,
  downloadStockLogsPdf,
} from '../controllers/productController';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
  downloadChallanPdf,
} from '../controllers/challanController';
import { getDashboardSummary } from '../controllers/dashboardController';
import { authenticateJwt } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { Roles } from '../types';

const router = Router();

// Public / Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', authenticateJwt, getMe);
router.put('/auth/profile', authenticateJwt, updateProfile);

// Dashboard
router.get('/dashboard/summary', authenticateJwt, getDashboardSummary);

// Customer CRM Routes
router.get('/customers', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES, Roles.ACCOUNTS), getCustomers);
router.get('/customers/:id', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES, Roles.ACCOUNTS), getCustomerById);
router.post('/customers', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES), createCustomer);
router.put('/customers/:id', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES), updateCustomer);
router.delete('/customers/:id', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES), deleteCustomer);
router.post('/customers/:id/followups', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES), addFollowUpNote);

// Product & Inventory Routes
router.get('/products', authenticateJwt, getProducts);
router.get('/products/stock-movements', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.WAREHOUSE), getStockMovements);
router.get('/products/stock-movements/pdf', authenticateJwt, downloadStockLogsPdf);
router.get('/products/:id', authenticateJwt, getProductById);
router.post('/products', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.WAREHOUSE), createProduct);
router.put('/products/:id', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.WAREHOUSE), updateProduct);
router.delete('/products/:id', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.WAREHOUSE), deleteProduct);
router.post('/products/:id/stock-movement', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.WAREHOUSE), recordStockMovement);

// Sales Challan & Invoice Routes
router.get('/challans', authenticateJwt, getChallans);
router.get('/challans/:id', authenticateJwt, getChallanById);
router.get('/challans/:id/pdf', authenticateJwt, downloadChallanPdf);
router.post('/challans', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES), createChallan);
router.put('/challans/:id/status', authenticateJwt, authorizeRoles(Roles.ADMIN, Roles.SALES, Roles.WAREHOUSE, Roles.ACCOUNTS), updateChallanStatus);

export default router;
