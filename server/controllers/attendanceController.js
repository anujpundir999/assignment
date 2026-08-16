import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, date, and status are required'
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const normalizedDate = new Date(Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    ));

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: normalizedDate },
      { status },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const history = await Attendance.find({ employeeId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};
