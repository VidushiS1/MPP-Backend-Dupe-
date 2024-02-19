const Joi = require('joi');
const sha1 = require("sha1");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const { sendMail, sendmultiple } = require('../helper/nodeMailer');
const axios = require('axios');
const qs = require('qs');

const zoom_api_key = process.env.ZOOM_API_KEY;
const zoom_api_secret = process.env.ZOOM_API_SECRET;
let redirect_url = process.env.ZOOM_REDIRECT_URL;


const checkValidation = require('../helper/joiValidation');
const fcmNotification = require('../helper/sendNotification');

const ContentManager = require('../module/content_manager');
const User = require('../module/userModule');
const ScheduleMeets = require('../module/schedule_meet');
const mongoose = require('mongoose');
const Entrance_stream = require('../module/entrance_stream');
const Entrance_exams = require('../module/entrance_exam');
const GovJobSector = require('../module/gov_job_sector');
const GovJobS = require('../module/gov_jobs');
const PvtJobSector = require('../module/pvt_job_sector');
const PvtJobS = require('../module/pvt_jobs');
const ScholarshipName = require('../module/scholarship_name');
const GovtScholership = require('../module/govt_scholership');
const careerAgenda = require('../module/carreer_agenda');
const Time_slot = require('../module/time_slot');
const Institutes = require('../module/institute');
const Desciplines = require('../module/descipline');
const Courses = require('../module/courses');
const Cities = require('../module/cities');
const Notifications = require('../module/notifications');
const Students = require('../module/student');
const Education = require('../module/education');
const StudentNotifications = require('../module/student_notification');
const Jobseeker = require('../module/job_seeker');
const CastCategory = require('../module/cast_category');
const Scholership = require('../module/scholarship');
const Broudcast = require('../module/broad_cast');
const Eligibility = require('../module/eligibility');
const imageurl = require('../helper/imageUrl');


// const { google } = require('googleapis');
// const { OAuth2Client } = require('google-auth-library');

// const CLIENT_ID = '817782746900-ma9vvu1fk8b643cgtslenao7i1uik3so.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:4000/';
// const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


function isExpired(expirationDate) {
    let currentDate = new Date();
    expirationDate.setHours(9, 59, 59, 999);
    currentDate.setHours(0, 0, 0, 0);
    const expirationTime = expirationDate.getTime();
    const currentTime = currentDate.getTime();
    return expirationTime <= currentTime;
}


module.exports.login = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required().messages({
                'string.empty': 'email cannot be an empty field',
                'any.required': 'email is required field'
            }),
            fcm_token: Joi.string().required().messages({
                'string.empty': `Fcm_token cannot be an empty field`,
                'any.required': `Fcm_token is a required field`
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password cannot be an empty field',
                'any.required': 'Password is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const password = sha1(req.body.password);
        const manager = await ContentManager.findOne({ email: req.body.email });
        if (manager) {
            if (manager.password === password) {
                const token = jwt.sign(
                    {
                        managerId: manager._id,
                        mobile: manager.mobile_no,
                        email: manager.email,
                        name: manager.name,
                    },
                    process.env.SECRET_KEY,
                    { expiresIn: "365d" }
                )
                res.status(200).json({ status: true, message: 'login successfully.', token: token });
            }
            else {
                res.status(400).json({ message: 'Password does not match.' });
            }
        }
        else {
            res.status(400).json({ message: "Email Id does not exist." });
        }
    } catch (error) {
        console.log('login error', error);
        res.status(500).json(error);
    }
}


module.exports.forget_password = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.empty': `Email cannot be an empty field`,
                'any.required': `Email Is A Required Field`
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const email = req.body.email;
        const user = await ContentManager.findOne({ email: email });
        if (user) {
            let randomCode = Math.floor(1000 + Math.random() * 9000);
            await sendMail({
                to: user.email,
                subject: "Forget Password Verification Code",
                html: randomCode
            });
            await ContentManager.updateOne({ email: user.email }, { $set: { otp: randomCode } },
                {
                    upsert: false,
                    multi: true
                });
            res
                .status(200)
                .json({ status: true, message: "Verification code is sent to registered email", data: user.email });
        }
        else {
            res.status(404).json({ status: false, message: 'Email Id does not exist' });
        }
    } catch (error) {
        console.log('forget_password', error);
        res.status(400).json(error);
    }
}



module.exports.verify_otp = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.empty': `Email cannot be an empty field`,
                'any.required': `Email Is A Required Field`
            }),
            otp: Joi.number().required().messages({
                'number.empty': `Otp cannot be an empty field`,
                'any.required': `Otp Is A Required Field`
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const getUser = await ContentManager.findOne({ email: req.body.email });
        if (getUser) {
            if (getUser.otp === req.body.otp) {
                res.status(200).json({ status: true, message: 'OTP verification successfully.', data: getUser.email });
            }
            else {
                res.status(404).json({ status: false, message: 'Invalid OTP' });
            }
        }
        else {
            res.status(404).json({ status: false, message: 'Email Id does not exist' });
        }
    } catch (error) {
        console.log('verify_otp', error);
        res.status(400).json(error);
    }
}



module.exports.reset_password = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.empty': `Email cannot be an empty field`,
                'any.required': `Email Is A Required Field`
            }),
            password: Joi.string().required().messages({
                'string.empty': `Password cannot be an empty field`,
                'any.required': `Password Is A Required Field`
            }),
            confirm_password: Joi.any().equal(Joi.ref('password'))
                .required()
                .options({ messages: { 'any.only': 'Confirm Password Does Not Match' } })
        });
        checkValidation.joiValidation(schema, req.body);
        const password = sha1(req.body.password);
        const getUser = await ContentManager.findOne({ email: req.body.email });
        if (getUser) {
            await ContentManager.updateOne({ email: req.body.email }, { $set: { password: password } }, { upsert: false, multi: true });
            return res.status(200).json({ status: true, message: 'Password reset successfully.' });
        }
        else {
            res.status(404).json({ status: false, message: 'Email Id does not exist' });
        }
    } catch (error) {
        console.log('reset_password', error);
        res.status(400).json(error);
    }
}



module.exports.get_profile = async (req, res) => {
    try {
        const managerId = req.managerId;
        if (managerId) {
            const managerData = await ContentManager.findOne({ _id: managerId }, { password: 0, otp: 0, fcm_token: 0 });
            if (managerData) {
                res.status(200).json({ status: true, message: "Manager Profile", data: managerData, });
            } else {
                res.status(404).json({ status: false, message: "Manager Profile Not Found" });
            }
        } else {
            res.status(400).json({ message: "Manager Id is required" });
        }
    } catch (error) {
        console.log("get_profile error", error);
        res.status(400).json(error);
    }
};



module.exports.check_password = async (req, res) => {
    try {
        const managerId = req.managerId;
        const password = sha1(req.body.password);
        if (password) {
            const managerData = await ContentManager.findOne({ _id: managerId });
            if (managerData) {
                if (managerData.password === password) {
                    res.status(200).json({ status: true, message: "Password matched." });
                }
                else {
                    res.status(400).json({ status: false, message: "Password does not match." });
                }
            }
            else {
                res.status(404).json({ status: false, message: "Manager Profile Not Found" });
            }
        }
        else {
            res.status(400).json({ message: "Password is required" });
        }
    } catch (error) {
        console.log('check_password error', error);
        res.status(400).json(error);
    }
}



module.exports.update_profile = async (req, res) => {
    try {
        const managerId = req.managerId;
        const setData = {}
        if (req.body.email) {
            setData.email = req.body.email
        }
        if (req.body.name) {
            setData.name = req.body.name
        }
        if (req.body.surname) {
            setData.surname = req.body.surname
        }
        if (req.body.mobile_no) {
            setData.mobile_no = req.body.mobile_no
        }
        if (req.body.password) {
            setData.password = sha1(req.body.password);
        }
        if (managerId) {
            if (req.files) {
                const folder = 'profile';
                setData.profile = await imageurl.processImage(req.files.profile, 'profile', req, folder);
                // setData.proImg = await s3Image.uploadImageOnS3(req.files.proImg);
            }
            console.log('setData', setData)
            const managerData = await ContentManager.findOne({ _id: managerId }, { password: 0 });
            if (managerData) {
                const updateProfile = await ContentManager.updateOne({ _id: managerId }, setData);
                if (updateProfile) {
                    res.status(200).json({ status: true, message: "Manager profile update successfully" });
                }
                else {
                    res.status(400).json({ status: false, message: "Please try again" });
                }
            }
            else {
                res.status(404).json({ status: false, message: "Manager Profile Not Found" });
            }
        }
        else {
            res.status(400).json({ message: "Manager token is required" });
        }
    } catch (error) {
        console.log('update_profile error', error);
        res.status(400).json(error);
    }
}



