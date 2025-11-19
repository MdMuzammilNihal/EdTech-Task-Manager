const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Public: get list of teachers
router.get("/teachers", async (req, res) => {
    try {
        const teachers = await User.find({ role: "teacher" }).select("_id email name");
;
        res.json({ success: true, teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
