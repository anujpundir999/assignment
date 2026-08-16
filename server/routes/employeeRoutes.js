import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authHandler.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createEmployee)
  .get(getEmployees);

router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

export default router;
