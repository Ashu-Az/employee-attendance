const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// POST /api/attendance – mark or update attendance for one day
router.post('/', async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    // --- validation ---
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Present or Absent.' });
    }

    // Make sure the employee actually exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // If a record already exists for this employee on this date, update it
    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ ...existing.toObject(), updated: true });
    }

    // Otherwise create a fresh record
    const attendance = new Attendance({ employeeId, date, status });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark attendance.' });
  }
});

// GET /api/attendance/employee/:employeeId – all records for one person
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId }).sort({
      date: -1,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
});

// GET /api/attendance – all records, optional date-range filter
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance records.' });
  }
});

module.exports = router;
