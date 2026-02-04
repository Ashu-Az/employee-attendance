const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required.'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address.',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required.'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
