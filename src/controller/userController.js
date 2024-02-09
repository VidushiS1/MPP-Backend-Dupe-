const Joi = require('joi');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const xlsx = require('xlsx');
const translate = require('google-translate-api');

const checkValidation = require('../helper/joiValidation');
const imageurl = require('../helper/imageUrl');
const { sendMail, sendmultiple } = require('../helper/nodeMailer');

const User = require('../module/userModule');
const Institutes = require('../module/institute');
const Desciplines = require('../module/descipline');
const Courses = require('../module/courses');
const Employees = require('../module/employees');
const Students = require('../module/student');
const Education = require('../module/education');
const Jobseeker = require('../module/job_seeker');
const ScheduleMeets = require('../module/schedule_meet');
const Subjects = require('../module/subject');
const Entrance_stream = require('../module/entrance_stream');
const Entrance_exams = require('../module/entrance_exam');
const GovJobSector = require('../module/gov_job_sector');
const GovJobS = require('../module/gov_jobs');
const PvtJobSector = require('../module/pvt_job_sector');
const PvtJobS = require('../module/pvt_jobs');
const GovtScholership = require('../module/govt_scholership');
const BankLoan = require('../module/bank_loan');
const mongoose = require("mongoose");
const Time_slot = require('../module/time_slot');
const Broudcast = require('../module/broad_cast');
const careerAgenda = require('../module/carreer_agenda');
const StudentNotifications = require('../module/student_notification');
const CastCategory = require('../module/cast_category');
const Scholership = require('../module/scholarship');


module.exports.sign_up = async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name cannot be an empty field',
                'any.required': 'Name is required field'
            }),
            email: Joi.string().email().required().messages({
                'string.empty': 'Email cannot be an empty field',
                'string.email': 'Email must be a valid email address',
                'any.required': 'Email is required field'
            }),
            employee_id: Joi.string().required().messages({
                'string.empty': 'Employee ID cannot be an empty field',
                'any.required': 'Employee ID is required field'
            }),
            mobile_no: Joi.string().required().messages({
                'string.empty': 'Mobile number cannot be an empty field',
                'any.required': 'Mobile number is required field'
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password cannot be an empty field',
                'any.required': 'Password is required field'
            }),
            confirm_password: Joi.any().equal(Joi.ref('password')).required().options({
                messages: { 'any.only': 'confirm password does not match' }
            }),
            language: Joi.string().required().messages({
                'string.empty': 'Language cannot be an empty field',
                'any.required': 'Language is required field'
            }),
            fcm_token: Joi.string().required().messages({
                'string.empty': 'Fcm_token cannot be an empty field',
                'any.required': 'Fcm_token is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { name, email, employee_id, mobile_no, language } = req.body;
        const userData = { name, email, employee_id, mobile_no, language };
        userData.password = sha1(req.body.password);
        userData.fcm_token = req.body.fcm_token

        const employeeId = "653243453";
        // const checkEmployee = await Employees.find({ employee_id: userData.employee_id });
        if (employeeId === employee_id) {
            const existUser = await User.find({ $or: [{ mobile_no: userData.mobile_no }, { email: userData.email }] });
            // const existemployeeId = await User.find({ employee_id: userData.employee_id });
            // console.log('existUser', existUser);
            // console.log('existemployeeId', existemployeeId);
            if (existUser.length) {
                res.status(400).json({ message: 'Mobile number and Email must be unique.' });
            }
            // else if (existemployeeId.length) {
            //     res.status(400).json({ message: 'Employee Id is already exist.' });
            // }
            else {
                const createData = await User.create(userData);
                if (createData) {
                    const token = jwt.sign(
                        {
                            userId: createData._id,
                            mobile: createData.mobile_no,
                            email: createData.email,
                            employee_id: createData.employee_id
                        },
                        process.env.SECRET_KEY,
                        { expiresIn: "365d" }
                    )
                    res.status(201).json({ status: true, message: 'User signed up successfully.', token: token, data: createData });
                }
                else {
                    res.status(400).json({ status: false, message: "Please try again." });
                }
            }
        }
        else {
            res.status(400).json({ message: 'Employee Id does not exist.' });
        }
    } catch (error) {
        console.log('sign_up Error', error);
        res.status(500).json(error);
    }
}


