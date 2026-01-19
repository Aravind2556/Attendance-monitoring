const mongoose = require('mongoose')
const Express = require('express')
const UserModel = require('../models/User')
const ClassModel = require('../models/Class')
const isAuth = require('../middleware/isAuth')
const AuthRouter = Express.Router()

AuthRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.send({ success: false, message: 'Please provide all details!' })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.send({ success: false, message: 'Invalid Email!' })
        }

        if (user.password !== password) {
            return res.send({ success: false, message: "Invalid Password!" })
        }

        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            contact: user.contact,
            role: user.role,
            department: user.department
        }

        req.session.save((err) => {
            if (err) {
                return res.send({ success: false, message: "Failed to create session!" })
            }

            return res.send({ success: true, message: "Logged in successfully!", user: req.session.user })
        })

    }
    catch (err) {
        console.log("Error in login:", err)
        return res.send({ success: false, message: 'Trouble in login! Please contact support Team.' })
    }
})


// AuthRouter.post('/register', async (req, res) => {
//     try {
//         const { fullname, email, contact, password, gender, department, classes, year, registerNumber, parentEmail, parentContact, empId, isTutor, isHod } = req.body

//         if (!fullname || !email || !contact || !password || gender) {
//             return res.send({ success: false, message: 'Please provide all details!' })
//         }

//         const fetchUser = await UserModel.findOne({ email: email.toLowerCase() })
//         if (fetchUser) {
//             return res.send({ success: false, message: 'Account already exist! Please try login.' })
//         }

//         let Users = await UserModel.find({});
//         let userId;
//         if (Users.length > 0) {
//             let last_user = Users.slice(-1)[0];
//             userId = last_user.id + 1;
//         } else {
//             userId = 1
//         }

//         const newUser = {
//             id: userId,
//             fullname: fullname,
//             email: email,
//             contact: contact,
//             password: password,
//             gender: gender
//         }
//         if (req.session.user.role === 'admin') newUser.role = 'hod'
//         else if (req.session.user.role === 'hod') newUser.role = 'staff'
//         else if (req.session.user.role === 'staff') newUser.role = 'student'
//         else newUser.role = 'admin'


//         if (depardepartment?.id && department?.nametment) {
//             newUser.department.id = department.id
//             newUser.department.name = department.name
//         }
//         if (classes) newUser.class = classes
//         if (year) newUser.year = year
//         if (registerNumber) newUser.registerNumber = registerNumber
//         if (parentEmail) newUser.parentEmail = parentEmail
//         if (parentContact) newUser.parentContact = parentContact
//         if (empId) newUser.empId = empId
//         if (isTutor) newUser.isTutor = isTutor
//         if (isHod) newUser.isHod = isHod

//         const createUser = new UserModel(newUser)

//         const saveUser = await createUser.save()

//         if (saveUser) {

//             req.session.user = {
//                 _id: saveUser._id,
//                 id: saveUser.id,
//                 fullname: saveUser.fullname,
//                 email: saveUser.email,
//                 contact: saveUser.contact,
//                 role: saveUser.role,
//                 department: saveUser.department
//             }

//             req.session.save((err) => {
//                 if (err) {
//                     return res.send({ success: false, message: "Failed to create session!" })
//                 }

//                 return res.send({ success: true, message: "User Registration successfully!", user: req.session.user })
//             })

//         }
//         else {
//             return res.send({ success: false, message: 'Failed to create User!' })
//         }

//     }
//     catch (err) {
//         console.log("Error in Register:", err)
//         return res.send({ success: false, message: 'Trouble in Registration! Please contact admin.' })
//     }
// })



