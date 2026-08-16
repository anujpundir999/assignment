import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();

    const departmentHeadcount = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          department: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const todayRecords = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayAttendance = {
      present: 0,
      absent: 0,
      onLeave: 0
    };

    todayRecords.forEach(record => {
      if (record.status === 'Present') todayAttendance.present += 1;
      else if (record.status === 'Absent') todayAttendance.absent += 1;
      else if (record.status === 'On Leave') todayAttendance.onLeave += 1;
    });

    res.status(200).json({
      success: true,
      totalEmployees,
      departmentHeadcount,
      todayAttendance
    });
  } catch (error) {
    next(error);
  }
};