module.exports.user_list = async (req, res) => {
    try {
        const userList = await User.find({}, { password: 0 }).collation({ locale: "en", strength: 2 }).sort({ name: 1 });
        if (userList) {
            res.status(200).json({ status: true, message: "User list", data: userList });
        }
        else {
            res.status(404).json({ status: false, message: "Users is not available." });
        }
    } catch (error) {
        console.log('user_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.user_view = async (req, res) => {
    try {
        // const userId = req.query.userId;

        // if (!userId) {
        //     return res.status(400).json({ status: false, message: "User Id is required" });
        // }

        // try {
        //     const result = await Students.aggregate([
        //         {
        //             $addFields: {
        //                 userObjectId: { $toObjectId: "$userId" }
        //             }
        //         },
        //         {
        //             $match: { userId: userId }
        //         },
        //         {
        //             $lookup: {
        //                 from: "users", // Replace "users" with the actual name of your User collection
        //                 localField: "userObjectId",
        //                 foreignField: "_id",
        //                 as: "user"
        //             }
        //         },
        //         {
        //             $unwind: "$user"
        //         },
        //         {
        //             $lookup: {
        //                 from: "qualifications", // Replace "educations" with the actual name of your Education collection
        //                 localField: "_id",
        //                 foreignField: "student_id",
        //                 as: "qualification"
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0, // Exclude _id field
        //                 "user.mobile_no": 1,
        //                 studentData: "$$ROOT",
        //                 qualification: { $arrayElemAt: ["$qualification", 0] } // Assuming there is only one qualification per student
        //             }
        //         }
        //     ]);

        //     if (result.length > 0) {
        //         res.status(200).json({ status: true, message: "User view", data: result[0] });
        //     } else {
        //         res.status(404).json({ status: false, message: "User is not available." });
        //     }
        // } catch (error) {
        //     console.error(error);
        //     res.status(500).json({ status: false, message: "Internal Server Error" });
        // }
        const userId = req.query.userId;
        if (userId) {
            const userList = await User.findOne({ _id: userId });
            const studentData = await Students.findOne({ userId: userId }).lean();
            if (studentData) {
                studentData.mobile_no = userList.mobile_no;
                studentData.email = userList.email;
                studentData.employee_id = userList.employee_id;
                studentData.is_block = userList.is_block;
                studentData.profile = userList.profile;
                let qualification = '';
                if (studentData.criteria == "job_seeker") {
                    qualification = await Jobseeker.findOne({ student_id: studentData._id });
                }
                else {
                    qualification = await Education.findOne({ student_id: studentData._id });
                }
                let newArr = {
                    studentData,
                    qualification
                }
                res.status(200).json({ status: true, message: "User view", data: newArr });
            }
            else {
                res.status(404).json({ status: false, message: "User is not available." });
            }
        }
        else {
            res.status(400).json({ status: false, message: "User Id is required" });
        }
    } catch (error) {
        console.log('user_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.career_advise_list = async (req, res) => {
    try {
        const careerAdviseList = await ScheduleMeets.aggregate([
            {
                $addFields: {
                    studentObjectId: { $toObjectId: "$student_id" }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentObjectId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $unwind: '$student'
            },
            {
                $addFields: {
                    'student.userId': { $toObjectId: '$student.userId' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    schedule_date: 1,
                    schedule_from_time: 1,
                    createdAt: 1,
                    studentId: '$student._id',
                    userId: '$student.userId',
                    studentName: '$student.student_name',
                    father_name: '$student.father_name',
                    gender: '$student.gender',
                    dob: '$student.dob',
                    mobile_no: '$user.mobile_no',
                    email: '$user.email',
                }
            },
            {
                $sort: {
                    schedule_date: 1
                }
            }
        ]);
        if (careerAdviseList) {
            res.status(200).json({ status: true, message: "Career advises list", data: careerAdviseList });
        }
        else {
            res.status(404).json({ status: false, message: "Career advises is not available." });
        }
    } catch (error) {
        console.log('career_advise_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.career_advise_view = async (req, res) => {
    try {
        const schedul_id = req.query.schedul_id;
        if (schedul_id) {
            const careerAdviseList = await ScheduleMeets.aggregate([
                {
                    $addFields: {
                        studentObjectId: { $toObjectId: "$student_id" }
                    }
                },
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(schedul_id),
                    }
                },
                {
                    $lookup: {
                        from: 'students',
                        localField: 'studentObjectId',
                        foreignField: '_id',
                        as: 'student'
                    }
                },
                {
                    $unwind: '$student'
                },
                {
                    $addFields: {
                        'student.userId': { $toObjectId: '$student.userId' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'student.userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        schedule_date: 1,
                        schedule_from_time: 1,
                        createdAt: 1,
                        studentId: '$student._id',
                        studentName: '$student.student_name',
                        father_name: '$student.father_name',
                        gender: '$student.gender',
                        dob: '$student.dob',
                        mobile_no: '$user.mobile_no',
                        email: '$user.email',
                    }
                }
            ]);
            if (careerAdviseList) {
                res.status(200).json({ status: true, message: "Career advises view", data: careerAdviseList });
            }
            else {
                res.status(404).json({ status: false, message: "Career advise is not available." });
            }
        }
        else {
            res.status(400).json({ status: false, message: "Schedul Id is required" });
        }
    } catch (error) {
        console.log('career_advise_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_gov_sector = async (req, res) => {
    try {
        const schema = Joi.object({
            job_sector: Joi.string().required().messages({
                'string.empty': 'job_sector cannot be an empty field',
                'any.required': 'job_sector is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { job_sector } = req.body;
        const data = { job_sector }
        const addData = await GovJobSector.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Sector added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_gov_sector Error', error);
        res.status(500).json(error);
    }
}



module.exports.gov_sector_list = async (req, res) => {
    try {
        const entranceStreamData = await GovJobSector.find().sort({ job_sector: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Sector list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('gov_sector_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.govt_sector_edit = async (req, res) => {
    try {
        const sector_id = req.body.sector_id;
        if (sector_id) {
            const entranceStreamData = await GovJobSector.findOne({ _id: sector_id });
            if (entranceStreamData) {
                await GovJobSector.updateOne({ _id: sector_id }, { job_sector: req.body.job_sector });
                res.status(200).json({ status: true, message: "Sector updeted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Sector Id is required." });
        }
    } catch (error) {
        console.log('govt_sector_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.govt_sector_delete = async (req, res) => {
    try {
        const sector_id = req.query.sector_id;
        if (sector_id) {
            const entranceStreamData = await GovJobSector.findOne({ _id: sector_id });
            if (entranceStreamData) {
                await GovJobS.deleteMany({ sector_id: sector_id });
                await GovJobSector.deleteOne({ _id: sector_id });
                res.status(200).json({ status: true, message: "Sector deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Sector Id is required." });
        }
    } catch (error) {
        console.log('govt_sector_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_gov_jobs = async (req, res) => {
    try {
        const schema = Joi.object({
            sector_id: Joi.string().required().messages({
                'string.empty': 'sector_id cannot be an empty field',
                'any.required': 'sector_id is required field'
            }),
            job_title: Joi.string().required().messages({
                'string.empty': 'job_title cannot be an empty field',
                'any.required': 'job_title is required field'
            }),
            eligibility_education: Joi.string().required().messages({
                'string.empty': 'eligibility_education cannot be an empty field',
                'any.required': 'eligibility_education is required field'
            }),
            exam_for_selection: Joi.string().required().messages({
                'string.empty': 'exam_for_selection cannot be an empty field',
                'any.required': 'exam_for_selection is required field'
            }),
            salary: Joi.string().required().messages({
                'string.empty': 'salary cannot be an empty field',
                'any.required': 'salary is required field'
            }),
            exam_cunducting_agency: Joi.string().required().messages({
                'string.empty': 'exam_cunducting_agency cannot be an empty field',
                'any.required': 'exam_cunducting_agency is required field'
            }),
            website: Joi.string().required().messages({
                'string.empty': 'website cannot be an empty field',
                'any.required': 'website is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { sector_id, job_title, eligibility_education, exam_for_selection, salary, exam_cunducting_agency, website } = req.body;
        const data = { sector_id, job_title, eligibility_education, exam_for_selection, salary, exam_cunducting_agency, website }
        const addData = await GovJobS.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Govt. Job added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_gov_jobs Error', error);
        res.status(500).json(error);
    }
}



module.exports.gov_jobs_list = async (req, res) => {
    try {
        let filter = {}
        const sector_id = req.body.sector_id;
        if (sector_id.length) {
            filter.sector_id = { $in: sector_id };
        }
        const jobData = await GovJobS.find(filter).sort({ job_title: 1 });
        if (jobData.length) {
            console.log(jobData.length)
            res.status(200).json({ status: true, message: "Govt jobs list", data: jobData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('gov_jobs_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.gov_job_view = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (!jobId) {
            res.status(400).json({ message: "Job Id is required." });
        }
        else {
            const jobData = await GovJobS.find({ _id: jobId }).sort({ sector_id: -1 }).lean();
            if (jobData.length) {
                let promiss = jobData.map(async (row) => {
                    let sector = await GovJobSector.findOne({ _id: row.sector_id });
                    row.job_sector = sector.job_sector;
                    return row;
                });
                const newData = await Promise.all(promiss);
                res.status(200).json({ status: true, message: "Govt. Jobs view", data: newData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('gov_job_view Error', error);
        res.status(500).json(error);
    }
}




module.exports.govt_job_edit = async (req, res) => {
    try {
        const jobId = req.body.jobId;
        const setData = req.body;
        if (jobId) {
            const jobData = await GovJobS.findOne({ _id: jobId });
            if (jobData) {
                await GovJobS.updateOne({ _id: jobId }, setData);
                res.status(200).json({ status: true, message: "Job updated successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Job Id is required." });
        }
    } catch (error) {
        console.log('govt_job_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.govt_job_delete = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (jobId) {
            const entranceStreamData = await GovJobS.findOne({ _id: jobId });
            if (entranceStreamData) {
                await GovJobS.deleteOne({ _id: jobId });
                res.status(200).json({ status: true, message: "Job deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Job Id is required." });
        }
    } catch (error) {
        console.log('govt_job_delete Error', error);
        res.status(500).json(error);
    }
}




module.exports.add_pvt_sector = async (req, res) => {
    try {
        const schema = Joi.object({
            job_sector: Joi.string().required().messages({
                'string.empty': 'job_sector cannot be an empty field',
                'any.required': 'job_sector is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { job_sector } = req.body;
        const data = { job_sector }
        const addData = await PvtJobSector.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Sector added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_pvt_sector Error', error);
        res.status(500).json(error);
    }
}



module.exports.pvt_sector_list = async (req, res) => {
    try {
        const entranceStreamData = await PvtJobSector.find().sort({ job_sector: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Sector list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('pvt_sector_list Error', error);
        res.status(500).json(error);
    }
}




module.exports.pvt_sector_edit = async (req, res) => {
    try {
        const sector_id = req.body.sector_id;
        if (sector_id) {
            const entranceStreamData = await PvtJobSector.findOne({ _id: sector_id });
            if (entranceStreamData) {
                await PvtJobSector.updateOne({ _id: sector_id }, { job_sector: req.body.job_sector });
                res.status(200).json({ status: true, message: "Sector updeted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Sector Id is required." });
        }
    } catch (error) {
        console.log('pvt_sector_edit Error', error);
        res.status(500).json(error);
    }
}




module.exports.pvt_sector_delete = async (req, res) => {
    try {
        const sector_id = req.query.sector_id;
        if (sector_id) {
            const entranceStreamData = await PvtJobSector.findOne({ _id: sector_id });
            if (entranceStreamData) {
                await PvtJobS.deleteMany({ sector_id: sector_id });
                await PvtJobSector.deleteOne({ _id: sector_id });
                res.status(200).json({ status: true, message: "Sector deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Sector Id is required." });
        }
    } catch (error) {
        console.log('pvt_sector_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_pvt_jobs = async (req, res) => {
    try {
        const schema = Joi.object({
            sector_id: Joi.string().required().messages({
                'string.empty': 'sector_id cannot be an empty field',
                'any.required': 'sector_id is required field'
            }),
            job_title: Joi.string().required().messages({
                'string.empty': 'job_title cannot be an empty field',
                'any.required': 'job_title is required field'
            }),
            eligibility_qualification: Joi.string().required().messages({
                'string.empty': 'eligibility_qualification cannot be an empty field',
                'any.required': 'eligibility_qualification is required field'
            }),
            company: Joi.string().required().messages({
                'string.empty': 'company cannot be an empty field',
                'any.required': 'company is required field'
            }),
            location: Joi.string().required().messages({
                'string.empty': 'location cannot be an empty field',
                'any.required': 'location is required field'
            }),
            salary: Joi.string().required().messages({
                'string.empty': 'salary cannot be an empty field',
                'any.required': 'salary is required field'
            }),
            website: Joi.string().required().messages({
                'string.empty': 'website cannot be an empty field',
                'any.required': 'website is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { sector_id, job_title, eligibility_qualification, company, salary, location, website } = req.body;
        const data = { sector_id, job_title, eligibility_qualification, company, salary, location, website }
        const addData = await PvtJobS.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Job added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_pvt_jobs Error', error);
        res.status(500).json(error);
    }
}



module.exports.pvt_jobs_list = async (req, res) => {
    try {
        let filter = {}
        const sector_id = req.body.sector_id;
        if (sector_id.length) {
            filter.sector_id = { $in: sector_id };
        }
        const entranceExamData = await PvtJobS.find(filter).sort({ job_title: 1 });
        if (entranceExamData.length) {
            console.log(entranceExamData.length)
            res.status(200).json({ status: true, message: "Pvt Jobs list", data: entranceExamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('pvt_jobs_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.pvt_job_view = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (!jobId) {
            res.status(400).json({ message: "Exam Id is required." });
        }
        else {
            const entranceExamData = await PvtJobS.find({ _id: jobId }).sort({ sector_id: -1 }).lean();
            if (entranceExamData.length) {
                let promiss = entranceExamData.map(async (row) => {
                    let sector = await PvtJobSector.findOne({ _id: row.sector_id });
                    row.job_sector = sector.job_sector;
                    return row;
                });
                const newData = await Promise.all(promiss);
                res.status(200).json({ status: true, message: "Pvt Jobs view", data: newData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('pvt_job_view Error', error);
        res.status(500).json(error);
    }
}


module.exports.pvt_job_edit = async (req, res) => {
    try {
        const jobId = req.body.jobId;
        const setData = req.body;
        if (jobId) {
            const jobData = await PvtJobS.findOne({ _id: jobId });
            if (jobData) {
                await PvtJobS.updateOne({ _id: jobId }, setData);
                res.status(200).json({ status: true, message: "Job updated successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Job Id is required." });
        }
    } catch (error) {
        console.log('pvt_job_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.pvt_job_delete = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (jobId) {
            const jobData = await PvtJobS.findOne({ _id: jobId });
            if (jobData) {
                await PvtJobS.deleteOne({ _id: jobId });
                res.status(200).json({ status: true, message: "Job deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Pvt Id is required." });
        }
    } catch (error) {
        console.log('pvt_job_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_stream = async (req, res) => {
    try {
        const schema = Joi.object({
            steam_name: Joi.string().required().messages({
                'string.empty': 'steam_name cannot be an empty field',
                'any.required': 'steam_name is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { steam_name } = req.body;
        const data = { steam_name }
        const addData = await Entrance_stream.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Entrance stream added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_stream Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_stream_list = async (req, res) => {
    try {
        const entranceStreamData = await Entrance_stream.find().collation({ locale: "en", strength: 2 }).sort({ steam_name: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Stream list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('entrance_stream_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_stream_edit = async (req, res) => {
    try {
        const stream_id = req.body.streamId;
        if (stream_id) {
            const entranceStreamData = await Entrance_stream.findOne({ _id: stream_id });
            if (entranceStreamData) {
                await Entrance_stream.updateOne({ _id: stream_id }, { steam_name: req.body.stream_name });
                res.status(200).json({ status: true, message: "Sector updeted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Sector Id is required." });
        }
    } catch (error) {
        console.log('entrance_stream_edit Error', error);
        res.status(500).json(error);
    }
}




module.exports.entrance_stream_delete = async (req, res) => {
    try {
        const stream_id = req.query.streamId;
        if (stream_id) {
            const entranceStreamData = await Entrance_stream.findOne({ _id: stream_id });
            if (entranceStreamData) {
                await Entrance_exams.deleteMany({ stream_id: stream_id });
                await Entrance_stream.deleteOne({ _id: stream_id });
                res.status(200).json({ status: true, message: "Stream deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Stream Id is required." });
        }
    } catch (error) {
        console.log('entrance_stream_delete Error', error);
        res.status(500).json(error);
    }
}




module.exports.add_entrance_exam = async (req, res) => {
    try {
        const schema = Joi.object({
            stream_id: Joi.string().required().messages({
                'string.empty': 'stream_id cannot be an empty field',
                'any.required': 'stream_id is required field'
            }),
            exam_name: Joi.string().required().messages({
                'string.empty': 'exam_name cannot be an empty field',
                'any.required': 'exam_name is required field'
            }),
            brief_discription: Joi.string().required().messages({
                'string.empty': 'brief_discription cannot be an empty field',
                'any.required': 'brief_discription is required field'
            }),
            progran_level: Joi.string().required().messages({
                'string.empty': 'progran_level cannot be an empty field',
                'any.required': 'progran_level is required field'
            }),
            conducting: Joi.string().required().messages({
                'string.empty': 'conducting cannot be an empty field',
                'any.required': 'conducting is required field'
            }),
            web_link: Joi.string().required().messages({
                'string.empty': 'web_link cannot be an empty field',
                'any.required': 'web_link is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { stream_id, exam_name, brief_discription, progran_level, conducting, web_link } = req.body;
        const data = { stream_id, exam_name, brief_discription, progran_level, conducting, web_link }
        const addData = await Entrance_exams.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Entrance exam added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_entrance_exam Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_exam_list = async (req, res) => {
    try {
        let filter = {}
        const streamId = req.query.streamId;
        if (streamId) {
            filter.stream_id = streamId;
        }
        const entranceExamData = await Entrance_exams.find(filter).collation({ locale: "en", strength: 2 }).sort({ exam_name: 1 });
        if (entranceExamData.length) {
            res.status(200).json({ status: true, message: "Entrance exam list", data: entranceExamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('entrance_exam_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_exam_view = async (req, res) => {
    try {
        const examId = req.query.examId;
        if (!examId) {
            res.status(400).json({ message: "Exam Id is required." });
        }
        else {
            const entranceExamData = await Entrance_exams.find({ _id: examId }).sort({ stream_id: 1 }).lean();
            if (entranceExamData.length) {
                let promiss = entranceExamData.map(async (row) => {
                    let stream = await Entrance_stream.findOne({ _id: row.stream_id });
                    row.stream_name = stream.steam_name;
                    return row;
                });
                const newData = await Promise.all(promiss);
                res.status(200).json({ status: true, message: "Entrance exam view", data: newData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('entrance_exam_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_exam_edit = async (req, res) => {
    try {
        const examId = req.body.examId;
        const setData = req.body;
        if (examId) {
            const entranceExamData = await Entrance_exams.findOne({ _id: examId });
            if (entranceExamData) {
                await Entrance_exams.updateOne({ _id: examId }, setData);
                res.status(200).json({ status: true, message: "Entrance exam updeted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Exam Id is required." });
        }
    } catch (error) {
        console.log('entrance_exam_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.entrance_exam_delete = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (jobId) {
            const entranceStreamData = await Entrance_exams.findOne({ _id: jobId });
            if (entranceStreamData) {
                await Entrance_exams.deleteOne({ _id: jobId });
                res.status(200).json({ status: true, message: "Entrance exam deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Exam Id is required." });
        }
    } catch (error) {
        console.log('entrance_exam_delete Error', error);
        res.status(500).json(error);
    }
}




// module.exports.add_scholarship_name = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             name: Joi.string().required().messages({
//                 'string.empty': 'name cannot be an empty field',
//                 'any.required': 'name is required field'
//             }),
//         });
//         checkValidation.joiValidation(schema, req.body);
//         const { name } = req.body;
//         const data = { name }
//         const addData = await ScholarshipName.create(data);
//         if (addData) {
//             res.status(200).json({ status: true, message: 'Scholarship name added successfully.', data: addData });
//         }
//         else {
//             res.status(400).json({ status: false, message: "Please try again" });
//         }
//     } catch (error) {
//         console.log('add_scholarship_name Error', error);
//         res.status(500).json(error);
//     }
// }




// module.exports.add_scholarship1 = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             scholarship_id: Joi.string().required().messages({
//                 'string.empty': 'scholarship_id cannot be an empty field',
//                 'any.required': 'scholarship_id is required field'
//             }),
//             scheme_name: Joi.string().required().messages({
//                 'string.empty': 'scheme_name cannot be an empty field',
//                 'any.required': 'scheme_name is required field'
//             }),
//             amount_of_scholership: Joi.string().required().messages({
//                 'string.empty': 'amount_of_scholership cannot be an empty field',
//                 'any.required': 'amount_of_scholership is required field'
//             }),
//             eligibility: Joi.string().required().messages({
//                 'string.empty': 'eligibility cannot be an empty field',
//                 'any.required': 'eligibility is required field'
//             }),
//             category: Joi.string().required().messages({
//                 'string.empty': 'Category cannot be an empty field',
//                 'any.required': 'Category is required field'
//             }),
//             slots: Joi.string().required().messages({
//                 'string.empty': 'slots cannot be an empty field',
//                 'any.required': 'slots is required field'
//             }),
//             scheme_close_date: Joi.string().required().messages({
//                 'string.empty': 'scheme_close_date cannot be an empty field',
//                 'any.required': 'scheme_close_date is required field'
//             }),
//             guidelines: Joi.string().required().messages({
//                 'string.empty': 'guidelines cannot be an empty field',
//                 'any.required': 'guidelines is required field'
//             }),
//             faq: Joi.string().required().messages({
//                 'string.empty': 'faq cannot be an empty field',
//                 'any.required': 'faq is required field'
//             }),
//             website: Joi.string().required().messages({
//                 'string.empty': 'website cannot be an empty field',
//                 'any.required': 'website is required field'
//             }),
//         });
//         checkValidation.joiValidation(schema, req.body);
//         const { scholarship_id, scheme_name, amount_of_scholership, eligibility, category, slots, scheme_close_date, guidelines, faq, website } = req.body;
//         const data = { scholarship_id, scheme_name, amount_of_scholership, eligibility, category, slots, scheme_close_date, guidelines, faq, website }
//         const addData = await GovtScholership.create(data);
//         if (addData) {
//             res.status(200).json({ status: true, message: 'Pvt Job added successfully.', data: addData });
//         }
//         else {
//             res.status(400).json({ status: false, message: "Please try again" });
//         }
//     } catch (error) {
//         console.log('add_scholarship Error', error);
//         res.status(500).json(error);
//     }
// }




module.exports.get_scholership_list = async (req, res) => {
    try {
        const govtScholershipData = await GovtScholership.find().sort({ createdAt: -1 });
        if (govtScholershipData.length) {
            res.status(200).json({ status: true, message: "Govt Scholarship list", data: govtScholershipData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_scholership_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_scholarship_view = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            res.status(400).json({ message: "id is required." });
        }
        else {
            const govtScholershipData = await GovtScholership.find({ _id: id });
            if (govtScholershipData.length) {
                res.status(200).json({ status: true, message: "Govt Scholarship view", data: govtScholershipData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('get_scholarship_view Error', error);
        res.status(500).json(error);
    }
}




module.exports.carrer_advise_agenda_edit = async (req, res) => {
    try {
        const schema = Joi.object({
            agenda_id: Joi.string().required().messages({
                'string.empty': 'agenda_id cannot be an empty field',
                'any.required': 'agenda_id is required field'
            }),
            agenda: Joi.string().required().messages({
                'string.empty': 'agenda cannot be an empty field',
                'any.required': 'agenda is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const data = req.body
        const agendaData = await careerAgenda.findOne({ _id: req.body.agenda_id });
        if (agendaData) {
            const addData = await careerAgenda.updateOne({ _id: req.body.agenda_id }, data);
            if (addData) {
                res.status(200).json({ status: true, message: 'Career agenda updated successfully.' });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('carrer_advise_agenda_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.carrer_advise_agenda_list = async (req, res) => {
    try {
        const agendaData = await careerAgenda.find();
        if (agendaData.length) {
            res.status(200).json({ status: true, message: "Career agenda list", data: agendaData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('carrer_advise_agenda_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.carrer_advise_agenda_view = async (req, res) => {
    try {
        const career_agenda_id = req.query.carrer_agenda_id;
        if (career_agenda_id) {
            const agendaData = await careerAgenda.find({ _id: career_agenda_id });
            if (agendaData) {
                res.status(200).json({ status: true, message: "Career agenda view", data: agendaData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Career agenda Id is required." });
        }
    } catch (error) {
        console.log('carrer_advise_agenda_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_time_slot = async (req, res) => {
    try {
        const schema = Joi.object({
            slot: Joi.string().required().messages({
                'string.empty': 'slot cannot be an empty field',
                'any.required': 'slot is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { slot } = req.body;
        const data = { slot }
        const addData = await Time_slot.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Time slot added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_time_slot Error', error);
        res.status(500).json(error);
    }
}



module.exports.time_slot_list = async (req, res) => {
    try {
        const timeSlotData = await Time_slot.find();
        if (timeSlotData.length) {
            res.status(200).json({ status: true, message: "Time slot list", data: timeSlotData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('time_slot_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.time_slot_view = async (req, res) => {
    try {
        const slot_id = req.query.slot_id;
        if (slot_id) {
            const agendaData = await Time_slot.find({ _id: slot_id });
            if (agendaData) {
                res.status(200).json({ status: true, message: "Time slot view", data: agendaData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Time slot Id is required." });
        }
    } catch (error) {
        console.log('time_slot_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.time_slot_edit = async (req, res) => {
    try {
        const schema = Joi.object({
            slot_id: Joi.string().required().messages({
                'string.empty': 'slot_id cannot be an empty field',
                'any.required': 'slot_id is required field'
            }),
            slot: Joi.string().required().messages({
                'string.empty': 'slot cannot be an empty field',
                'any.required': 'slot is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const data = req.body
        const agendaData = await Time_slot.findOne({ _id: req.body.slot_id });
        if (agendaData) {
            await Time_slot.updateOne({ _id: req.body.slot_id }, data)
            res.status(200).json({ status: true, message: "Time slot updated successfuly" });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('time_slot_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.time_slot_delete = async (req, res) => {
    try {
        const slot_id = req.query.slot_id;
        if (slot_id) {
            const agendaData = await Time_slot.findOne({ _id: slot_id });
            if (agendaData) {
                await Time_slot.deleteOne({ _id: slot_id });
                res.status(200).json({ status: true, message: "Time slot deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Time slot Id is required." });
        }
    } catch (error) {
        console.log('time_slot_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_institute = async (req, res) => {
    try {
        const schema = Joi.object({
            institute_name: Joi.string().required().messages({
                'string.empty': 'Institute_name cannot be an empty field',
                'any.required': 'Institute_name is required field'
            }),
            place: Joi.string().required().messages({
                'string.empty': 'place cannot be an empty field',
                'any.required': 'place is required field'
            }),
            institute_type: Joi.string().required().messages({
                'string.empty': 'institute_type cannot be an empty field',
                'any.required': 'institute_type is required field'
            }),
            institute_url: Joi.string().required().messages({
                'string.empty': 'institute_url cannot be an empty field',
                'any.required': 'institute_url is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_name, place, institute_type, institute_url } = req.body;
        const data = { institute_name, place, institute_type, institute_url }
        const addData = await Institutes.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Institute added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_institute Error', error);
        res.status(500).json(error);
    }
}



module.exports.institute_list = async (req, res) => {
    try {
        const instituteList = await Institutes.find().sort({ institute_name: 1 }).lean();

        if (instituteList.length) {
            const promiss = instituteList.map(async (row) => {
                const [disciplineslist, course1] = await Promise.all([
                    Desciplines.find({ institute_id: row._id }).lean(),
                    Courses.find({ institute_id: row._id }).lean()
                ]);
                const { items: disciplines, counts: disciplineCounts } = processItems(disciplineslist, "discipline_name");
                const { items: subjects, counts: subjectCounts } = processItems(course1, "subject_name");
                const { items: courses, counts: courseCounts } = processItems(course1, "course_name");

                row.courses = courses.length;
                row.subjects = subjects.length;
                row.disciplines = disciplines.length;

                const course = await Courses.findOne({ institute_id: row._id }).lean();

                if (row.place && row.institute_type) {
                    return row;
                } else if (course) {
                    row.place = course.place;
                    row.institute_type = course.institute_type;
                    row.institute_url = course.institute_url;
                    return row;
                } else {
                    row.place = null;
                    row.institute_type = null;
                    row.institute_url = null;
                    return row;
                }
            });

            const newArr = await Promise.all(promiss);
            res.status(200).json({ status: true, message: "Institutes list", data: newArr });
        } else {
            res.status(404).json({ status: false, message: "Data not found." });
        }

        function processItems(itemList, itemNameKey) {
            const items = [];
            const itemSet = new Set();
            const itemCounts = {};

            itemList.forEach((item) => {
                const itemName = item[itemNameKey];
                const filterCondition = !itemSet.has(itemName);

                if (filterCondition) {
                    items.push({ [itemNameKey]: itemName, institutes: 1 });
                    itemSet.add(itemName);
                    itemCounts[itemName] = 1;
                } else {
                    items.find(d => d[itemNameKey] === itemName).institutes++;
                    itemCounts[itemName]++;
                }
            });

            return { items, counts: itemCounts };
        }

    } catch (error) {
        console.log('institute_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.institute_view = async (req, res) => {
    try {
        const institute_id = req.query.institute_id;
        if (institute_id) {
            const instituteData = await Institutes.findOne({ _id: institute_id }).lean();
            if (instituteData) {
                const course = await Courses.findOne({ institute_id: instituteData._id });

                if (course) {
                    instituteData.place = course.place;
                    instituteData.institute_type = course.institute_type;
                    instituteData.institute_url = course.institute_url;

                    const disciplineList = await Desciplines.find({ institute_id: institute_id });

                    if (disciplineList.length) {
                        let disciplines = [];
                        let disciplineSet = new Set();
                        let disciplineCounts = {};

                        for (const row of disciplineList) {
                            const discipline = row.discipline_name;
                            const coursesData = await Courses.find({ discipline_id: row._id });
                            let subjects = [];
                            let subjectSet = new Set();
                            let subjectCounts = {};

                            for (const courseRow of coursesData) {
                                const subject = courseRow.subject_name;
                                if (!subjectSet.has(subject)) {
                                    subjects.push({ subject: subject, courses: 1 });
                                    subjectSet.add(subject);
                                    subjectCounts[subject] = 1;
                                } else {
                                    subjects.find(d => d.subject === subject).courses++;
                                    subjectCounts[subject]++;
                                }
                            }

                            if (!disciplineSet.has(discipline)) {
                                disciplines.push({ discipline: discipline, subjectsLength: subjects.length });
                                disciplineSet.add(discipline);
                                disciplineCounts[discipline] = 1;
                            } else {
                                disciplines.find(d => d.discipline === discipline).subjectsLength = subjects.length;
                                disciplineCounts[discipline]++;
                            }
                        }
                        instituteData.disciplines = disciplines;
                    }
                }
                res.status(200).json({ status: true, message: "Institute view", data: instituteData });
            } else {
                res.status(404).json({ status: false, message: "Institute not found." });
            }
        }
        else {
            res.status(400).json({ message: "Institute Id is required." });
        }


        // const institute_id = req.query.institute_id;
        // if (institute_id) {
        //     const instituteData = await Institutes.aggregate([
        //         {
        //             $match: { _id: new mongoose.Types.ObjectId(institute_id) }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'courses',
        //                 localField: '_id',
        //                 foreignField: 'institute_id',
        //                 as: 'courseInfo'
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: '$courseInfo',
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $project: {
        //                 institute_name: 1,
        //                 place: '$courseInfo.place',
        //                 institute_type: '$courseInfo.institute_type',
        //                 institute_url: '$courseInfo.institute_url'
        //             }
        //         }
        //     ]);

        //     if (instituteData.length > 0) {
        //         res.status(200).json({
        //             status: true,
        //             message: "Institute view",
        //             data: instituteData[0]
        //         });
        //     } else {
        //         res.status(404).json({ status: false, message: "Data not found." });
        //     }

        // } else {
        //     res.status(400).json({ message: "Institute Id is required." });
        // }

    } catch (error) {
        console.log('institute_view Error', error);
        res.status(500).json(error);
    }
}




module.exports.institute_edit = async (req, res) => {
    try {
        const institute_id = req.body.institute_id;
        if (institute_id) {
            let setData = {};
            if (req.body.institute_name) {
                setData.institute_name = req.body.institute_name
            }
            if (req.body.place) {
                setData.place = req.body.place
            }
            if (req.body.institute_name) {
                setData.institute_name = req.body.institute_name
            }
            if (req.body.institute_type) {
                setData.institute_type = req.body.institute_type
            }
            if (req.body.institute_url) {
                setData.institute_url = req.body.institute_url
            }
            const instituteData = await Institutes.findOne({ _id: req.body.institute_id });
            if (instituteData) {
                await Institutes.updateOne({ _id: req.body.institute_id }, setData);
                await Courses.updateOne({ institute_id: req.body.institute_id }, { place: setData.place, institute_type: setData.institute_type, institute_url: setData.institute_url });
                res.status(200).json({ status: true, message: "Institute updated successfuly" });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Institute Id is required." });
        }
    } catch (error) {
        console.log('institute_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.institute_delete = async (req, res) => {
    try {
        const institute_id = req.query.institute_id;
        if (institute_id) {
            const instituteData = await Institutes.findOne({ _id: institute_id });
            if (instituteData) {
                await Institutes.deleteOne({ _id: institute_id });
                await Desciplines.deleteMany({ institute_id: institute_id });
                await Courses.deleteMany({ institute_id: institute_id });
                res.status(200).json({ status: true, message: "Institute deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Institute Id is required." });
        }
    } catch (error) {
        console.log('institute_delete Error', error);
        res.status(500).json(error);
    }
}


module.exports.cities_list = async (req, res) => {
    try {
        const citiesData = await Cities.find().sort({ city: 1 });
        if (citiesData.length) {
            res.status(200).json({ status: true, message: "Cities list", data: citiesData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('cities_list Error', error);
        res.status(500).json(error);
    }
}


module.exports.add_discipline = async (req, res) => {
    try {
        const schema = Joi.object({
            institute_id: Joi.string().required().messages({
                'string.empty': 'institute_id cannot be an empty field',
                'any.required': 'institute_id is required field'
            }),
            discipline_name: Joi.string().required().messages({
                'string.empty': 'discipline_name cannot be an empty field',
                'any.required': 'discipline_name is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_id, discipline_name, } = req.body;
        const data = { institute_id, discipline_name, }
        const addData = await Desciplines.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Descipline added successfully.', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_discipline Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_list = async (req, res) => {
    try {
        // const desciplineList = await Desciplines.aggregate([
        //     {
        //         $addFields: {
        //             instituteObjectId: { $toObjectId: "$institute_id" }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'institutes',
        //             localField: 'instituteObjectId',
        //             foreignField: '_id',
        //             as: 'institute'
        //         }
        //     },
        //     {
        //         $unwind: '$institute'
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             discipline_name: 1,
        //             institute_id: 1,
        //             institute_name: "$institute.institute_name",
        //             createdAt: 1
        //         }
        //     }
        // ]);
        const desciplineList = await Desciplines.find().sort({ discipline_name: 1 });
        if (desciplineList.length) {
            let disciplines = [];
            let disciplineSet = new Set();
            let disciplineCounts = {};
            desciplineList.map((row) => {
                let discipline = row.discipline_name;
                if (!disciplineSet.has(discipline)) {
                    disciplines.push({ discipline: discipline, institutes: 1 });
                    disciplineSet.add(discipline);
                    disciplineCounts[discipline] = 1;
                } else {
                    disciplines.find(d => d.discipline === discipline).institutes++;
                    disciplineCounts[discipline]++;
                }
            });
            res.status(200).json({ status: true, message: "Descipline list", data: disciplines });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('discipline_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_view = async (req, res) => {
    try {
        const discipline_name = req.query.discipline_name;
        if (discipline_name) {
            const desciplineData = await Desciplines.aggregate([
                {
                    $addFields: {
                        instituteObjectId: { $toObjectId: "$institute_id" }
                    }
                },
                {
                    $match: {
                        discipline_name: discipline_name,
                    }
                },
                {
                    $lookup: {
                        from: 'institutes',
                        localField: 'instituteObjectId',
                        foreignField: '_id',
                        as: 'institute'
                    }
                },
                {
                    $unwind: '$institute'
                },
                {
                    $project: {
                        _id: 1,
                        discipline_name: 1,
                        institute_id: 1,
                        institute_name: "$institute.institute_name",
                        createdAt: 1
                    }
                }
            ]);
            if (desciplineData) {
                res.status(200).json({ status: true, message: "Descipline view", data: desciplineData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Descipline name is required." });
        }
    } catch (error) {
        console.log('discipline_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_edit = async (req, res) => {
    try {
        const old_discipline_name = req.body.old_discipline_name;
        if (old_discipline_name) {
            const setData = req.body;
            const desciplineData = await Desciplines.findOne({ discipline_name: old_discipline_name });
            if (desciplineData) {
                await Desciplines.updateMany({ discipline_name: old_discipline_name }, setData)
                res.status(200).json({ status: true, message: "Descipline updated successfuly" });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        } else {
            res.status(400).json({ message: "Descipline Id is required." });
        }
    } catch (error) {
        console.log('discipline_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_delete = async (req, res) => {
    try {
        const old_discipline_name = req.query.discipline_name;
        if (old_discipline_name) {
            const desciplineData = await Desciplines.find({ discipline_name: old_discipline_name });
            if (desciplineData) {
                desciplineData.forEach(async (row) => {
                    await Desciplines.deleteMany({ discipline_name: old_discipline_name });
                    await Courses.deleteMany({ discipline_id: row.discipline_id });
                })
                res.status(200).json({ status: true, message: "Descipline deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Descipline name is required." });
        }
    } catch (error) {
        console.log('discipline_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_institute_delete = async (req, res) => {
    try {
        const discipline_name = req.body.discipline_name;
        const institute_id = req.body.institute_id;
        if (discipline_name && institute_id) {
            const desciplineData = await Desciplines.find({ discipline_name: discipline_name, institute_id: institute_id });
            if (desciplineData) {
                desciplineData.forEach(async (row) => {
                    await Desciplines.deleteMany({ discipline_name: discipline_name, institute_id: institute_id });
                    await Courses.deleteMany({ discipline_id: row.discipline_id, institute_id: institute_id });
                })
                res.status(200).json({ status: true, message: "Institute deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Descipline name and institute Id is required." });
        }
    } catch (error) {
        console.log('discipline_institute_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_subject_view = async (req, res) => {
    try {
        const discipline_name = req.query.discipline_name;
        if (discipline_name) {
            const disciplineData = await Desciplines.find({ discipline_name: discipline_name });

            if (disciplineData && disciplineData.length > 0) {
                let subjectData = [];

                for (const item of disciplineData) {
                    const coursesData = await Courses.find({ discipline_id: item._id });
                    subjectData = subjectData.concat(coursesData);
                }

                let subjects = [];
                let subjectSet = new Set();
                let subjectCounts = {};

                subjectData.forEach((row) => {
                    let subject = row.subject_name;
                    if (!subjectSet.has(subject)) {
                        subjects.push({ subject: subject, courses: 1 });
                        subjectSet.add(subject);
                        subjectCounts[subject] = 1;
                    } else {
                        subjects.find(d => d.subject === subject).courses++;
                        subjectCounts[subject]++;
                    }
                });

                let newArr = {
                    discipline_name: discipline_name,
                    subjects: subjects
                };
                res.status(200).json({ status: true, message: "Descipline subject view", data: newArr });
            } else {
                res.status(404).json({ message: "Descipline not found" });
            }
        } else {
            res.status(400).json({ message: "Discipline name is required." });
        }
    } catch (error) {
        console.log('discipline_subject_view Error', error);
        res.status(500).json({ status: false, message: "Internal server error." });
    }
}



module.exports.add_subject = async (req, res) => {
    try {
        const schema = Joi.object({
            institute_id: Joi.string().required().messages({
                'string.empty': 'institute_id cannot be an empty field',
                'any.required': 'institute_id is required field'
            }),
            discipline_id: Joi.string().required().messages({
                'string.empty': 'discipline_id cannot be an empty field',
                'any.required': 'discipline_id is required field'
            }),
            subject_name: Joi.string().required().messages({
                'string.empty': 'subject_name cannot be an empty field',
                'any.required': 'subject_name is required field'
            }),
            course_name: Joi.string().required().messages({
                'string.empty': 'course_name cannot be an empty field',
                'any.required': 'course_name is required field'
            }),
            program_lavel: Joi.string().required().messages({
                'string.empty': 'program_lavel cannot be an empty field',
                'any.required': 'program_lavel is required field'
            }),
            // place: Joi.string().required().messages({
            //     'string.empty': 'place cannot be an empty field',
            //     'any.required': 'place is required field'
            // }),
            // institute_type: Joi.string().required().messages({
            //     'string.empty': 'institute_type cannot be an empty field',
            //     'any.required': 'institute_type is required field'
            // }),
            // institute_url: Joi.string().required().messages({
            //     'string.empty': 'institute_url cannot be an empty field',
            //     'any.required': 'institute_url is required field'
            // }),
            course_url: Joi.string().required().messages({
                'string.empty': 'course_url cannot be an empty field',
                'any.required': 'course_url is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_id, discipline_id, subject_name, course_name, program_lavel, course_url } = req.body;
        const data = { institute_id, discipline_id, subject_name, course_name, program_lavel, course_url }
        const institute_list = await Institutes.findOne({ _id: institute_id });
        if (institute_list) {
            let disciplineData = await Desciplines.findOne({ institute_id: institute_id, discipline_name: discipline_id });
            console.log('disciplineData', disciplineData)
            data.discipline_id = disciplineData.id;
            if (institute_list.place && institute_list.institute_type) {
                data.place = institute_list.place;
                data.institute_type = institute_list.institute_type;
                data.institute_url = institute_list.institute_url;
            }
            else {
                let courses_list = await Courses.findOne({ institute_id: institute_id });
                data.place = courses_list.place;
                data.institute_type = courses_list.institute_type;
                data.institute_url = courses_list.institute_url;
            }
            console.log('data', data)
            const addData = await Courses.create(data);
            if (addData) {
                res.status(200).json({ status: true, message: 'Course added successfully.', data: addData });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
        else {

        }
    } catch (error) {
        console.log('add_subject Error', error);
        res.status(500).json(error);
    }
}



module.exports.subject_list = async (req, res) => {
    try {
        // const courseList = await Courses.aggregate([
        //     {
        //         $addFields: {
        //             instituteObjectId: { $toObjectId: "$institute_id" },
        //             disciplineObjectId: { $toObjectId: "$discipline_id" }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'institutes',
        //             localField: 'instituteObjectId',
        //             foreignField: '_id',
        //             as: 'institute'
        //         }
        //     },
        //     {
        //         $unwind: '$institute'
        //     },
        //     {
        //         $lookup: {
        //             from: 'desciplines',
        //             localField: 'disciplineObjectId',
        //             foreignField: '_id',
        //             as: 'discipline'
        //         }
        //     },
        //     {
        //         $unwind: '$discipline'
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             institute_id: 1,
        //             subject_name: 1,
        //             course_name: 1,
        //             program_lavel: 1,
        //             place: 1,
        //             institute_type: 1,
        //             institute_url: 1,
        //             course_url: 1,
        //             institute_name: "$institute.institute_name",
        //             discipline_name: "$discipline.discipline_name",
        //             createdAt: 1
        //         }
        //     }
        // ]);
        // if (courseList.length) {
        //     res.status(200).json({ status: true, message: "Courses list", data: courseList });
        // } else {
        //     res.status(404).json({ status: false, message: "Data not found." });
        // }

        const couresData = await Courses.find().sort({ subject_name: 1 });
        if (couresData.length) {
            let subjects = [];
            let subjectSet = new Set();
            let subjectCounts = {};
            couresData.map((row) => {
                let subject = row.subject_name;
                if (!subjectSet.has(subject)) {
                    subjects.push({ subject: subject, courses: 1 });
                    subjectSet.add(subject);
                    subjectCounts[subject] = 1;
                } else {
                    subjects.find(d => d.subject === subject).courses++;
                    subjectCounts[subject]++;
                }
            });
            res.status(200).json({ status: true, message: "Subject list", data: subjects });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('subject_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.subject_view = async (req, res) => {
    try {
        const subject_name = req.query.subject_name;
        if (subject_name) {
            const couresData = await Courses.aggregate([
                {
                    $addFields: {
                        instituteObjectId: { $toObjectId: "$institute_id" },
                        disciplineObjectId: { $toObjectId: "$discipline_id" }
                    }
                },
                {
                    $match: {
                        subject_name: subject_name,
                    }
                },
                {
                    $lookup: {
                        from: 'institutes',
                        localField: 'instituteObjectId',
                        foreignField: '_id',
                        as: 'institute'
                    }
                },
                {
                    $unwind: '$institute'
                },
                {
                    $lookup: {
                        from: 'desciplines',
                        localField: 'disciplineObjectId',
                        foreignField: '_id',
                        as: 'discipline'
                    }
                },
                {
                    $unwind: '$discipline'
                },
                {
                    $project: {
                        _id: 1,
                        institute_id: 1,
                        discipline_id: 1,
                        subject_name: 1,
                        course_name: 1,
                        program_lavel: 1,
                        place: 1,
                        institute_type: 1,
                        institute_url: 1,
                        course_url: 1,
                        institute_name: "$institute.institute_name",
                        discipline_name: "$discipline.discipline_name",
                        createdAt: 1
                    }
                }
            ]);
            if (couresData) {
                res.status(200).json({ status: true, message: "Course view", data: couresData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Course Id is required." });
        }
    } catch (error) {
        console.log('subject_view Error', error);
        res.status(500).json(error);
    }
}




module.exports.subject_edit = async (req, res) => {
    try {
        const subject_name = req.body.old_subject_name;
        if (subject_name) {
            const setData = req.body;
            const couresData = await Courses.findOne({ subject_name: subject_name });
            if (couresData) {
                await Courses.updateOne({ subject_name: subject_name }, setData)
                res.status(200).json({ status: true, message: "Subject updated successfuly" });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        } else {
            res.status(400).json({ message: "Subject Id is required." });
        }
    } catch (error) {
        console.log('subject_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.subject_delete = async (req, res) => {
    try {
        const subject_name = req.query.subject_name;
        if (subject_name) {
            const desciplineData = await Courses.findOne({ subject_name: subject_name });
            if (desciplineData) {
                await Courses.deleteOne({ subject_name: subject_name });
                res.status(200).json({ status: true, message: "Course deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Course Id is required." });
        }
    } catch (error) {
        console.log('subject_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.discipline_list_instituteId = async (req, res) => {
    try {
        const institute_id = req.query.institute_id;
        if (!institute_id) {
            res.status(400).json({ message: "Institute Id is required." });
        }
        else {
            const desciplineList = await Desciplines.find({ institute_id: institute_id });
            console.log('desciplineList', desciplineList);
            if (desciplineList) {
                let disciplines = [];
                let disciplineSet = new Set();
                let disciplineCounts = {};
                desciplineList.map((row) => {
                    let discipline = row.discipline_name;
                    if (!disciplineSet.has(discipline)) {
                        disciplines.push({ discipline: discipline, institutes: 1 });
                        disciplineSet.add(discipline);
                        disciplineCounts[discipline] = 1;
                    } else {
                        disciplines.find(d => d.discipline === discipline).institutes++;
                        disciplineCounts[discipline]++;
                    }
                });
                res.status(200).json({ status: true, message: "Discipline list", data: disciplines });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('discipline_list_instituteId Error', error);
        res.status(500).json(error);
    }
}


module.exports.course_list = async (req, res) => {
    try {
        const couresData = await Courses.find().sort({ course_name: 1 });
        if (couresData.length) {
            let courses = [];
            let courseSet = new Set();
            let courseCounts = {};
            couresData.map((row) => {
                let course = row.course_name;
                if (!courseSet.has(course)) {
                    courses.push({ course: course, courses: 1 });
                    courseSet.add(course);
                    courseCounts[course] = 1;
                } else {
                    courses.find(d => d.course === course).courses++;
                    courseCounts[course]++;
                }
            });
            res.status(200).json({ status: true, message: "Courses list", data: courses });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('course_list Error', error);
        res.status(500).json(error);
    }
}


module.exports.course_edit = async (req, res) => {
    try {
        const course_id = req.body.course_id;
        if (course_id) {
            const setData = req.body;
            const couresData = await Courses.findOne({ _id: course_id });
            if (couresData) {
                await Courses.updateOne({ _id: course_id }, setData)
                res.status(200).json({ status: true, message: "Course updated successfuly" });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        } else {
            res.status(400).json({ message: "Course Id is required." });
        }
    } catch (error) {
        console.log('course_edit Error', error);
        res.status(500).json(error);
    }
}


module.exports.course_view = async (req, res) => {
    try {
        const course_id = req.query.course_id;
        if (!course_id) {
            res.status(400).json({ message: "Course Id is required." });
        }
        else {
            const couresData = await Courses.findOne({ _id: course_id });
            if (couresData) {
                res.status(200).json({ status: true, message: "Course view", data: couresData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('course_view Error', error);
        res.status(500).json(error);
    }
}


module.exports.course_delete = async (req, res) => {
    try {
        const course_id = req.query.course_id;
        if (course_id) {
            const desciplineData = await Courses.findOne({ _id: course_id });
            if (desciplineData) {
                await Courses.deleteOne({ _id: course_id });
                res.status(200).json({ status: true, message: "Course deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Course Id is required." });
        }
    } catch (error) {
        console.log('course_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.course_level = async (req, res) => {
    try {
        // const course_name = req.query.course_name;
        // if (!course_name) {
        //     res.status(400).json({ message: "Please Select A Course" });
        // }
        // else {
        const levelData = await Courses.find();
        let program_lavels = [];
        let program_lavelSet = new Set();
        levelData.map((row) => {
            let program_lavel = row.program_lavel;
            if (!program_lavelSet.has(program_lavel)) {
                program_lavels.push({ program_lavel: program_lavel });
                program_lavelSet.add(program_lavel);
            }
        });
        res.status(200).json({ status: true, message: "course type", data: program_lavels });
        // }
    } catch (error) {
        console.log('course_level Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_notification = async (req, res) => {
    try {
        const schema = Joi.object({
            criteria: Joi.string().required().messages({
                'string.empty': 'criteria cannot be an empty field',
                'any.required': 'criteria is required field'
            }),
            title: Joi.string().min(1).max(60).required().messages({
                'string.empty': 'title cannot be an empty field',
                'any.required': 'title is required field',
                'string.min': '"agenda" length must be at least 1 character long',
                'string.max': '"agenda" length must be less than or equal to 60 characters long'
            }),
            description: Joi.string().min(1).max(300).required().messages({
                'string.empty': 'description cannot be an empty field',
                'any.required': 'description is required field',
                'string.min': '"agenda" length must be at least 1 character long',
                'string.max': '"agenda" length must be less than or equal to 300 characters long'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { criteria, title, description } = req.body;
        const data = { criteria, title, description }
        const studentData = await Students.find({ criteria: criteria });
        let userIds = [];
        studentData.forEach((student) => {
            userIds.push(student.userId);
        })
        const userData = await User.find({ _id: { $in: userIds } });
        await Notifications.create(data);
        try {
            let promise = userData.map(async (row) => {
                await fcmNotification.sendNotification(row.fcm_token, title, description);
                await StudentNotifications.create({ criteria, title, description, userId: row._id });
            });
            await Promise.all(promise).then(async () => {
                res.status(201).json({ status: true, message: "Notification send successfully." });
            }).catch((err) => {
                console.log('err', err);
                res.status(201).json({ status: true, message: "Notification send successfully." });
            })
        } catch (error) {
            console.log('error', error);
            res.status(201).json({ status: true, message: "Notification send successfully." });
        }
    } catch (error) {
        console.log('add_notification Error', error);
        res.status(500).json(error);
    }
}




module.exports.notification_list = async (req, res) => {
    try {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        console.log('fifteenDaysAgo', fifteenDaysAgo);
        // const result = await Notifications.deleteMany({ createdAt: { $lt: fifteenDaysAgo } });
        const notificationData = await Notifications.find().sort({ createdAt: -1 });
        if (notificationData.length) {
            res.status(200).json({ status: true, message: "Notification list", data: notificationData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('notification_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.notification_view = async (req, res) => {
    try {
        const notificationId = req.query.notificationId;
        if (!notificationId) {
            res.status(400).json({ message: "Notification Id is required." });
        }
        else {
            const notificationData = await Notifications.findOne({ _id: notificationId });
            if (notificationData) {
                res.status(200).json({ status: true, message: "Notification view", data: notificationData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('notification_view Error', error);
        res.status(500).json(error);
    }
}




module.exports.block_student = async (req, res) => {
    try {
        const userId = req.body.userId;
        const status = req.body.status;
        if (!userId) {
            res.status(400).json({ message: "User Id is required." });
        }
        else {
            const userData = await User.findOne({ _id: userId });
            if (userData) {
                await User.updateOne({ _id: userId }, { is_block: status });
                if (status === true) {
                    res.status(200).json({ status: true, message: "Student block successfully." });
                }
                else {
                    res.status(200).json({ status: true, message: "Student unblock successfully." });
                }
            }
            else {
                res.status(404).json({ status: false, message: "Student not found." });
            }
        }
    } catch (error) {
        console.log('block_student Error', error);
        res.status(500).json(error);
    }
}



// module.exports.authorization_url = async (req, res) => {
//     try {
//         const authUrl = oAuth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: ['https://www.googleapis.com/auth/calendar.events'],

//         });
//         if (authUrl) {
//             res.status(200).json({ status: true, message: "Authorization url.", data: authUrl });
//         }
//         else {
//             res.status(400).json({ status: false, message: err.messages, err });
//         }
//     } catch (error) {
//         console.log('authorization_url Error', error);
//         res.status(500).json(error);
//     }
// }



// module.exports.generate_auth_url = async (req, res) => {
//     try {
//         // Set the desired time
//         const startTime = moment.tz('2024-02-08T19:05:00', 'Asia/Kolkata');
//         const endTime = moment.tz('2024-02-08T20:05:00', 'Asia/Kolkata');
//         const code = req.body.code;


//         const { tokens } = await oAuth2Client.getToken(code);
//         oAuth2Client.setCredentials(tokens);

//         // Create Google Calendar API instance
//         const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//         // Create event with Google Meet link
//         const event = await calendar.events.insert({
//             calendarId: 'primary',
//             resource: {
//                 summary: 'Meeting Title',
//                 description: 'Meeting Description',
//                 start: { dateTime: '2024-02-08T13:35:00Z', timeZone: 'UTC' },
//                 end: { dateTime: '2024-02-08T14:35:00Z', timeZone: 'UTC' },
//                 conferenceData: {
//                     createRequest: {
//                         requestId: 'YOUR_UNIQUE_REQUEST_ID',
//                     },
//                 },
//             },
//         });

//         const meetingLink = event.data.hangoutLink;
//         console.log('Meeting Link:', meetingLink);
//         console.log('event.data', event.data);

//         // oAuth2Client.getToken(code, (err, token) => {
//         //     if (err) return console.error('Error retrieving access token', err);
//         //     else {
//         //         console.log('token', token)
//         //         oAuth2Client.setCredentials(token);
//         //         const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
//         //         calendar.events.insert({
//         //             calendarId: 'primary',
//         //             resource: {
//         //                 summary: 'Meeting Title',
//         //                 description: 'Meeting Description',
//         //                 start: {
//         //                     dateTime: startTime,
//         //                 },
//         //                 end: {
//         //                     dateTime: endTime,
//         //                 },
//         //                 conferenceData: {
//         //                     createRequest: {
//         //                         requestId: requestId,
//         //                     },
//         //                 },
//         //             },
//         //         }, (err, res) => {
//         //             if (err) return console.error('Error creating event:', err);

//         //             const meetingLink = res.data;
//         //             console.log('Meeting Link:', meetingLink);
//         //         });
//         //     }
//         // });
//     } catch (error) {
//         console.log('generate_auth_url Error', error);
//         res.status(500).json(error);
//     }
// }



module.exports.add_cast_category = async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'name cannot be an empty field',
                'any.required': 'name is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { name } = req.body;
        const data = { name }
        const getData = await CastCategory.find({ name: name });
        if (getData.length) {
            res.status(400).json({ status: false, message: "Category already exist." });
        }
        else {
            const addData = await CastCategory.create(data);
            if (addData) {
                res.status(200).json({ status: true, message: 'Category added successfully.' });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
    } catch (error) {
        console.log('add_cast_category Error', error);
        res.status(500).json(error);
    }
}




module.exports.cast_category_list = async (req, res) => {
    try {
        const categoryData = await CastCategory.find().sort({ name: 1 });
        if (categoryData.length) {
            res.status(200).json({ status: true, message: "Category list", data: categoryData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('cast_category_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.cast_category_edit = async (req, res) => {
    try {
        const catId = req.body.catId;
        if (catId) {
            const categoryData = await CastCategory.findOne({ _id: catId });
            if (categoryData) {
                await CastCategory.updateOne({ _id: catId }, { name: req.body.name });
                res.status(200).json({ status: true, message: "Category successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Category Id is required." });
        }
    } catch (error) {
        console.log('cast_category_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.cast_category_delete = async (req, res) => {
    try {
        const catId = req.query.catId;
        if (catId) {
            const categoryData = await CastCategory.findOne({ _id: catId });
            if (categoryData) {
                await CastCategory.deleteOne({ _id: catId });
                res.status(200).json({ status: true, message: "Category deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Category Id is required." });
        }
    } catch (error) {
        console.log('cast_category_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_scholarship = async (req, res) => {
    try {
        const schema = Joi.object({
            // mp_police: Joi.string().required().messages({
            //     'string.empty': 'mp_police cannot be an empty field',
            //     'any.required': 'mp_police is required field'
            // }),
            level: Joi.string().required().messages({
                'string.empty': 'level cannot be an empty field',
                'any.required': 'level is required field'
            }),
            cast_category_id: Joi.string().required().messages({
                'string.empty': 'cast_category_id cannot be an empty field',
                'any.required': 'cast_category_id is required field'
            }),
            category: Joi.string().required().messages({
                'string.empty': 'category cannot be an empty field',
                'any.required': 'category is required field'
            }),
            scheme_name: Joi.string().required().messages({
                'string.empty': 'scheme_name cannot be an empty field',
                'any.required': 'scheme_name is required field'
            }),
            eligibility: Joi.string().required().messages({
                'string.empty': 'eligibility cannot be an empty field',
                'any.required': 'eligibility is required field'
            }),
            amount_of_scholership: Joi.string().required().messages({
                'string.empty': 'amount_of_scholership cannot be an empty field',
                'any.required': 'amount_of_scholership is required field'
            }),
            scheme_closing_date: Joi.string().required().messages({
                'string.empty': 'scheme_closing_date cannot be an empty field',
                'any.required': 'scheme_closing_date is required field'
            }),
            guidelines: Joi.string().required().messages({
                'string.empty': 'guidelines cannot be an empty field',
                'any.required': 'guidelines is required field'
            }),
            faq: Joi.string().required().messages({
                'string.empty': 'faq cannot be an empty field',
                'any.required': 'faq is required field'
            }),
            website: Joi.string().required().messages({
                'string.empty': 'website cannot be an empty field',
                'any.required': 'website is required field'
            })
        });
        const { level, cast_category_id, category, scheme_name, eligibility, amount_of_scholership, scheme_closing_date, guidelines, faq, website } = req.body;
        const data = { level, cast_category_id, category, scheme_name, eligibility, amount_of_scholership, scheme_closing_date, guidelines, faq, website }
        checkValidation.joiValidation(schema, data);
        data.mp_police = req.body.mp_police
        const addData = await Scholership.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Scholarship added successfully.' });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_scholarship Error', error);
        res.status(500).json(error);
    }
}



module.exports.scholarship_list_national = async (req, res) => {
    try {
        let filter = {
            level: 'National'
        }
        const catId = req.query.catId;
        if (catId) {
            filter.cast_category_id = catId;
        }
        const scholarshipData = await Scholership.find(filter).sort({ createdAt: -1 }).lean();
        if (scholarshipData.length) {
            let promise = scholarshipData.map((row) => {
                const expirationDate = new Date(row.scheme_closing_date);
                if (isExpired(expirationDate)) {
                    console.log('The date has expired.');
                    row.closing = true;
                    return row;
                } else {
                    console.log('The date has not expired yet.');
                    row.closing = false;
                    return row;
                }
            });
            const newArr = await Promise.all(promise);
            res.status(200).json({ status: true, message: "Scholarship list", data: newArr });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('scholarship_list_national Error', error);
        res.status(500).json(error);
    }
}



module.exports.scholarship_list_state = async (req, res) => {
    try {
        let filter = {
            level: 'State'
        }
        const catId = req.query.catId;
        if (catId) {
            filter.cast_category_id = catId;
        }
        const scholarshipData = await Scholership.find(filter).sort({ scheme_closing_date: 1 }).lean();
        if (scholarshipData.length) {
            let promise = scholarshipData.map((row) => {
                console.log(row.scheme_closing_date);
                const expirationDate = new Date(row.scheme_closing_date);
                if (isExpired(expirationDate)) {
                    console.log('The date has expired.');
                    row.closing = true;
                    return row;
                } else {
                    console.log('The date has not expired yet.');
                    row.closing = false;
                    return row;
                }
            });
            const newArr = await Promise.all(promise);
            res.status(200).json({ status: true, message: "Scholarship list", data: newArr });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('scholarship_list_state Error', error);
        res.status(500).json(error);
    }
}



module.exports.scholarship_view = async (req, res) => {
    try {
        const scholarId = req.query.scholarId;
        if (!scholarId) {
            res.status(400).json({ message: "Scholarship Id is required." });
        }
        else {
            const scholarshipData = await Scholership.find({ _id: scholarId }).sort({ createdAt: 1 }).lean();
            if (scholarshipData.length) {
                let promiss = scholarshipData.map(async (row) => {
                    const expirationDate = new Date(row.scheme_closing_date);
                    if (isExpired(expirationDate)) {
                        row.closing = true;
                        let category = await CastCategory.findOne({ _id: row.cast_category_id });
                        row.cast_category = category.name;
                        return row;
                    } else {
                        row.closing = false;
                        let category = await CastCategory.findOne({ _id: row.cast_category_id });
                        row.cast_category = category.name;
                        return row;
                    }
                });
                const newData = await Promise.all(promiss);
                res.status(200).json({ status: true, message: "Scholarship exam view", data: newData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('scholarship_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.scholarship_edit = async (req, res) => {
    try {
        const scholarId = req.body.scholarId;
        const setData = req.body;
        if (scholarId) {
            const scholarshipData = await Scholership.findOne({ _id: scholarId });
            if (scholarshipData) {
                await Scholership.updateOne({ _id: scholarId }, setData);
                res.status(200).json({ status: true, message: "Scholarship updated successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Scholarship Id is required." });
        }
    } catch (error) {
        console.log('scholarship_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.scholarship_delete = async (req, res) => {
    try {
        const scholarId = req.query.scholarId;
        if (scholarId) {
            const scholarshipData = await Scholership.findOne({ _id: scholarId });
            if (scholarshipData) {
                await Scholership.deleteOne({ _id: scholarId });
                res.status(200).json({ status: true, message: "Scholarship deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Scholarship Id is required." });
        }
    } catch (error) {
        console.log('scholarship_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_zoom_access_token = async (req, res) => {
    try {
        const code = req.query.code;
        const requestBody = qs.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_url,
        });
        const response = await axios.post('https://zoom.us/oauth/token', requestBody, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${zoom_api_key}:${zoom_api_secret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        // console.log('Token', response.data);
        res.status(200).json({ status: true, message: "Access token.", token: response.data })
    } catch (error) {
        console.log('get_zoom_access_token Error', error);
        res.status(400).json({ status: false, message: error.response.data.message });
    }
}




module.exports.create_meeting = async (req, res) => {
    try {
        const schema = Joi.object({
            topic: Joi.string().required().messages({
                'string.empty': 'topic cannot be an empty field',
                'any.required': 'topic is required field'
            }),
            discription: Joi.string().required().messages({
                'string.empty': 'discription cannot be an empty field',
                'any.required': 'discription is required field'
            }),
            date_time: Joi.string().required().messages({
                'string.empty': 'date_time cannot be an empty field',
                'any.required': 'date_time is required field'
            }),
            duration_hours: Joi.number().required().messages({
                'string.empty': 'duration_hours cannot be an empty field',
                'any.required': 'duration_hours is required field'
            }),
            duration_min: Joi.number().required().messages({
                'string.empty': 'duration_min cannot be an empty field',
                'any.required': 'duration_min is required field'
            }),
            default_password: Joi.boolean().required().messages({
                'string.empty': 'default_password cannot be an empty field',
                'any.required': 'default_password is required field'
            }),
            waiting_room: Joi.boolean().required().messages({
                'string.empty': 'waiting_room cannot be an empty field',
                'any.required': 'waiting_room is required field'
            }),
            vidio_host: Joi.boolean().required().messages({
                'string.empty': 'vidio_host cannot be an empty field',
                'any.required': 'vidio_host is required field'
            }),
            auto_recording: Joi.string().required().messages({
                'string.empty': 'auto_recording cannot be an empty field',
                'any.required': 'auto_recording is required field'
            }),
            join_before_host: Joi.boolean().required().messages({
                'string.empty': 'join_before_host cannot be an empty field',
                'any.required': 'join_before_host is required field'
            }),
            access_token: Joi.string().required().messages({
                'string.empty': 'access_token cannot be an empty field',
                'any.required': 'access_token is required field'
            }),
        });
        const { topic, discription, date_time, duration_hours, duration_min, default_password, waiting_room, vidio_host, auto_recording, join_before_host, access_token } = req.body;
        const data = { topic, discription, date_time, duration_hours, duration_min, default_password, waiting_room, vidio_host, auto_recording, join_before_host, access_token };
        checkValidation.joiValidation(schema, data);
        let default_password1 = req.body.default_password;
        let password = '123456';
        if (req.body.default_password1 === true) {
            password = req.body.password;
        }
        let durationInMinutes = (req.body.duration_hours * 60) + req.body.duration_min;
        createMeetingData = {
            "topic": req.body.topic,
            "type": 2,
            "start_time": req.body.date_time,
            "duration": durationInMinutes,
            "agenda": req.body.discription,
            "default_password": default_password1,
            "password": password,
            "settings": {
                "host_video": req.body.vidio_host,
                "participant_video": true,
                "join_before_host": req.body.join_before_host,
                "mute_upon_entry": true,
                "watermark": true,
                "auto_recording": req.body.auto_recording,
                "waiting_room": req.body.waiting_room,
                "private_meeting": false,
                //     "allow_multiple_devices": true,
                //     "alternative_hosts_email_notification": true,
                //     "approval_type": 2,
                //     "calendar_type": 1,
                //     "close_registration": false,
                //     "email_notification": true,
                //     "focus_mode": true,
                //     "jbh_time": 0,
                //     "meeting_authentication": true,
                //     "registrants_confirmation_email": true,
                //     "registrants_email_notification": true,
                //     "registration_type": 1,
                //     "show_share_button": true,
                //     "use_pmi": false,
                //     "host_save_video_order": true,
                //     "alternative_host_update_polls": true,
                //     "internal_meeting": false,
                //     "continuous_meeting_chat": {
                //         "enable": true,
                //         "auto_add_invited_external_users": true
                //     },
                //     "participant_focused_meeting": false,
                //     "push_change_to_calendar": false,
                // "pre_schedule": false,
                // "timezone": "Asia/Calcutta",
                // "recurrence": {
                //     "end_date_time": convertDate,
                // },
            },
        }
        let token = req.body.access_token;
        const Api_url = 'https://api.zoom.us/v2/users';
        axios.get(Api_url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            const userId = response.data.users[0].id;
            console.log('User ID:', userId);
            axios.post(`https://api.zoom.us/v2/users/${userId}/meetings`, createMeetingData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(async (response) => {
                // console.log('Meeting created successfully', response.data);
                const timestamp = response.data.start_time;
                const dateObject = new Date(timestamp);
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const monthName = months[dateObject.getMonth()];
                const date = dateObject.getDate();
                const day = dateObject.getDay();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = days[day];
                const hours = dateObject.getHours();
                const minutes = dateObject.getMinutes();
                const seconds = dateObject.getSeconds();
                const newdate = monthName + ' ' + date;
                const newtime = hours + ':' + (minutes < 10 ? '0' : '') + minutes;
                let newHours = hours + req.body.duration_hours;
                let newMinutes = minutes + req.body.duration_min;
                if (newMinutes >= 60) {
                    newHours += 1;
                    newMinutes -= 60;
                }
                if (newHours >= 24) {
                    newHours -= 24;
                }
                const newEndTime = newHours + ':' + (newMinutes < 10 ? '0' : '') + newMinutes;
                const data = {
                    agenda: req.body.topic,
                    date: newdate,
                    start_time: newtime,
                    end_time: newEndTime,
                    link: response.data.join_url,
                }
                const addData = await Broudcast.create(data);
                res.status(200).json({ status: true, message: "Meeting created successfully", data: response.data });
            }).catch(error => {
                console.error('Error creating meeting:', error);
                res.status(400).json({ status: false, message: error });
            });
        }).catch(error => {
            console.error('Error retrieving user information:', error.response.data);
            res.status(400).json({ status: false, message: error.response.data.message });
        });
    } catch (error) {
        console.log('create_meeting Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_eligibility = async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'name cannot be an empty field',
                'any.required': 'name is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { name } = req.body;
        const data = { name }
        const getData = await Eligibility.find({ name: name });
        if (getData.length) {
            res.status(400).json({ status: false, message: "Educational eligibility already exist." });
        }
        else {
            const addData = await Eligibility.create(data);
            if (addData) {
                res.status(200).json({ status: true, message: 'Educational eligibility added successfully.' });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
    } catch (error) {
        console.log('add_eligibility Error', error);
        res.status(500).json(error);
    }
}




module.exports.eligibility_list = async (req, res) => {
    try {
        const eligibilityData = await Eligibility.find().sort({ name: 1 });
        if (eligibilityData.length) {
            res.status(200).json({ status: true, message: "Eligibility list", data: eligibilityData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('eligibility_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.eligibility_edit = async (req, res) => {
    try {
        const eligibilityId = req.body.eligibilityId;
        if (eligibilityId) {
            const eligibilityData = await Eligibility.findOne({ _id: eligibilityId });
            if (eligibilityData) {
                await Eligibility.updateOne({ _id: eligibilityId }, { name: req.body.name });
                res.status(200).json({ status: true, message: "Eligibility successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Eligibility Id is required." });
        }
    } catch (error) {
        console.log('eligibility_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.eligibility_delete = async (req, res) => {
    try {
        const eligibilityId = req.query.eligibilityId;
        if (eligibilityId) {
            const eligibilityData = await Eligibility.findOne({ _id: eligibilityId });
            if (eligibilityData) {
                await Eligibility.deleteOne({ _id: eligibilityId });
                res.status(200).json({ status: true, message: "Eligibility deleted successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
        else {
            res.status(400).json({ message: "Eligibility Id is required." });
        }
    } catch (error) {
        console.log('eligibility_delete Error', error);
        res.status(500).json(error);
    }
}