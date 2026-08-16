import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

export const createEmployee = async (req, res, next) => {
  try {
    const { name, employeeId, department, designation, email, phone, dateOfJoining, status } = req.body;

    const existingId = await Employee.findOne({ employeeId: employeeId?.toUpperCase() });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    const existingEmail = await Employee.findOne({ email: email?.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address already exists'
      });
    }

    const employee = await Employee.create({
      name,
      employeeId,
      department,
      designation,
      email,
      phone,
      dateOfJoining,
      status
    });

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const { name, department, status } = req.query;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (department) {
      filter.department = { $regex: `^${department}$`, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId, email } = req.body;

    if (employeeId) {
      const existingId = await Employee.findOne({
        employeeId: employeeId.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    if (email) {
      const existingEmail = await Employee.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email address already exists'
        });
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Attendance.deleteMany({ employeeId: id });
    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee and associated attendance records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
