const express = require("express");
const Year = require("../models/Year");

const router = express.Router();

router.post("/createYear", async (req, res) => {
    try {
        const { year } = req.body;
        if (!year) {
            return res.status(400).json({success: false,message: "Year is required"});
        }
        const exist = await Year.findOne({ year });
        if (exist) { 
            return res.status(409).json({success: false,message: "Year already exists"});
        }
        const newYear = await Year.create({ year });
        if (!newYear){
            return res.status(201).json({ success: false, message: "Failed to create year"});

        }
        return res.status(201).json({success: true,message: "Year created successfully",year: newYear});

    } catch (error) {
        return res.status(500).json({success: false,message: "Server error",error: error.message});
    }
});


router.get("/fetchYear", async (req, res) => {
    try {
        const years = await Year.find({});
        if(!years){
          return res.json({success : false , message : ""})
        }
        return res.json({ success: true, count: years.length, years });
    } catch (error) {
        return res.status(500).json({success: false,message: "Server error"});
    }
});

router.put("/updateYear/:id", async (req, res) => {
    try {
        const { year } = req.body;
        console.log("updated year",year)
        const updatedYear = await Year.findByIdAndUpdate(req.params.id,{ year },{ new: true });
        if (!updatedYear) {
            return res.status(404).json({success: false,message: "Year not found" });
        }
        res.json({ success: true, message: "Year updated successfully",year : updatedYear});
    } catch (error) {
        res.status(500).json({success: false, message: "Server error"});
    }
});

router.delete("/deleteYear/:id", async (req, res) => {
    try {
        const deleteYear = await Year.findByIdAndDelete(req.params.id);
        if (!deleteYear) {
            return res.status(404).json({success: false, message: "Year not found"});
        }
        res.json({success: true,message: "Year deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false,message: "Server error"});
    }
});

module.exports = router;