module.exports.login = async (req, res) => {
    try {
        const schema = Joi.object({
            mobile_no: Joi.string().required().messages({
                'string.empty': 'Mobile number cannot be an empty field',
                'any.required': 'Mobile number is required field'
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
        const existUser = await User.findOne({ mobile_no: req.body.mobile_no });
        if (existUser) {
            if (existUser.is_block == true) {
                res.status(400).json({ message: 'Account is block.' });
            }
            else {
                if (existUser.password === password) {
                    let student_registration = false;
                    let name = existUser.name;
                    let student_id = "null";
                    let education_qualification = false;
                    let hobys = false;
                    const checkStudent = await Students.findOne({ userId: existUser._id });
                    if (checkStudent) {
                        student_id = checkStudent._id;
                        student_registration = true;
                        if (checkStudent.hobbys.length) {
                            hobys = true
                        }
                        const checkQualification = await Education.findOne({ student_id: checkStudent._id });
                        if (checkQualification) {
                            education_qualification = true;
                        } else {
                            const checkQualification = await Jobseeker.findOne({ student_id: checkStudent._id });
                            if (checkQualification) {
                                education_qualification = true;
                            }
                        }
                    }
                    const token = jwt.sign(
                        {
                            userId: existUser._id,
                            id: existUser.id,
                            mobile: existUser.mobile_no,
                            email: existUser.email,
                            employee_id: existUser.employee_id
                        },
                        process.env.SECRET_KEY,
                        { expiresIn: "365d" }
                    )
                    await User.updateOne({ mobile_no: req.body.mobile_no }, { fcm_token: req.body.fcm_token });
                    res.status(200).json({ status: true, message: 'User login successfully.', student_registration, student_id, name, education_qualification, hobys, token: token });
                }
                else {
                    res.status(400).json({ message: 'Password does not match.' });
                }
            }
        }
        else {
            res.status(400).json({ message: "Mobile number does not exist." });
        }
    } catch (error) {
        console.log('login Error', error);
        res.status(500).json(error);
    }
}



module.exports.student_registration = async (req, res) => {
    try {
        const schema = Joi.object({
            student_name: Joi.string().required().messages({
                'string.empty': 'Student_name cannot be an empty field',
                'any.required': 'Student_name is required field'
            }),
            dob: Joi.string().required().messages({
                'string.empty': 'DOB cannot be an empty field',
                'any.required': 'DOB is required field'
            }),
            gender: Joi.string().required().messages({
                'string.empty': 'Gender cannot be an empty field',
                'any.required': 'Gender is required field'
            }),
            category: Joi.string().required().messages({
                'string.empty': 'Category cannot be an empty field',
                'any.required': 'Category is required field'
            }),
            father_name: Joi.string().required().messages({
                'string.empty': 'Father_name cannot be an empty field',
                'any.required': 'Father_name is required field'
            }),
            father_occupation: Joi.string().required().messages({
                'string.empty': 'Father_occupation cannot be an empty field',
                'any.required': 'Father_occupation is required field'
            }),
            mother_name: Joi.string().required().messages({
                'string.empty': 'Mother_name cannot be an empty field',
                'any.required': 'Mother_name is required field'
            }),
            mother_occupation: Joi.string().required().messages({
                'string.empty': 'Mother_occupation cannot be an empty field',
                'any.required': 'Mother_occupation is required field'
            }),
            name: Joi.string().required().messages({
                'string.empty': 'Name cannot be an empty field',
                'any.required': 'Name is required field'
            }),
            designation: Joi.string().required().messages({
                'string.empty': 'Designation cannot be an empty field',
                'any.required': 'Designation is required field'
            }),
            posting_unit: Joi.string().required().messages({
                'string.empty': 'Posting_unit cannot be an empty field',
                'any.required': 'Posting_unit is required field'
            }),
            relation: Joi.string().required().messages({
                'string.empty': 'Relation cannot be an empty field',
                'any.required': 'Relation is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        console.log('req.body', req.userId);
        const { student_name, dob, gender, category, father_name, father_occupation, mother_name, mother_occupation, name, designation, posting_unit, relation } = req.body;
        const studentData = { student_name, dob, gender, category, father_name, father_occupation, mother_name, mother_occupation, name, designation, posting_unit, relation };
        studentData.userId = req.userId
        const addStudent = await Students.create(studentData);
        if (addStudent) {
            res.status(201).json({ status: true, message: "Student registered successfully.", student_id: addStudent._id });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('student_registration Error', error);
        res.status(500).json(error);
    }
}



module.exports.education_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            education_type: Joi.string().required().messages({
                'string.empty': 'Education_type cannot be an empty field',
                'any.required': 'Education_type is required field'
            }),
            class_name: Joi.string().required().messages({
                'string.empty': 'Class_name cannot be an empty field',
                'any.required': 'Class_name is required field'
            }),
            school_name: Joi.string().required().messages({
                'string.empty': 'School_name cannot be an empty field',
                'any.required': 'School_name is required field'
            }),
            education_medium: Joi.string().required().messages({
                'string.empty': 'Education_medium cannot be an empty field',
                'any.required': 'Education_medium is required field'
            }),
            passing_year: Joi.string().required().messages({
                'string.empty': 'Passing_year cannot be an empty field',
                'any.required': 'Passing_year is required field'
            }),
            parcentage: Joi.string().required().messages({
                'string.empty': 'Parcentage cannot be an empty field',
                'any.required': 'Parcentage is required field'
            }),
            education_mode: Joi.string().required().messages({
                'string.empty': 'Education_mode cannot be an empty field',
                'any.required': 'Education_mode is required field'
            })
        });
        const { student_id, education_type, class_name, school_name, education_medium, passing_year, parcentage, education_mode } = req.body;
        const body = { student_id, education_type, class_name, school_name, education_medium, passing_year, parcentage, education_mode }
        checkValidation.joiValidation(schema, body);
        let achivementImg = ''
        if (req.files && req.files.achivement) {
            let image = req.files.achivement;
            achivementImg = await imageurl.processImage(image, 'achivementImg', req);
        }
        console.log('education_type', body.education_type);
        if (body.education_type === 'below_10th') {
            const { student_id, class_name, school_name, education_medium, passing_year, education_mode, } = req.body;
            const below10th = { student_id, class_name, school_name, education_medium, passing_year, education_mode, achivementImg }
            const addEducation = await Education.create(below10th);
            if (addEducation) {
                res.status(200).json({ status: true, message: "Below 10th education details added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
        else if (body.education_type === 'class_10th') {
            const setData = {
                school_name_10th: body.school_name,
                board_10th: body.class_name,
                education_medium_10th: body.education_medium,
                passing_year_10th: body.passing_year,
                parcentage_10th: body.class_name,
                education_mode_10th: body.education_mode,
                achivement_10th: achivementImg
            }
            const previous_detiale = await Education.findOne({ student_id: body.student_id });
            if (previous_detiale == null) {
                setData.student_id = body.student_id;
                const addEducation = await Education.create(setData);
                if (addEducation) {
                    res.status(200).json({ status: true, message: "10th education details added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            } else {
                const updateEducation = await Education.updateOne({ student_id: body.student_id }, setData);
                if (updateEducation) {
                    res.status(200).json({ status: true, message: "10th education details added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            }
        }
        else if (body.education_type === 'class_12th') {
            const previous_detiale = await Education.findOne({ student_id: body.student_id });
            console.log('previous_detiale', previous_detiale)
            if (previous_detiale == null) {
                res.status(400).json({ message: "First complete 10th qualification." })
            }
            else {
                const setData = {
                    school_name_12th: body.school_name,
                    board_12th: body.class_name,
                    education_medium_12th: body.education_medium,
                    passing_year_12th: body.passing_year,
                    parcentage_12th: body.class_name,
                    education_mode_12th: body.education_mode,
                    achivement_12th: achivementImg
                }
                console.log('setData', setData)
                const updateEducation = await Education.updateOne({ student_id: body.student_id }, setData);
                if (updateEducation) {
                    res.status(200).json({ status: true, message: "12th education details added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            }
        }
        else if (body.education_type === 'ug_diploma') {
            const previous_detiale = await Education.findOne({ student_id: body.student_id });
            if (previous_detiale == null) {
                res.status(400).json({ message: "First complete 10th and 12th qualification." })
            }
            else if (previous_detiale) {
                if (previous_detiale.school_name_10th == null || previous_detiale.school_name_12th == null || previous_detiale.passing_year_10th == null) {
                    res.status(400).json({ message: "First complete 10th and 12th qualification." })
                }
            }
            else {
                const setData = {
                    institute_ug_dp: body.school_name,
                    course_ug_dp: body.class_name,
                    education_medium_ug_dp: body.education_medium,
                    passing_year_ug_dp: body.passing_year,
                    parcentage_ug_dp: body.class_name,
                    education_mode_ug_dp: body.education_mode,
                    achivement_ug_dp: achivementImg
                }
                const updateEducation = await Education.updateOne({ student_id: body.student_id }, setData);
                if (updateEducation) {
                    res.status(200).json({ status: true, message: "Ug diploma education detail added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            }
        }
        else if (body.education_type === 'Ug') {
            const previous_detiale = await Education.findOne({ student_id: body.student_id });
            if (previous_detiale == null) {
                res.status(400).json({ message: "First complete 10th and 12th qualification." })
            }
            else if (previous_detiale && previous_detiale.school_name_10th == null || previous_detiale.school_name_12th == null || previous_detiale.passing_year_10th == null) {
                res.status(400).json({ message: "First complete 10th and 12th qualification." })
            }
            else {
                const setData = {
                    institute_ug: body.school_name,
                    course_ug: body.class_name,
                    education_medium_ug: body.education_medium,
                    passing_year_ug: body.passing_year,
                    parcentage_ug: body.class_name,
                    education_mode_ug: body.education_mode,
                    achivement_ug: achivementImg
                }
                const updateEducation = await Education.updateOne({ student_id: body.student_id }, setData);
                if (updateEducation) {
                    res.status(200).json({ status: true, message: "Ug education detail added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            };
        }
        else if (body.education_type == 'Pg') {
            const previous_detiale = await Education.findOne({ student_id: body.student_id });
            if (previous_detiale == null) {
                res.status(400).json({ message: "First complete 10th, 12th and Ug qualification." })
            }
            else if (previous_detiale && previous_detiale.school_name_10th == null || previous_detiale.school_name_12th == null || previous_detiale.institute_ug == null) {
                res.status(400).json({ message: "First complete 10th and 12th and Ug qualification." })
            }
            else {
                const setData = {
                    institute_pg: body.school_name,
                    course_pg: body.class_name,
                    education_medium_pg: body.education_medium,
                    passing_year_pg: body.passing_year,
                    parcentage_pg: body.class_name,
                    education_mode_pg: body.education_mode,
                    achivement_pg: achivementImg
                }
                const updateEducation = await Education.updateOne({ student_id: body.student_id }, setData);
                if (updateEducation) {
                    res.status(200).json({ status: true, message: "Pg education detail added successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Somthing is wrong." });
                }
            }
        }
        else {
            res.status(400).json({ message: "Select right education type" })
        }
    } catch (error) {
        console.log('education_qualification Error', error);
        res.status(500).json(error);
    }
}


module.exports.below_10th_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            class_name: Joi.string().required().messages({
                'string.empty': 'Class_name cannot be an empty field',
                'any.required': 'Class_name is required field'
            }),
            school_name: Joi.string().required().messages({
                'string.empty': 'School_name cannot be an empty field',
                'any.required': 'School_name is required field'
            }),
            education_medium: Joi.string().required().messages({
                'string.empty': 'Education_medium cannot be an empty field',
                'any.required': 'Education_medium is required field'
            }),
            passing_year: Joi.string().required().messages({
                'string.empty': 'Passing_year cannot be an empty field',
                'any.required': 'Passing_year is required field'
            }),
            parcentage: Joi.string().required().messages({
                'string.empty': 'Parcentage cannot be an empty field',
                'any.required': 'Parcentage is required field'
            }),
            education_mode: Joi.string().required().messages({
                'string.empty': 'Education_mode cannot be an empty field',
                'any.required': 'Education_mode is required field'
            })
        });
        const { student_id, class_name, school_name, education_medium, passing_year, education_mode, parcentage } = req.body;
        const below10th = { student_id, class_name, school_name, education_medium, passing_year, education_mode, parcentage }
        checkValidation.joiValidation(schema, below10th);
        if (req.files && req.files.achivement) {
            let image = req.files.achivement;
            below10th.achivement = await imageurl.processImage(image, 'achivementImg', req);
        }
        const addEducation = await Education.create(below10th);
        if (addEducation) {
            await Students.updateOne({ _id: student_id }, { criteria: 'below_10th' });
            res.status(200).json({ status: true, message: "Education details has been added successfully." });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('below_10th_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.class_10th_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            school_name_10th: Joi.string().required().messages({
                'string.empty': 'School_name_10th cannot be an empty field',
                'any.required': 'School_name_10th is required field'
            }),
            board_10th: Joi.string().required().messages({
                'string.empty': 'Board_10th cannot be an empty field',
                'any.required': 'Board_10th is required field'
            }),
            education_medium_10th: Joi.string().required().messages({
                'string.empty': 'Education_medium_10th cannot be an empty field',
                'any.required': 'Education_medium_10th is required field'
            }),
            education_mode_10th: Joi.string().required().messages({
                'string.empty': 'Education_mode_10th cannot be an empty field',
                'any.required': 'Education_mode_10th is required field'
            }),
        });
        const { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th } = req.body;
        const data10th = { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th }
        checkValidation.joiValidation(schema, data10th);
        data10th.passing_year_10th = req.body.passing_year_10th;
        data10th.parcentage_10th = req.body.parcentage_10th;
        data10th.pursuing_10th = req.body.pursuing_10th;
        const findQualification = await Education.findOne({ student_id: student_id });
        if (findQualification) {
            res.status(400).json({ message: "Qualification already Exist" });
        } else {
            if (req.files && req.files.achivement_10th) {
                let image = req.files.achivement_10th;
                data10th.achivement_10th = await imageurl.processImage(image, 'achivementImg', req);
            }
            const addEducation = await Education.create(data10th);
            if (addEducation) {
                await Students.updateOne({ _id: student_id }, { criteria: 'class_10th' });
                res.status(200).json({ status: true, message: "Education details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('class_10th_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.class_12th_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'student_id cannot be an empty field',
                'any.required': 'student_id is required field'
            }),
            school_name_10th: Joi.string().required().messages({
                'string.empty': 'school_name_10th cannot be an empty field',
                'any.required': 'school_name_10th is required field'
            }),
            board_10th: Joi.string().required().messages({
                'string.empty': 'board_10th cannot be an empty field',
                'any.required': 'board_10th is required field'
            }),
            education_medium_10th: Joi.string().required().messages({
                'string.empty': 'education_medium_10th cannot be an empty field',
                'any.required': 'education_medium_10th is required field'
            }),
            education_mode_10th: Joi.string().required().messages({
                'string.empty': 'education_mode_10th cannot be an empty field',
                'any.required': 'education_mode_10th is required field'
            }),
            school_name_12th: Joi.string().required().messages({
                'string.empty': 'school_name_12th cannot be an empty field',
                'any.required': 'school_name_12th is required field'
            }),
            board_12th: Joi.string().required().messages({
                'string.empty': 'board_12th cannot be an empty field',
                'any.required': 'board_12th is required field'
            }),
            education_medium_12th: Joi.string().required().messages({
                'string.empty': 'education_medium_12th cannot be an empty field',
                'any.required': 'education_medium_12th is required field'
            }),
            education_mode_12th: Joi.string().required().messages({
                'string.empty': 'education_mode_12th cannot be an empty field',
                'any.required': 'education_mode_12th is required field'
            }),
        });
        const { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th } = req.body;
        const data12th = { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th }
        checkValidation.joiValidation(schema, data12th);
        data12th.passing_year_10th = req.body.passing_year_10th;
        data12th.parcentage_10th = req.body.parcentage_10th;
        data12th.pursuing_10th = req.body.pursuing_10th;
        data12th.passing_year_12th = req.body.passing_year_12th;
        data12th.parcentage_12th = req.body.parcentage_12th;
        data12th.pursuing_12th = req.body.pursuing_12th;
        const findQualification = await Education.findOne({ student_id: student_id });
        if (findQualification) {
            res.status(400).json({ message: "Qualification already Exist" });
        } else {
            if (req.files) {
                if (req.files.achivement_10th) {
                    let image = req.files.achivement_10th;
                    data12th.achivement_10th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_12th) {
                    let image = req.files.achivement_12th;
                    data12th.achivement_12th = await imageurl.processImage(image, 'achivementImg', req);
                }
            }
            const addEducation = await Education.create(data12th);
            if (addEducation) {
                await Students.updateOne({ _id: student_id }, { criteria: 'class_12th' });
                res.status(200).json({ status: true, message: "Education details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('class_12th_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.ug_diploma_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'student_id cannot be an empty field',
                'any.required': 'student_id is required field'
            }),
            school_name_10th: Joi.string().required().messages({
                'string.empty': 'school_name_10th cannot be an empty field',
                'any.required': 'school_name_10th is required field'
            }),
            board_10th: Joi.string().required().messages({
                'string.empty': 'board_10th cannot be an empty field',
                'any.required': 'board_10th is required field'
            }),
            education_medium_10th: Joi.string().required().messages({
                'string.empty': 'education_medium_10th cannot be an empty field',
                'any.required': 'education_medium_10th is required field'
            }),
            education_mode_10th: Joi.string().required().messages({
                'string.empty': 'education_mode_10th cannot be an empty field',
                'any.required': 'education_mode_10th is required field'
            }),
            school_name_12th: Joi.string().required().messages({
                'string.empty': 'school_name_12th cannot be an empty field',
                'any.required': 'school_name_12th is required field'
            }),
            board_12th: Joi.string().required().messages({
                'string.empty': 'board_12th cannot be an empty field',
                'any.required': 'board_12th is required field'
            }),
            education_medium_12th: Joi.string().required().messages({
                'string.empty': 'education_medium_12th cannot be an empty field',
                'any.required': 'education_medium_12th is required field'
            }),
            education_mode_12th: Joi.string().required().messages({
                'string.empty': 'education_mode_12th cannot be an empty field',
                'any.required': 'education_mode_12th is required field'
            }),
            institute_ug_dp: Joi.string().required().messages({
                'string.empty': 'institute_ug_dp cannot be an empty field',
                'any.required': 'institute_ug_dp is required field'
            }),
            course_ug_dp: Joi.string().required().messages({
                'string.empty': 'course_ug_dp cannot be an empty field',
                'any.required': 'course_ug_dp is required field'
            }),
            education_medium_ug_dp: Joi.string().required().messages({
                'string.empty': 'education_medium_ug_dp cannot be an empty field',
                'any.required': 'education_medium_ug_dp is required field'
            }),
            education_mode_ug_dp: Joi.string().required().messages({
                'string.empty': 'education_mode_ug_dp cannot be an empty field',
                'any.required': 'education_mode_ug_dp is required field'
            }),
        });
        const { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug_dp, course_ug_dp, education_medium_ug_dp, education_mode_ug_dp } = req.body;
        const dataUgDp = { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug_dp, course_ug_dp, education_medium_ug_dp, education_mode_ug_dp }
        checkValidation.joiValidation(schema, dataUgDp);
        dataUgDp.passing_year_10th = req.body.passing_year_10th;
        dataUgDp.parcentage_10th = req.body.parcentage_10th;
        dataUgDp.pursuing_10th = req.body.pursuing_10th;
        dataUgDp.passing_year_12th = req.body.passing_year_12th;
        dataUgDp.parcentage_12th = req.body.parcentage_12th;
        dataUgDp.pursuing_12th = req.body.pursuing_12th;
        dataUgDp.passing_year_ug_dp = req.body.passing_year_ug_dp;
        dataUgDp.parcentage_ug_dp = req.body.parcentage_ug_dp;
        dataUgDp.pursuing_ug_dp = req.body.pursuing_ug_dp;
        const findQualification = await Education.findOne({ student_id: student_id });
        if (findQualification) {
            res.status(400).json({ message: "Qualification already Exist" });
        } else {
            if (req.files) {
                if (req.files.achivement_10th) {
                    let image = req.files.achivement_10th;
                    dataUgDp.achivement_10th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_12th) {
                    let image = req.files.achivement_12th;
                    dataUgDp.achivement_12th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_ug_dp) {
                    let image = req.files.achivement_ug_dp;
                    dataUgDp.achivement_ug_dp = await imageurl.processImage(image, 'achivementImg', req);
                }
            }
            const addEducation = await Education.create(dataUgDp);
            if (addEducation) {
                await Students.updateOne({ _id: student_id }, { criteria: 'ug_diploma' });
                res.status(200).json({ status: true, message: "Education details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('ug_diploma_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.ug_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'student_id cannot be an empty field',
                'any.required': 'student_id is required field'
            }),
            school_name_10th: Joi.string().required().messages({
                'string.empty': 'school_name_10th cannot be an empty field',
                'any.required': 'school_name_10th is required field'
            }),
            board_10th: Joi.string().required().messages({
                'string.empty': 'board_10th cannot be an empty field',
                'any.required': 'board_10th is required field'
            }),
            education_medium_10th: Joi.string().required().messages({
                'string.empty': 'education_medium_10th cannot be an empty field',
                'any.required': 'education_medium_10th is required field'
            }),
            education_mode_10th: Joi.string().required().messages({
                'string.empty': 'education_mode_10th cannot be an empty field',
                'any.required': 'education_mode_10th is required field'
            }),
            school_name_12th: Joi.string().required().messages({
                'string.empty': 'school_name_12th cannot be an empty field',
                'any.required': 'school_name_12th is required field'
            }),
            board_12th: Joi.string().required().messages({
                'string.empty': 'board_12th cannot be an empty field',
                'any.required': 'board_12th is required field'
            }),
            education_medium_12th: Joi.string().required().messages({
                'string.empty': 'education_medium_12th cannot be an empty field',
                'any.required': 'education_medium_12th is required field'
            }),
            education_mode_12th: Joi.string().required().messages({
                'string.empty': 'education_mode_12th cannot be an empty field',
                'any.required': 'education_mode_12th is required field'
            }),
            institute_ug: Joi.string().required().messages({
                'string.empty': 'institute_ug cannot be an empty field',
                'any.required': 'institute_ug is required field'
            }),
            course_ug: Joi.string().required().messages({
                'string.empty': 'course_ug cannot be an empty field',
                'any.required': 'course_ug is required field'
            }),
            education_medium_ug: Joi.string().required().messages({
                'string.empty': 'education_medium_ug cannot be an empty field',
                'any.required': 'education_medium_ug is required field'
            }),
            education_mode_ug: Joi.string().required().messages({
                'string.empty': 'education_mode_ug cannot be an empty field',
                'any.required': 'education_mode_ug is required field'
            }),
        });
        const { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug, course_ug, education_medium_ug, education_mode_ug } = req.body;
        const dataUgDp = { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug, course_ug, education_medium_ug, education_mode_ug }
        checkValidation.joiValidation(schema, dataUgDp);
        dataUgDp.passing_year_10th = req.body.passing_year_10th;
        dataUgDp.parcentage_10th = req.body.parcentage_10th;
        dataUgDp.pursuing_10th = req.body.pursuing_10th;
        dataUgDp.passing_year_12th = req.body.passing_year_12th;
        dataUgDp.parcentage_12th = req.body.parcentage_12th;
        dataUgDp.pursuing_12th = req.body.pursuing_12th;
        dataUgDp.passing_year_ug = req.body.passing_year_ug;
        dataUgDp.parcentage_ug = req.body.parcentage_ug;
        dataUgDp.pursuing_ug = req.body.pursuing_ug;
        const findQualification = await Education.findOne({ student_id: student_id });
        if (findQualification) {
            res.status(400).json({ message: "Qualification already Exist" });
        } else {
            if (req.files) {
                if (req.files.achivement_10th) {
                    let image = req.files.achivement_10th;
                    dataUgDp.achivement_10th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_12th) {
                    let image = req.files.achivement_12th;
                    dataUgDp.achivement_12th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_ug) {
                    let image = req.files.achivement_ug;
                    dataUgDp.achivement_ug = await imageurl.processImage(image, 'achivementImg', req);
                }
            }
            const addEducation = await Education.create(dataUgDp);
            if (addEducation) {
                await Students.updateOne({ _id: student_id }, { criteria: 'Ug' });
                res.status(200).json({ status: true, message: "Education details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('ug_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.pg_qualification = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'student_id cannot be an empty field',
                'any.required': 'student_id is required field'
            }),
            school_name_10th: Joi.string().required().messages({
                'string.empty': 'school_name_10th cannot be an empty field',
                'any.required': 'school_name_10th is required field'
            }),
            board_10th: Joi.string().required().messages({
                'string.empty': 'board_10th cannot be an empty field',
                'any.required': 'board_10th is required field'
            }),
            education_medium_10th: Joi.string().required().messages({
                'string.empty': 'education_medium_10th cannot be an empty field',
                'any.required': 'education_medium_10th is required field'
            }),
            education_mode_10th: Joi.string().required().messages({
                'string.empty': 'education_mode_10th cannot be an empty field',
                'any.required': 'education_mode_10th is required field'
            }),
            school_name_12th: Joi.string().required().messages({
                'string.empty': 'school_name_12th cannot be an empty field',
                'any.required': 'school_name_12th is required field'
            }),
            board_12th: Joi.string().required().messages({
                'string.empty': 'board_12th cannot be an empty field',
                'any.required': 'board_12th is required field'
            }),
            education_medium_12th: Joi.string().required().messages({
                'string.empty': 'education_medium_12th cannot be an empty field',
                'any.required': 'education_medium_12th is required field'
            }),
            education_mode_12th: Joi.string().required().messages({
                'string.empty': 'education_mode_12th cannot be an empty field',
                'any.required': 'education_mode_12th is required field'
            }),
            institute_ug: Joi.string().required().messages({
                'string.empty': 'institute_ug cannot be an empty field',
                'any.required': 'institute_ug is required field'
            }),
            course_ug: Joi.string().required().messages({
                'string.empty': 'course_ug cannot be an empty field',
                'any.required': 'course_ug is required field'
            }),
            education_medium_ug: Joi.string().required().messages({
                'string.empty': 'education_medium_ug cannot be an empty field',
                'any.required': 'education_medium_ug is required field'
            }),
            education_mode_ug: Joi.string().required().messages({
                'string.empty': 'education_mode_ug cannot be an empty field',
                'any.required': 'education_mode_ug is required field'
            }),
            institute_pg: Joi.string().required().messages({
                'string.empty': 'institute_pg cannot be an empty field',
                'any.required': 'institute_pg is required field'
            }),
            course_pg: Joi.string().required().messages({
                'string.empty': 'course_pg cannot be an empty field',
                'any.required': 'course_pg is required field'
            }),
            education_medium_pg: Joi.string().required().messages({
                'string.empty': 'education_medium_pg cannot be an empty field',
                'any.required': 'education_medium_pg is required field'
            }),
            education_mode_pg: Joi.string().required().messages({
                'string.empty': 'education_mode_pg cannot be an empty field',
                'any.required': 'education_mode_pg is required field'
            }),
        });
        const { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug, course_ug, education_medium_ug, education_mode_ug, institute_pg, course_pg, education_medium_pg, education_mode_pg } = req.body;
        const dataUgDp = { student_id, school_name_10th, board_10th, education_medium_10th, education_mode_10th, school_name_12th, board_12th, education_medium_12th, education_mode_12th, institute_ug, course_ug, education_medium_ug, education_mode_ug, institute_pg, course_pg, education_medium_pg, education_mode_pg }
        checkValidation.joiValidation(schema, dataUgDp);
        dataUgDp.passing_year_10th = req.body.passing_year_10th;
        dataUgDp.parcentage_10th = req.body.parcentage_10th;
        dataUgDp.pursuing_10th = req.body.pursuing_10th;
        dataUgDp.passing_year_12th = req.body.passing_year_12th;
        dataUgDp.parcentage_12th = req.body.parcentage_12th;
        dataUgDp.pursuing_12th = req.body.pursuing_12th;
        dataUgDp.passing_year_ug = req.body.passing_year_ug;
        dataUgDp.parcentage_ug = req.body.parcentage_ug;
        dataUgDp.pursuing_ug = req.body.pursuing_ug;
        dataUgDp.passing_year_pg = req.body.passing_year_pg;
        dataUgDp.parcentage_pg = req.body.parcentage_pg;
        dataUgDp.pursuing_pg = req.body.pursuing_pg;
        const findQualification = await Education.findOne({ student_id: student_id });
        if (findQualification) {
            res.status(400).json({ message: "Qualification already Exist" });
        } else {
            if (req.files) {
                if (req.files.achivement_10th) {
                    let image = req.files.achivement_10th;
                    dataUgDp.achivement_10th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_12th) {
                    let image = req.files.achivement_12th;
                    dataUgDp.achivement_12th = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_ug) {
                    let image = req.files.achivement_ug;
                    dataUgDp.achivement_ug = await imageurl.processImage(image, 'achivementImg', req);
                }
                if (req.files.achivement_pg) {
                    let image = req.files.achivement_pg;
                    dataUgDp.achivement_pg = await imageurl.processImage(image, 'achivementImg', req);
                }
            }
            const addEducation = await Education.create(dataUgDp);
            if (addEducation) {
                await Students.updateOne({ _id: student_id }, { criteria: 'Pg' });
                res.status(200).json({ status: true, message: "Education details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('pg_qualification Error', error);
        res.status(500).json(error);
    }
}



module.exports.jobs_seeker = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            job_role: Joi.string().required().messages({
                'string.empty': 'Job_role cannot be an empty field',
                'any.required': 'Job_role is required field'
            }),
            // class_name: Joi.string().required().messages({
            //     'string.empty': 'Class cannot be an empty field',
            //     'any.required': 'Class is required field'
            // }),
            // school_name: Joi.string().required().messages({
            //     'string.empty': 'School cannot be an empty field',
            //     'any.required': 'School is required field'
            // }),
            // parcentage: Joi.string().required().messages({
            //     'string.empty': 'Parcentage cannot be an empty field',
            //     'any.required': 'Parcentage is required field'
            // }),
            // passing_year: Joi.string().required().messages({
            //     'string.empty': 'Passing_year cannot be an empty field',
            //     'any.required': 'Passing_year is required field'
            // }),
            // school_name_10th: Joi.string().required().messages({
            //     'string.empty': 'School_name_10th cannot be an empty field',
            //     'any.required': 'School_name_10th is required field'
            // }),
            // board_10th: Joi.string().required().messages({
            //     'string.empty': 'Board_10th cannot be an empty field',
            //     'any.required': 'Board_10th is required field'
            // }),
            // passing_year_10th: Joi.string().required().messages({
            //     'string.empty': 'Passing_year_10th cannot be an empty field',
            //     'any.required': 'Passing_year_10th is required field'
            // }),
            // parcentage_10th: Joi.string().required().messages({
            //     'string.empty': 'Parcentage cannot be an empty field',
            //     'any.required': 'Parcentage is required field'
            // }),
            // school_name_12th: Joi.string().required().messages({
            //     'string.empty': 'School_name_12th cannot be an empty field',
            //     'any.required': 'School_name_12th is required field'
            // }),
            // subject_12th: Joi.string().required().messages({
            //     'string.empty': 'Subject_12th cannot be an empty field',
            //     'any.required': 'Subject_12th is required field'
            // }),
            // board_12th: Joi.string().required().messages({
            //     'string.empty': 'Board_12th cannot be an empty field',
            //     'any.required': 'Board_12th is required field'
            // }),
            // passing_year_12th: Joi.string().required().messages({
            //     'string.empty': 'Passing_year_12th cannot be an empty field',
            //     'any.required': 'Passing_year_12th is required field'
            // }),
            // parcentage_12th: Joi.string().required().messages({
            //     'string.empty': 'Parcentage_12th cannot be an empty field',
            //     'any.required': 'Parcentage_12th is required field'
            // }),

            // institute_ug: Joi.string().required().messages({
            //     'string.empty': 'Institute_ug cannot be an empty field',
            //     'any.required': 'Institute_ug is required field'
            // }),
            // course_ug: Joi.string().required().messages({
            //     'string.empty': 'Course_ug cannot be an empty field',
            //     'any.required': 'Course_ug is required field'
            // }),
            // passing_year_ug: Joi.string().required().messages({
            //     'string.empty': 'Passing_year_ug cannot be an empty field',
            //     'any.required': 'Passing_year_ug is required field'
            // }),
            // parcentage_ug: Joi.string().required().messages({
            //     'string.empty': 'Parcentage_ug cannot be an empty field',
            //     'any.required': 'Parcentage_ug is required field'
            // }),
            // institute_pg: Joi.string().required().messages({
            //     'string.empty': 'Institute_pg cannot be an empty field',
            //     'any.required': 'Institute_pg is required field'
            // }),
            // course_pg: Joi.string().required().messages({
            //     'string.empty': 'Course_pg cannot be an empty field',
            //     'any.required': 'Course_pg is required field'
            // }),
            // passing_year_pg: Joi.string().required().messages({
            //     'string.empty': 'Passing_year_pg cannot be an empty field',
            //     'any.required': 'Passing_year_pg is required field'
            // }),
            // parcentage_pg: Joi.string().required().messages({
            //     'string.empty': 'Parcentage_pg cannot be an empty field',
            //     'any.required': 'Parcentage_pg is required field'
            // }),

        });
        // console.log('req.body', req.body);
        // const { student_id, job_role, school_name_10th, board_10th, passing_year_10th, parcentage_10th, school_name_12th, subject_12th, board_12th, passing_year_12th, parcentage_12th } = req.body;
        // const body = { student_id, job_role, school_name_10th, board_10th, passing_year_10th, parcentage_10th, school_name_12th, subject_12th, board_12th, passing_year_12th, parcentage_12th };
        const { student_id, job_role } = req.body;
        const body = { student_id, job_role };
        checkValidation.joiValidation(schema, body);
        // const data = { institute_ug, course_ug, passing_year_ug, parcentage_ug, institute_pg, course_pg, passing_year_pgparcentage_pg } = req.body
        // const setData = { ...body, ...data }
        const setData = req.body;
        // console.log('setData', setData);
        const uniqeStudent = await Jobseeker.find({ student_id: body.student_id });
        if (uniqeStudent.length) {
            res.status(400).json({ message: "Student Id is already exist." });
        }
        else {
            const addjobseeker = await Jobseeker.create(setData);
            if (addjobseeker) {
                await Students.updateOne({ _id: student_id }, { criteria: 'job_seeker' });
                res.status(201).json({ status: true, message: "Job Seeker details has been added successfully." });
            }
            else {
                res.status(400).json({ status: false, message: "Somthing is wrong." });
            }
        }
    } catch (error) {
        console.log('jobs_seeker Error', error);
        res.status(500).json(error);
    }
}




module.exports.slots_list = async (req, res) => {
    try {
        const currentDate = req.query.date;
        // console.log('data', currentDate);
        // currentDate.setHours(0, 0, 0, 0);
        // const endOfDay = new Date(currentDate);
        // endOfDay.setHours(23, 59, 59, 999);
        let getdata = await ScheduleMeets.find({ schedule_date: currentDate }, { schedule_from_time: 1 });
        const slotData1 = await Time_slot.find().sort({ createdAt: 1 }).lean();
        if (slotData1.length) {
            const slotData = slotData1.map((row) => {
                const match = getdata.find((row2) => row.slot === row2.schedule_from_time);

                if (match) {
                    row.status = false;
                } else {
                    row.status = true;
                }
                return row;
            });
            res.status(200).json({ status: true, message: "Time slot list", data: slotData });
        }
        else {
            res.status(404).json({ status: false, message: "Time slot is not available." });
        }
    } catch (error) {
        console.log('slots_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.select_hobby = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            hobbys: Joi.array().required().messages({
                'string.empty': 'Hobbys cannot be an empty field',
                'any.required': 'Hobbys is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const hobbys = req.body.hobbys;
        const existUser = await Students.findOne({ _id: req.body.student_id });
        console.log('existUser', existUser);
        if (existUser) {
            const assignRole = await Students.updateOne({ _id: req.body.student_id }, { hobbys: hobbys });
            if (assignRole) {
                res.status(200).json({ status: true, message: 'Hobbies has been added successfully.', });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
        else {
            res.status(400).json({ status: false, message: "Student not found" });
        }
    } catch (error) {
        console.log('select_hobby Error', error);
        res.status(500).json(error);
    }
}



module.exports.schedule_career_advice = async (req, res) => {
    try {
        const schema = Joi.object({
            student_id: Joi.string().required().messages({
                'string.empty': 'Student_id cannot be an empty field',
                'any.required': 'Student_id is required field'
            }),
            title: Joi.array().required().messages({
                'string.empty': 'Title cannot be an empty field',
                'any.required': 'Title is required field'
            }),
            // description: Joi.string().required().messages({
            //     'string.empty': 'Description cannot be an empty field',
            //     'any.required': 'Description is required field'
            // }),
            schedule_date: Joi.string().required().messages({
                'string.empty': 'Date cannot be an empty field',
                'any.required': 'Date is required field'
            }),
            schedule_from_time: Joi.string().required().messages({
                'string.empty': 'From_time cannot be an empty field',
                'any.required': 'From_time is required field'
            }),
            // schedule_to_time: Joi.string().required().messages({
            //     'string.empty': 'To_time cannot be an empty field',
            //     'any.required': 'To_time is required field'
            // })
        });
        const { student_id, title, schedule_date, schedule_from_time } = req.body;
        const scheduleData = { student_id, title, schedule_date, schedule_from_time };
        checkValidation.joiValidation(schema, scheduleData);
        scheduleData.description = req.body.description;
        const checkMeets = await ScheduleMeets.find({ $and: [{ schedule_date: req.body.schedule_date }, { schedule_from_time: req.body.schedule_from_time }] });
        if (checkMeets.length > 0) {
            checkMeets.map((row) => {
                res.status(400).json({ message: 'This time slot is already booked.' });
            });
        }
        else {
            const addData = await ScheduleMeets.create(scheduleData);
            if (addData) {
                let studentData = await Students.findOne({ _id: addData.student_id });
                console.log('studentData', studentData);
                let userData = await User.findOne({ _id: studentData.userId });
                console.log('userData', userData);
                const recipientList = [
                    {
                        email: "parimallabs@gmail.com",
                        subject: 'Carreer Advice Scheduled Successfully',
                        htmlContent: { name: studentData.student_name, mobile: userData.mobile_no, email: userData.email, date: addData.schedule_date, time: addData.schedule_from_time, title: addData.title, query: addData.description },
                    },
                    // {
                    //     email: userData.email,
                    //     subject: "Carreer Advice Schedul Successfully",
                    //     htmlContent: { Date: addData.schedule_date, Time: addData.schedule_from_time }
                    // }
                ];
                await sendmultiple(recipientList);
                res.status(200).json({ status: true, message: 'Meeting scheduled successfully', data: addData });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
    } catch (error) {
        console.log('schedule_career_advice Error', error);
        res.status(500).json(error);
    }
}



module.exports.schedule_view = async (req, res) => {
    try {
        const schedul_id = req.query.schedul_id;
        if (!schedul_id) {
            res.status(400).json({ message: "Schedul Id is required" });
        }
        else {
            const findSchedule = await ScheduleMeets.find({ _id: req.query.schedul_id });
            if (findSchedule) {
                res.status(200).json({ status: true, message: "Schedule data", data: findSchedule });
            }
            else {
                res.status(404).json({ status: false, message: "Time slot is not available." });
            }
        }
    } catch (error) {
        console.log('schedule_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.schedule_edit = async (req, res) => {
    try {
        const schedul_id = req.body.schedul_id;
        const setData = req.body;
        if (!schedul_id) {
            res.status(400).json({ message: "Schedul Id is required" });
        }
        else {
            const findSchedule = await ScheduleMeets.findOne({ _id: schedul_id });
            if (findSchedule) {
                const updateSchedule = await ScheduleMeets.updateOne({ _id: schedul_id }, setData);
                if (updateSchedule) {
                    res.status(200).json({ status: true, message: "Schedule meet updated successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Please try again" });
                }
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('schedule_edit Error', error);
        res.status(500).json(error);
    }
}



module.exports.explore_more_discipline = async (req, res) => {
    try {
        const disciplineData = await Desciplines.find().sort({ discipline_name: 1 });
        if (disciplineData.length) {
            let disciplines = [];
            let disciplineSet = new Set();
            disciplineData.map((row) => {
                let discipline = row.discipline_name;
                if (!disciplineSet.has(discipline)) {
                    disciplines.push({ discipline: discipline });
                    disciplineSet.add(discipline);
                }
            });
            // async function translateToHindi(text) {
            //     try {
            //         const result = await translate(text, { from: 'en', to: 'hi' });
            //         return result.text;
            //     } catch (error) {
            //         console.error('Translation error:', error);
            //         return text; // Return original text in case of an error
            //     }
            // }

            // async function translateUserDataToHindi(userData) {
            //     const translatedUserData = {};
            //     for (const key in userData) {
            //         const translatedValue = await translateToHindi(userData[key].toString());
            //         translatedUserData[key] = translatedValue;
            //     }
            //     return translatedUserData;
            // }

            // // Example usage
            // translateUserDataToHindi(disciplines)
            //     .then((translatedUserData) => {
            //         console.log('Translated User Data:', translatedUserData);
            //     })
            //     .catch((err) => {
            //         console.error('Translation error:', err);
            //     });

            res.status(200).json({ status: true, message: "Desciplines list", data: disciplines });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('explore_more_discipline Error', error);
        res.status(500).json(error);
    }
}



module.exports.explore_more_subject = async (req, res) => {
    try {
        const discipline_name = req.query.discipline_name;
        if (!discipline_name) {
            res.status(400).json({ message: "Please Select A Discipline" });
        }
        else {
            const disciplineData = await Desciplines.find({ discipline_name: discipline_name });
            let subjects = [];
            let subjectSet = new Set();
            const promiss = Promise.all(disciplineData.map(async (row) => {
                const subject = await Courses.find({ discipline_id: row._id });
                subject.forEach((subj) => {
                    if (!subjectSet.has(subj.subject_name)) {
                        subjects.push({ subject: subj.subject_name });
                        subjectSet.add(subj.subject_name);
                    }
                });
            }));
            promiss.then(() => {
                subjects.sort((a, b) => a.subject.localeCompare(b.subject))
                res.status(200).json({ status: true, message: "Subject list", data: subjects });
            }).catch((error) => {
                console.error("Error fetching subjects", error);
            });
        }
    } catch (error) {
        console.log('explore_more_subject Error', error);
        res.status(500).json(error);
    }
}



module.exports.explore_more_courses = async (req, res) => {
    try {
        const subject_name = req.query.subject_name;
        if (!subject_name) {
            res.status(400).json({ message: "Please Select A Subject" });
        }
        else {
            // let filter = {}
            // if (subject_name) {
            //     filter.subject_name = subject_name
            // }
            const courseData = await Courses.find({ subject_name: subject_name }).sort({ course_name: 1 });
            let courses = [];
            let courseSet = new Set();
            let cities = [];
            let citiesSet = new Set();
            let instituteType = [];
            let instituteTypeSet = new Set();
            let program_lavels = [];
            let program_lavelSet = new Set();
            const promiss = Promise.all(courseData.map(async (row) => {
                if (!courseSet.has(row.course_name)) {
                    courses.push({ course: row.course_name });
                    courseSet.add(row.course_name);
                }
                let singleCity = row.place;
                if (!citiesSet.has(singleCity)) {
                    cities.push({ cities: singleCity });
                    citiesSet.add(singleCity);
                }
                let type = row.institute_type;
                if (!instituteTypeSet.has(type)) {
                    instituteType.push({ institute_type: type });
                    instituteTypeSet.add(type);
                }
                let program_lavel = row.program_lavel;
                if (!program_lavelSet.has(program_lavel)) {
                    program_lavels.push({ program_lavel: program_lavel });
                    program_lavelSet.add(program_lavel);
                }
            }));
            promiss.then(() => {
                // courses.sort((a, b) => a.course.localeCompare(b.course));
                // program_lavels.sort((a, b) => a.program_lavel.localeCompare(b.program_lavel));
                // cities.sort((a, b) => a.citie.localeCompare(b.citie));
                let newData = {
                    courses,
                    program_lavels,
                    instituteType,
                    cities,
                }
                res.status(200).json({ status: true, message: "Course list", data: newData });
            }).catch((error) => {
                console.error("Error fetching subjects", error);
            });
        }
    } catch (error) {
        console.log('explore_more_courses Error', error);
        res.status(500).json(error);
    }
}



module.exports.explore_more_level = async (req, res) => {
    try {
        const course_name = req.query.course_name;
        if (!course_name) {
            res.status(400).json({ message: "Please Select A Course" });
        }
        else {
            const levelData = await Courses.find({ course_name: course_name });
            let program_lavels = [];
            let program_lavelSet = new Set();
            levelData.map((row) => {
                let program_lavel = row.program_lavel;
                if (!program_lavelSet.has(program_lavel)) {
                    program_lavels.push({ program_lavel: program_lavel });
                    program_lavelSet.add(program_lavel);
                }
            });
            res.status(200).json({ status: true, message: "lavels list", data: program_lavels });
        }
    } catch (error) {
        console.log('explore_more_level Error', error);
        res.status(500).json(error);
    }
}


module.exports.explore_more_city = async (req, res) => {
    try {
        const course_name = req.query.course_name;
        const program_lavel = req.query.program_lavel;
        let filter = { course_name }
        if (program_lavel) {
            filter.program_lavel = program_lavel
        }
        if (!course_name) {
            res.status(400).json({ message: "Please Select A Course" });
        }
        else {
            const city = await Courses.find(filter);
            let cities = [];
            let citiesSet = new Set();
            city.map((row) => {
                let singleCity = row.place;
                if (!citiesSet.has(singleCity)) {
                    cities.push({ cities: singleCity });
                    citiesSet.add(singleCity);
                }
            });
            res.status(200).json({ status: true, message: "Cities list", data: cities });
        }
    } catch (error) {
        console.log('explore_more_city Error', error);
        res.status(500).json(error);
    }
}


module.exports.explore_more_type = async (req, res) => {
    try {
        const city = await Courses.find();
        let instituteType = [];
        let instituteTypeSet = new Set();
        city.map((row) => {
            let type = row.institute_type;
            if (!instituteTypeSet.has(type)) {
                instituteType.push({ institute_type: type });
                instituteTypeSet.add(type);
            }
        });
        res.status(200).json({ status: true, message: "Institute type list", data: instituteType });
    } catch (error) {
        console.log('explore_more_type Error', error);
        res.status(500).json(error);
    }
}



module.exports.filtered_result = async (req, res) => {
    try {
        const discipline_name = req.body.discipline_name;
        if (!discipline_name) {
            res.status(400).json({ message: "Discipline is required." });
        }
        const instituteData = await Desciplines.find({ discipline_name: discipline_name });
        disciplineId = []
        instituteData.forEach(async (row) => {
            disciplineId.push(row._id);
        });
        let filter = {
            discipline_id: { $in: disciplineId }
        }
        if (req.body.subject_name) {
            filter.subject_name = req.body.subject_name;
        }
        if (req.body.course_name) {
            filter.course_name = req.body.course_name;
        }
        if (req.body.program_lavel) {
            filter.program_lavel = req.body.program_lavel;
        }
        if (req.body.institute_type) {
            filter.institute_type = req.body.institute_type;
        }
        if (req.body.city) {
            filter.place = req.body.city;
        }
        const course = await Courses.find(filter).lean();
        if (course.length) {
            const promiss = course.map(async (row) => {
                let instituteData = await Institutes.findOne({ _id: row.institute_id });
                if (instituteData) {
                    row.institute_name = instituteData.institute_name;
                    // console.log('row', instituteData.institute_name)
                    return row;
                }
                else {
                    console.log('row.institute_id', row.institute_id)
                }
            })
            const newData = await Promise.all(promiss);
            res.status(200).json({ status: true, message: "Institute filter Data", data: newData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found" });
        }
    } catch (error) {
        console.log('filtered_result Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_entrance_stream = async (req, res) => {
    try {
        const entranceStreamData = await Entrance_stream.find().sort({ steam_name: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Stream list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_entrance_stream Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_entrance_exam = async (req, res) => {
    try {
        const streamId = req.query.streamId;
        if (!streamId) {
            res.status(400).json({ message: "Stream Id is required." });
        }
        else {
            const entranceExamData = await Entrance_exams.find({ stream_id: streamId }).sort({ stream_id: 1 });
            if (entranceExamData.length) {
                res.status(200).json({ status: true, message: "Entrance exam list", data: entranceExamData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('get_entrance_exam Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_entrance_exam_view = async (req, res) => {
    try {
        const examId = req.query.examId;
        if (!examId) {
            res.status(400).json({ message: "Exam Id is required." });
        }
        else {
            const entranceExamData = await Entrance_exams.find({ _id: examId }).sort({ stream_id: 1 });
            if (entranceExamData.length) {
                res.status(200).json({ status: true, message: "Entrance exam view", data: entranceExamData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('get_entrance_exam_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_gov_sector = async (req, res) => {
    try {
        const entranceStreamData = await GovJobSector.find().sort({ job_sector: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Sector list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_gov_sector Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_gov_jobs = async (req, res) => {
    try {
        const sector_id = req.body.sector_id;
        if (!sector_id) {
            res.status(400).json({ message: "Sector Id is required." });
        }
        else {
            const entranceExamData = await GovJobS.find({ sector_id: { $in: sector_id } }).sort({ sector_id: 1 });
            if (entranceExamData.length) {
                console.log(entranceExamData.length)
                res.status(200).json({ status: true, message: "Govt jobs list", data: entranceExamData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('get_gov_jobs Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_gov_job_view = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        if (!jobId) {
            res.status(400).json({ message: "Exam Id is required." });
        }
        else {
            const entranceExamData = await GovJobS.find({ _id: jobId }).sort({ sector_id: -1 }).lean();
            if (entranceExamData.length) {
                let promiss = entranceExamData.map(async (row) => {
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
        console.log('get_gov_job_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_pvt_sector = async (req, res) => {
    try {
        const entranceStreamData = await PvtJobSector.find().sort({ job_sector: 1 });
        if (entranceStreamData.length) {
            res.status(200).json({ status: true, message: "Sector list", data: entranceStreamData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_pvt_sector Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_pvt_jobs = async (req, res) => {
    try {
        const sector_id = req.body.sector_id;
        if (!sector_id) {
            res.status(400).json({ message: "Sector is required." });
        }
        else {
            const entranceExamData = await PvtJobS.find({ sector_id: { $in: sector_id } }).sort({ sector_id: 1 });
            if (entranceExamData.length) {
                res.status(200).json({ status: true, message: "Pvt Jobs list", data: entranceExamData });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('get_pvt_jobs Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_pvt_job_view = async (req, res) => {
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
        console.log('get_pvt_job_view Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_scholership_list = async (req, res) => {
    try {
        const govtScholershipData = await GovtScholership.find().sort({ createdAt: -1 });
        if (govtScholershipData.length) {
            res.status(200).json({ status: true, message: "Govt Scholership list", data: govtScholershipData });
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
                res.status(200).json({ status: true, message: "Govt Scholership view", data: govtScholershipData });
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




module.exports.get_loan_bank_list = async (req, res) => {
    try {
        const bankData = await BankLoan.find().sort({ createdAt: -1 });
        if (bankData.length) {
            res.status(200).json({ status: true, message: "Bank list", data: bankData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_loan_bank_list Error', error);
        res.status(500).json(error);
    }
}




module.exports.get_profile = async (req, res) => {
    try {
        const userId = req.userId;
        const profileData = await User.findOne({ _id: userId }, { password: 0, role: 0 });
        if (profileData) {
            let student_registration = false;
            let student_id = "null";
            let education_qualification = false;
            let hobys = false;
            const checkStudent = await Students.findOne({ userId: profileData._id });
            if (checkStudent) {
                student_id = checkStudent._id;
                student_registration = true;
                if (checkStudent.hobbys.length) {
                    hobys = true
                }
                const checkQualification = await Education.findOne({ student_id: checkStudent._id });
                if (checkQualification) {
                    education_qualification = true;
                } else {
                    const checkQualification = await Jobseeker.findOne({ student_id: checkStudent._id });
                    if (checkQualification) {
                        education_qualification = true;
                    }
                }
            }
            res.status(200).json({ status: true, message: "Profile Data", student_registration, student_id, education_qualification, hobys, data: profileData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_profile Error', error);
        res.status(500).json(error);
    }
}



module.exports.update_profile = async (req, res) => {
    try {
        const userId = req.userId;
        const setData = req.body;
        const findSchedule = await User.findOne({ _id: userId });
        if (findSchedule) {
            const updateUser = await User.updateOne({ _id: userId }, setData);
            if (updateUser) {
                res.status(200).json({ status: true, message: "Profile updated successfully" });
            }
            else {
                res.status(400).json({ status: false, message: "Please try again" });
            }
        }
        else {
            res.status(404).json({ status: false, message: "Profile does not exist." });
        }
    } catch (error) {
        console.log('update_profile Error', error);
        res.status(500).json(error);
    }
}



module.exports.get_student_profile = async (req, res) => {
    try {
        const userId = req.userId;
        const profileData = await Students.findOne({ userId: userId }, { password: 0, role: 0, employee_id: 0 });
        if (profileData) {
            res.status(200).json({ status: true, message: "Student profile", data: profileData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('get_student_profile Error', error);
        res.status(500).json(error);
    }
}



module.exports.schedule_career_list = async (req, res) => {
    try {
        const student_id = req.query.student_id;
        if (!student_id) {
            res.status(400).json({ message: "Student_Id is required" });
        } else {
            const ScheduleData = await ScheduleMeets.find({ student_id: student_id }).sort({ createdAt: -1 });
            if (ScheduleData.length) {
                res.status(200).json({ status: true, message: "Schedule list", data: ScheduleData });
            }
            else {
                res.status(404).json({ status: false, message: "No Upcoming Schedule." });
            }
        }
    } catch (error) {
        console.log('schedule_career_list Error', error);
        res.status(500).json(error);
    }
}




module.exports.update_student_profile = async (req, res) => {
    try {
        const userId = req.userId;
        const student_id = req.body.student_id;
        const setData = req.body;
        if (!student_id) {
            res.status(400).json({ message: "Student Id is required" });
        }
        else {
            const profileData = await Students.findOne({ userId: userId }, { password: 0, role: 0, employee_id: 0 });
            if (profileData) {
                const updateStudent = await Students.updateOne({ userId: userId, _id: student_id }, setData);
                if (updateStudent) {
                    res.status(200).json({ status: true, message: "Student form updated successfully." });
                }
                else {
                    res.status(400).json({ status: false, message: "Please try again" });
                }
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('update_student_profile Error', error);
        res.status(500).json(error);
    }
}



module.exports.upload_profile_pic = async (req, res) => {
    try {
        const userId = req.userId;
        if (userId) {
            if (req.files) {
                if (req.files.profile) {
                    const image = req.files.profile;
                    const folder = 'profile';
                    const url = await imageurl.processImage(image, 'profile', req, folder);
                    const updateProfile = await User.updateOne({ _id: userId }, { $set: { profile: url } }, { upsert: false, multi: true });
                    if (updateProfile) {
                        res.status(200).json({ status: true, message: 'Image uploaded Successfully' });
                    }
                    else {
                        res.status(400).json({ status: false, message: 'Please try again.' });
                    }
                }
                else {
                    res.json({ message: 'Profile image Required' })
                }
            }
        }
        else {
            res.json({ message: 'Token is require' })
        }
    } catch (error) {
        console.log('upload_profile_pic', error);
        res.status(400).json(error);
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
        const user = await User.findOne({ email: email });
        if (user) {
            let randomCode = Math.floor(1000 + Math.random() * 9000);
            await sendMail({
                to: user.email,
                subject: "Forget Password Verification Code",
                html: randomCode
            });
            await User.updateOne({ email: user.email }, { $set: { "otp": randomCode } },
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
            otp: Joi.string().required().messages({
                'string.empty': `Otp cannot be an empty field`,
                'any.required': `Otp Is A Required Field`
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const getUser = await User.findOne({ email: req.body.email });
        if (getUser) {
            if (getUser.otp === req.body.otp) {
                res.status(200).json({ status: true, message: 'OTP verification successfully', data: getUser.email });
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
        const getUser = await User.findOne({ email: req.body.email });
        if (getUser) {
            await User.updateOne({ email: req.body.email }, { $set: { password: password } }, { upsert: false, multi: true });
            return res.status(200).json({ status: true, message: 'Password reset successfully' });
        }
        else {
            res.status(404).json({ status: false, message: 'Email Id does not exist' });
        }
    } catch (error) {
        console.log('reset_password', error);
        res.status(400).json(error);
    }
}




module.exports.broadcast_list = async (req, res) => {
    try {
        const broadcastData = await Broudcast.find().sort({ createdAt: -1 });
        if (broadcastData.length) {
            res.status(200).json({ status: true, message: "Broudcast list", data: broadcastData });
        }
        else {
            res.status(404).json({ status: false, message: "No Broudcast." });
        }
    } catch (error) {
        console.log('broadcast_list Error', error);
        res.status(500).json(error);
    }
}



module.exports.carrer_advise_agenda_list = async (req, res) => {
    try {
        const agendaData = await careerAgenda.find().sort({ agenda: 1 });
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



module.exports.notification_list = async (req, res) => {
    try {
        const notificationData = await StudentNotifications.find({ userId: req.userId });
        if (notificationData) {
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



module.exports.notification_delete = async (req, res) => {
    try {
        const notificationId = req.query.notificationId;
        if (!notificationId) {
            res.status(400).json({ message: "Notification Id is required." });
        }
        else {
            const notificationData = await StudentNotifications.findOne({ _id: notificationId });
            if (notificationData) {
                await StudentNotifications.deleteOne({ _id: notificationId });
                res.status(200).json({ status: true, message: "Notification delete successfully." });
            }
            else {
                res.status(404).json({ status: false, message: "Data not found." });
            }
        }
    } catch (error) {
        console.log('notification_delete Error', error);
        res.status(500).json(error);
    }
}



module.exports.cast_category_list = async (req, res) => {
    try {
        const categoryData = await CastCategory.find().sort({ createdAt: -1 });
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



module.exports.scholarship_list = async (req, res) => {
    try {
        let filter = {}
        const mp_police = req.query.mp_police;
        const level = req.query.level;
        const catId = req.query.catId;
        if (mp_police) {
            filter.mp_police = mp_police;
        }
        if (level) {
            filter.level = level;
        }
        if (catId) {
            filter.cast_category_id = catId;
        }
        console.log(filter)
        const scholarshipData = await Scholership.find(filter).sort({ createdAt: -1 });
        if (scholarshipData.length) {
            res.status(200).json({ status: true, message: "Scholership exam list", data: scholarshipData });
        }
        else {
            res.status(404).json({ status: false, message: "Data not found." });
        }
    } catch (error) {
        console.log('scholarship_list Error', error);
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
                    let category = await CastCategory.findOne({ _id: row.cast_category_id });
                    row.cast_category = category.name;
                    return row;
                });
                const newData = await Promise.all(promiss);
                res.status(200).json({ status: true, message: "Scholership exam view", data: newData });
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