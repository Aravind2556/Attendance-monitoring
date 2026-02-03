const express = require("express");
const Timetable = require('../models/TimeTable');
const isAuth = require("../middleware/isAuth");
const TimeTable = require("../models/TimeTable");
const UserModel = require("../models/User");
const Department = require("../models/Department");
const Alert = require("../models/Alert")
const Year = require('../models/Year')
const Classes = require('../models/Class');
const { sendParentSMS } = require("../utils/sendMail");

const router = express.Router();

// router.post('/create-timetable', isAuth, async (req, res) => {
//     try {
//         const { day, periodNo, startTime, endTime, year, classes, subject, staff } = req.body

//         console.log("create time table", day, periodNo, startTime, endTime, year, classes, subject, staff)

//         if (!day || !periodNo || !startTime || !endTime || !year || !classes || !subject || !staff)
//             return res.status(402).send({ success: false, message: "All fileds are required" })

//         const fetchStaff = await UserModel.findOne({ _id: staff })

//         if (!fetchStaff)
//             return res.status(402).send({ success: false, message: "Staff not saved" })


//         const newTable = await Timetable({
//             day, periodNo, startTime, endTime, year, class: classes, subject, staff: {
//                 id: fetchStaff._id,
//                 name: fetchStaff.name
//             }
//         })

//         const saveTimetable = await newTable.save()

//         if (!saveTimetable)
//             return res.status(402).send({ success: false, message: "Time Table not saved" })

//         return res.status(200).send({ success: true, message: "Time Table saved successfully" })


//     }
//     catch (err) {
//         console.log("Error in create Timetable:", err)
//         return res.send({ success: false, message: 'Trouble in create Time table! Please contact support Team.' })
//     }
// })


router.post('/create-timetable', isAuth, async (req, res) => {
    try {
        console.log("It works")
        const { day, periodNo, startTime, endTime, year, classes, subject, staff } = req.body;

        console.log("Create Timetable Payload:", req.body);


        if (
            !day ||
            !periodNo ||
            !startTime ||
            !endTime ||
            !year ||
            !Array.isArray(classes) ||
            classes.length === 0 ||
            !subject ||
            !staff
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const fetchStaff = await UserModel.findById(staff);
        if (!fetchStaff) {
            return res.status(400).json({
                success: false,
                message: "Staff not found"
            });
        }

        const newTable = new Timetable({
            day: day.toLowerCase(),
            periodNo,
            startTime,
            endTime,
            department: req.session.user.department,
            year,
            classes,
            subject,
            staff: {
                id: fetchStaff._id,
                name: fetchStaff.fullname || fetchStaff.name || fetchStaff.email,
                email: fetchStaff.email
            }
        });

        await newTable.save();

        return res.status(200).json({
            success: true,
            message: "Time Table saved successfully"
        });

    } catch (err) {
        console.error("Error in create Timetable:", err);
        return res.status(500).json({
            success: false,
            message: "Server error while creating timetable"
        });
    }
});



router.get('/fetch-timetable/:year', isAuth, async (req, res) => {
    try {
        if (req.session.user.role !== "hod") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const { year } = req.params; // 👈 year from URL

        const fetchYear = await Year.findOne({ year: year })
        if (!fetchYear)
            return res.status(402).json({
                success: false, message: "There is no year for this Deptarment"
            });


        const timetable = await Timetable.aggregate([

            // 🔹 0. FILTER BY YEAR (only change needed)
            {
                $match: {
                    year: String(fetchYear._id)
                }
            },

            // 1. Sort so periods appear in correct order
            { $sort: { year: 1, classes: 1, day: 1, periodNo: 1 } },

            // 2. Group by year + class + day
            {
                $group: {
                    _id: {
                        year: "$year",
                        classes: "$classes",
                        day: "$day"
                    },
                    periods: {
                        $push: {
                            periodNo: "$periodNo",
                            startTime: "$startTime",
                            endTime: "$endTime",
                            subject: "$subject",
                            staff: "$staff"
                        }
                    }
                }
            },

            // 3. Group by year + class
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        classes: "$_id.classes"
                    },
                    days: {
                        $push: {
                            day: "$_id.day",
                            periods: "$periods"
                        }
                    }
                }
            },

            // 4. Group by year
            {
                $group: {
                    _id: "$_id.year",
                    classes: {
                        $push: {
                            class: "$_id.classes",
                            days: "$days"
                        }
                    }
                }
            },

            // 5. Beautify output
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    classes: 1
                }
            }
        ]);
        console.log("Timetable is:", timetable)
        if (!timetable.length) {
            return res.status(404).json({ success: false, message: "No Timetable found for this year" });
        }

        return res.status(200).json({
            success: true,
            message: "HOD timetable fetched",
            timetable
        });

    } catch (err) {
        console.log("Timetable fetch error:", err);
        return res.status(500).json({ success: false, message: "Failed to load timetable" });
    }
});

