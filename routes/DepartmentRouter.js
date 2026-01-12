const express = require("express");
const Department = require("../models/Department");

const router = express.Router();

router.post("/createDepartment", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({success: false,message: "Department name is required"});
        }
        const exist = await Department.findOne({ name });
        if (exist) {
            return res.status(409).json({success: false,message: "Department already exists"});
        }
        const department = await Department.create({ name });
        res.status(201).json({success: true, message: "Department created successfully",department});
    } catch (error) {
        res.status(500).json({success: false,message: "Server error",error: error.message});
    }
});

router.get("/", async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.json({success: true,count: departments.length, departments});
    } catch (error) {
        res.status(500).json({success: false,message: "Server error"});
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const department = await Department.findByIdAndUpdate(req.params.id,{ name },{ new: true });
        if (!department) {
            return res.status(404).json({success: false,message: "Department not found" });
        }
        res.json({ success: true, message: "Department updated successfully",department});
    } catch (error) {
        res.status(500).json({success: false, message: "Server error"});
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({success: false, message: "Department not found"});
        }
        res.json({success: true,message: "Department deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false,message: "Server error"});
    }
});

module.exports = router;
