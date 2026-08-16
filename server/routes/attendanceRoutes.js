import express from 'express';
import { markAttendance, getAttendanceHistory } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authHandler.js';

const router = express.Router();

router.use(protect);

router.post('/', markAttendance);
router.get('/:employeeId', getAttendanceHistory);

export default router;