AuthRouter.post("/register", async (req, res) => {
    try {
        const {
            fullname,
            email,
            contact,
            password,
            gender,
            department,
            registerNumber,
            parentEmail,
            parentContact,
            isTutor,
            classes,
            year
        } = req.body;

        // 1️⃣ Validation
        if (!fullname || !email || !contact || !password || !gender) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required details"
            });
        }
        console.log(fullname, email, contact, password, gender, classes, year, isTutor)

        // 2️⃣ Check existing user
        const fetchUser = await UserModel.findOne({
            email: email.toLowerCase()
        });

        if (fetchUser) {
            return res.status(409).json({
                success: false,
                message: "Account already exists"
            });
        }


        let Users = await UserModel.find({}).sort({ id: -1 }).limit(1);

        let userId = 1;

        if (Users.length > 0 && !isNaN(Number(Users[0].id))) {
            userId = Number(Users[0].id) + 1;
        }


        // 4️⃣ Base user object
        const newUser = {
            id: userId,
            fullname,
            email: email.toLowerCase(),
            contact,
            password,
            gender
        };

        // 5️⃣ Role assignment (based on creator)
        if (req.session?.user?.role === "admin") newUser.role = "hod";
        else if (req.session?.user?.role === "hod" && isTutor)  newUser.role = "tutor";
        else if (req.session?.user?.role === "hod") newUser.role = "staff";
        else if (req.session?.user?.role === "tutor") newUser.role = "student";
        else newUser.role = "admin";

        // 6️⃣ Optional fields (schema-safe)
        if (req.session?.user?.role === "admin"){
            if (department) newUser.department = department;
        }
        else{
            newUser.department = req?.session?.user?.department
        }

        console.log("req?.session?.user?.department", req?.session?.user?.department)

        const findClasses = await ClassModel.find({
            department: String(department)
        });
        if (findClasses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No classes found for this department"
            });
        }
        const classIds = findClasses.map(cls => cls._id.toString());
        const yearIds = [
            ...new Set(findClasses.map(cls => cls.year.toString()))
        ];

        if (registerNumber) newUser.registerNumber = registerNumber;
        if (parentEmail) newUser.parentEmail = parentEmail;
        if (parentContact) newUser.parentContact = parentContact;
        if (isTutor) newUser.isTutor = isTutor;

        if (classes) newUser.class = classes
        if (year) newUser.year = year

        if (req.session?.user?.role === "admin") {
            newUser.isHod = true;
            if (Array.isArray(classIds)) newUser.class = classIds;
            if (Array.isArray(yearIds)) newUser.year = yearIds;
        }

        // 7️⃣ Save user
        const saveUser = await UserModel.create(newUser);

            if (saveUser) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to create session"
                });
            }

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
            });
     
    } catch (err) {
        console.error("Error in Register:", err);
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please contact admin."
        });
    }
});



AuthRouter.get('/checkauth', async (req, res) => {
    try {
        if (req.session.user) {

            const fetchUser = await UserModel.findOne({ email: req.session.user.email.toLowerCase() }).select("-password -_id")
            if (!fetchUser) {
                return res.send({ success: false, message: 'User not found!' })
            }

            return res.send({ success: true, user: fetchUser, message: "Successfully fetched the current logged in User!" })
        }
        else {
            return res.send({ success: false, message: "No loggin detected! please login and try again." })
        }
    }
    catch (err) {
        console.log("Error in Checking Authentication:", err)
        return res.send({ success: false, message: 'Trouble in Checking Authentication! Please contact support Team.' })
    }
})


AuthRouter.get('/logout', isAuth, async (req, res) => {
    try {
        if (req.session.user) {
            req.session.destroy((err) => {
                if (err) {
                    console.log("Error in destroying session:", err);
                    return res.send({ success: false, message: "Failed to log out! Please contact developer." });
                }
                return res.send({ success: true, message: "Logged out successfully!" });
            });
        }
        else {
            return res.send({ success: false, message: "Please login and try again later!" })
        }
    }
    catch (err) {
        console.log("Trouble in logging out:", err)
        return res.send({ success: false, message: "Trouble in logging out! Please contact support Team." })
    }
})


module.exports = AuthRouter