router.post('/timetable/:id', isAuth, async (req, res) => {
    try {
        const id = req.params.id

        if (!id)
            return res.status(402).send({ success: false, message: "Id not fetched" })

        const { day, periodNo, startTime, endTime, year, classes, subject, staff } = req.body

        if (!day || !periodNo || !startTime || !endTime || !year || !classes || !subject || !staff)
            return res.status(402).send({ success: false, message: "All fileds are required" })

        const fetchStaff = await UserModel.findOne({ _id: staff })

        if (!fetchStaff)
            return res.status(402).send({ success: false, message: "Staff not saved" })

        const isTimePresent = await TimeTable.findOne({ _id: id })

        if (!isTimePresent)
            return res.status(402).send({ success: false, message: "There is No Timetable for this ID" })

        const updateTime = await TimeTable.findOneAndUpdate({ _id: id }, {
            $set: {
                day, periodNo, startTime, endTime, year, class: classes, subject, staff: {
                    id: fetchStaff._id,
                    name: fetchStaff.name
                }
            }
        }, {
            new: true
        })

        if (!updateTime)
            return res.status(400).json({ success: false, message: "Timetable Update Failed. Try again" })

        return res.status(200).json({ success: true, message: "UpdateTimetable  Data Successfully" })


    }
    catch (err) {
        console.log("Error in Update Timetable:", err)
        return res.send({ success: false, message: 'Trouble in Update Time table! Please contact support Team.' })
    }
})


router.get('/fetch-stafftimetable/:year', isAuth, async (req, res) => {
    try {
        const staffId = String(req.session.user._id);   // logged in staff
        console.log("StaffID", staffId)
        if (!staffId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const { year } = req.params; // 👈 year from URL

        const fetchYear = await Year.findOne({ year: year })
        if (!fetchYear)
            return res.status(402).json({
                success: false, message: "There is no year for this Deptarment"
            });


        const timetable = await Timetable.aggregate([

            // 🔹 0. FILTER BY YEAR (only change needed)
            {
                $match: {
                    year: String(fetchYear._id),
                    'staff.id': staffId
                }
            },

            // 1. Sort so periods appear in correct order
            { $sort: { year: 1, classes: 1, day: 1, periodNo: 1 } },

            // 2. Group by year + class + day
            {
                $group: {
                    _id: {
                        year: "$year",
                        classes: "$classes",
                        day: "$day"
                    },
                    periods: {
                        $push: {
                            periodNo: "$periodNo",
                            startTime: "$startTime",
                            endTime: "$endTime",
                            subject: "$subject",
                            staff: "$staff"
                        }
                    }
                }
            },

            // 3. Group by year + class
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        classes: "$_id.classes"
                    },
                    days: {
                        $push: {
                            day: "$_id.day",
                            periods: "$periods"
                        }
                    }
                }
            },

            // 4. Group by year
            {
                $group: {
                    _id: "$_id.year",
                    classes: {
                        $push: {
                            class: "$_id.classes",
                            days: "$days"
                        }
                    }
                }
            },

            // 5. Beautify output
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    classes: 1
                }
            }
        ]);
        console.log("Timetable:::", timetable)
        if (!timetable.length) {
            return res.status(404).json({
                success: false,
                message: "No Timetable found for the staff"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Staff timetable fetched",
            timetable
        });

    } catch (err) {
        console.log("Timetable fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load timetable"
        });
    }
});


router.get('/fetch-staff', isAuth, async (req, res) => {
    try {

        const fetchStaff = await UserModel.find({ role: 'staff' })


        if (!fetchStaff) {
            return res.status(404).json({ success: false, message: "No Staff found" });
        }

        return res.status(200).json({
            success: true,
            message: "HOD Staff fetched",
            staff: fetchStaff
        });

    } catch (err) {
        console.log("Timetable fetch error:", err);
        return res.status(500).json({ success: false, message: "Failed to load timetable" });

    }
})

router.get('/staff/:id', isAuth, async (req, res) => {
    try {

        const id = req.params.id

        if (!id)
            return res.status(402).send({ success: false, message: "Id not fetched" })

        const fetchStaff = [];

        const staff = await UserModel.findOne({ _id: id });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        const department = await Department.findOne({ _id: staff.department });

        fetchStaff.push({
            staff,
            department
        });

        console.log("fetchStaffss", fetchStaff);
        if (!fetchStaff) {
            return res.status(404).json({ success: false, message: "No Staff found" });
        }

        return res.status(200).json({
            success: true,
            message: "HOD Staff fetched",
            staff: fetchStaff
        });

    } catch (err) {
        console.log("Timetable fetch error:", err);
        return res.status(500).json({ success: false, message: "Failed to load Staff data" });

    }
})


router.get('/fetch-students', isAuth, async (req, res) => {
    try {
        const fetchStuents = await UserModel.find({ role: 'student' })
        if (!fetchStuents) {
            return res.status(404).json({ success: false, message: "No Student found" });
        }
        return res.status(200).json({ success: true, message: "HOD Students fetched", students: fetchStuents });

    } catch (err) {
        console.log("Students fetch error:", err);
        return res.status(500).json({ success: false, message: "Failed to load Students" });
    }
})


