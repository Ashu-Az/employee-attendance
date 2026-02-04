const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required.'],
    },
    date: {
      type: String,
      required: [true, 'Date is required.'],
    },
    status: {
      type: String,
      required: [true, 'Status is required.'],
      enum: {
        values: ['Present', 'Absent'],
        message: 'Status must be either Present or Absent.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// One attendance entry per employee per day – no duplicates
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
