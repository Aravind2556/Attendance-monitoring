const express = require("express");
const ClassModel = require("../models/Class");

const router = express.Router();

router.post("/createClass", async (req, res) => {
    try {
        const { section, number, department, year } = req.body;
        if (!section || !number || !department || !year) {
            return res.status(400).json({success: false,message: "All fields are required"});
        }
        const existingClass = await ClassModel.findOne({ number });
        if (existingClass) {
            return res.status(409).json({success: false,message: "Class already exists"});
        }

        const newClass = await ClassModel.create({
            section,
            number,
            department,
            year
        });

        if(!newClass){
            return res.status(201).json({ success: false, message: "failed to create class"});
        }

        return res.status(201).json({success: true,message: "Class created successfully", class: newClass});

    } catch (error) {
        return res.status(500).json({success: false, message: "Server error", error: error.message});
    }
});


router.get("/fetchClass", async (req, res) => {
    try {
        const classes = await ClassModel.find({});
        console.log("classes",classes)
        return res.json({success: true,count: classes.length,classes});
    } catch (error) {
        return res.status(500).json({success: false,message: "Server error"});
    }
});


router.put("/updateClass/:id", async (req, res) => {
    try {
        const { section, number, department, year } = req.body;
        if (!section || !number || !department || !year) {
            return res.status(400).json({success: false, message: "All fields are required"});
        }
        const updatedClass = await ClassModel.findByIdAndUpdate(
            req.params.id,
            { section, number, department, year },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({success: false,message: "Class not found"});
        }

        return res.json({success: true,message: "Class updated successfully",class: updatedClass});

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error",error: error.message});
    }
});


router.delete("/deleteClass/:id", async (req, res) => {
    try {
        const deleteClass = await ClassModel.findByIdAndDelete(req.params.id);
        if (!deleteClass) {
            return res.status(404).json({success: false, message: "Class not found"});
        }
        res.json({success: true,message: "Class deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false,message: "Server error"});
    }
});

module.exports = router;