router.get("/fetchHod", async (req, res) => {
    try {
        const findHod = await UserModel.find({ role: "hod" })
        return res.json({ success: true, count: findHod.length, hods: findHod });

    } catch (err) {
        console.log("HOD fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load HODs"
        });
    }
});


router.get("/fetchCurrentHod", async (req, res) => {
    try {
        console.log("req.session.user._idss", req.session.user)
        const hod = await UserModel.findOne({
            _id: req.session.user._id,
            role: "hod"
        })

        if (!hod) {
            return res.json({
                success: false,
                message: "HOD not found in that CurrentYSesr"
            });
        }

        return res.json({
            success: true,
            hod
        });

    } catch (err) {
        console.log("HOD fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load HOD"
        });
    }
});

router.get('/fetch-tutortimetable', isAuth, async (req, res) => {
    try {
        const staffId = String(req.session.user._id);   // logged in staff
        console.log("StaffID", staffId)
        if (!staffId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const fetchTutor = await UserModel.findOne({ _id: staffId })
        const fetchYear = await Year.findOne({ _id: fetchTutor.year[0] })
        if (!fetchYear)
            return res.status(402).json({
                success: false, message: "There is no year for this Deptarment"
            });

        const fetchClass = await Classes.findOne({ _id: fetchTutor.class[0] })
        if (!fetchYear)
            return res.status(402).json({
                success: false, message: "There is no year for this Deptarment"
            });
        const timetable = await Timetable.aggregate([

            // 🔹 0. FILTER BY YEAR (only change needed)
            {
                $match: {
                    year: String(fetchYear._id),
                    classes: String(fetchClass._id)
                }
            },

            // 1. Sort so periods appear in correct order
            { $sort: { year: 1, classes: 1, day: 1, periodNo: 1 } },

            // 2. Group by year + class + day
            {
                $group: {
                    _id: {
                        year: "$year",
                        classes: "$classes",
                        day: "$day"
                    },
                    periods: {
                        $push: {
                            periodNo: "$periodNo",
                            startTime: "$startTime",
                            endTime: "$endTime",
                            subject: "$subject",
                            staff: "$staff"
                        }
                    }
                }
            },

            // 3. Group by year + class
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        classes: "$_id.classes"
                    },
                    days: {
                        $push: {
                            day: "$_id.day",
                            periods: "$periods"
                        }
                    }
                }
            },

            // 4. Group by year
            {
                $group: {
                    _id: "$_id.year",
                    classes: {
                        $push: {
                            class: "$_id.classes",
                            days: "$days"
                        }
                    }
                }
            },

            // 5. Beautify output
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    classes: 1
                }
            }
        ]);
        console.log("Timetable:::", timetable)
        if (!timetable.length) {
            return res.status(404).json({
                success: false,
                message: "No Timetable found for the staff"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Staff timetable fetched",
            timetable
        });

    } catch (err) {
        console.log("Timetable fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load timetable"
        });
    }
});




router.get("/fetchCurrentHodStaffs", async (req, res) => {
    try {
        // 🔒 Session check
        if (!req.session?.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { role, department } = req.session.user;

        // 🔒 Role must be HOD
        if (role !== "hod") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only HOD can access staff list."
            });
        }

        // 🔥 Fetch STAFF + TUTOR under same department
        const staffs = await UserModel.find({
            department: department,
            role: { $in: ["staff", "tutor"] }
        }).select("-password"); // hide password

        return res.status(200).json({
            success: true,
            staffs
        });

    } catch (err) {
        console.error("HOD staff fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to load staff"
        });
    }
});


router.get("/fetchtimetables", async (req, res) => {
    try {
        const { year } = req.query;

        // validation
        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Year query parameter is required"
            });
        }

        // fetch timetable for that year
        const timetables = await Timetable.find({ year })
            .sort({ day: 1, periodNo: 1 });

        return res.status(200).json({
            success: true,
            timetables
        });

    } catch (error) {
        console.error("Fetch timetable error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch timetables"
        });
    }
});



router.get('/fetch-alerts', async (req, res) => {
    try {
        const user = req.session.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        let alerts = [];

        // 🎓 STUDENT → own alerts only
        if (user.role === "student") {
            alerts = await Alert.find({
                studentId: user._id
            }).sort({ date: -1 });
        }

        // 👨‍🏫 STAFF / TUTOR → department + year
        else if (user.role === "staff" || user.role === "tutor") {
            alerts = await Alert.find({
                department: user.department,
                year: user.year
            }).sort({ date: -1 });
        }

        // 🧑‍💼 HOD → department wise (all years)
        else if (user.role === "hod") {
            alerts = await Alert.find({
                department: user.department
            }).sort({ date: -1 });
            // await sendParentSMS({
            //     to: '+918438919248',
            //     // to: '+919952497638',
            //     studentName: 'Keerthi',
            //     date: new Date()
            // });

        }

        return res.json({
            success: true,
            count: alerts.length,
            alerts
        });

    } catch (err) {
        console.log("Fetch alert error:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching alerts"
        });
    }
});





module.exports = router