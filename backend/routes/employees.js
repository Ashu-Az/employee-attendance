const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// GET /api/employees – list every employee, newest first
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch employees.' });
  }
});

// POST /api/employees – create a new employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, fullName, email, department } = req.body;

    // --- validation ---
    if (!employeeId || !fullName || !email || !department) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Check for an existing employee with the same ID
    const duplicate = await Employee.findOne({ employeeId: employeeId.trim() });
    if (duplicate) {
      return res.status(409).json({
        message: `Employee ID "${employeeId.trim()}" is already taken.`,
      });
    }

    // --- create ---
    const employee = new Employee({
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      department: department.trim(),
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    // Mongoose unique-index race condition
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Employee ID already exists.' });
    }
    res.status(500).json({ message: 'Failed to create employee.' });
  }
});

// DELETE /api/employees/:id – remove employee + their attendance
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Clean up attendance records so nothing is left orphaned
    await Attendance.deleteMany({ employeeId: employee.employeeId });

    res.json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee.' });
  }
});

module.exports = router;
