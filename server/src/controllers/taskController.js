const Task = require("../models/Task");
const User = require("../models/User");
const { validationResult } = require("express-validator");

exports.getTasks = async (req, res, next) => {
  try {
    const user = req.user;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Date Filters
    let dueFilter = {};
    if (req.query.due === "today") {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      dueFilter.dueDate = { $gte: start, $lte: end };
    } else if (req.query.due === "week") {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setDate(end.getDate() + 7);
      dueFilter.dueDate = { $gte: start, $lte: end };
    } else if (req.query.due === "overdue") {
      const now = new Date();
      dueFilter.dueDate = { $lt: now };
    }

    // Role-based access
    let baseQuery = {};

    if (user.role === "student") {
      baseQuery.userId = user._id;
    } else {
      // Teacher: find assigned students
      const assignedStudents = await User.find({ teacherId: user._id }).select("_id");
      const studentIds = assignedStudents.map((s) => s._id);

      baseQuery.userId = { $in: [...studentIds, user._id] };
    }

    const finalQuery = { ...baseQuery, ...dueFilter };

    // Fetch tasks with pagination
    const tasks = await Task.find(finalQuery)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(finalQuery);

    return res.json({
      success: true,
      tasks,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
    try {
        const { title, description, dueDate } = req.body;

        const task = await Task.create({
            userId: req.user._id,
            title,
            description,
            dueDate
        });

        res.status(201).json({ success: true, task });
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Only owner can update
        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        const { title, description, progress } = req.body;

        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.progress = progress ?? task.progress;

        await task.save();

        res.json({ success: true, task });
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Only owner can delete
        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        await task.deleteOne();

        res.json({ success: true, message: "Task deleted" });
    } catch (err) {
        next(err);
    }
};
