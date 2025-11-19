const express = require("express");
const router = express.Router();
const { authRequired } = require("../middlewares/authMiddleware");
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

router.get("/", authRequired, getTasks);
router.post("/", authRequired, createTask);
router.put("/:id", authRequired, updateTask);
router.delete("/:id", authRequired, deleteTask);

module.exports = router;
