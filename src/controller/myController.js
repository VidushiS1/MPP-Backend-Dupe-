const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const Joi = require('joi');
const fs = require('fs');
const checkValidation = require('../helper/joiValidation');
const Institutes = require('../module/institute');
const Desciplines = require('../module/descipline');
const Subjects = require('../module/subject');
const Courses = require('../module/courses');
const Employees = require('../module/employees');
const Entrance_stream = require('../module/entrance_stream');
const Entrance_exams = require('../module/entrance_exam');
const GovJobSector = require('../module/gov_job_sector');
const GovJobS = require('../module/gov_jobs');
const PvtJobSector = require('../module/pvt_job_sector');
const PvtJobS = require('../module/pvt_jobs');
const ScholarshipName = require('../module/scholarship_name');
const GovtScholership = require('../module/govt_scholership');
const BankLoan = require('../module/bank_loan');
const Employee = require('../module/employees');
const Time_slot = require('../module/time_slot');
const Broudcast = require('../module/broad_cast');



const careerAgenda = require('../module/carreer_agenda');


module.exports.add_institute = async (req, res) => {
    try {
        const schema = Joi.object({
            institute_name: Joi.string().required().messages({
                'string.empty': 'Institute_name cannot be an empty field',
                'any.required': 'Institute_name is required field'
            }),
            // type: Joi.string().required().messages({
            //     'string.empty': 'type cannot be an empty field',
            //     'any.required': 'type is required field'
            // })
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_name } = req.body;
        const data = { institute_name }
        const addData = await Institutes.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Institute Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_institute Error', error);
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
            }),
            // program_lavel: Joi.string().required().messages({
            //     'string.empty': 'program_lavel cannot be an empty field',
            //     'any.required': 'program_lavel is required field'
            // })
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_id, discipline_name, } = req.body;
        const data = { institute_id, discipline_name, }
        const addData = await Desciplines.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Descipline Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_discipline Error', error);
        res.status(500).json(error);
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
            subject: Joi.string().required().messages({
                'string.empty': 'subject cannot be an empty field',
                'any.required': 'subject is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_id, discipline_id, subject } = req.body;
        const data = { institute_id, discipline_id, subject }
        const addData = await Subjects.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Subjects Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_subject Error', error);
        res.status(500).json(error);
    }
}


module.exports.add_courses = async (req, res) => {
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
            course_url: Joi.string().required().messages({
                'string.empty': 'course_url cannot be an empty field',
                'any.required': 'course_url is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { institute_id, discipline_id, subject_name, course_name, program_lavel, place, institute_type, institute_url, course_url } = req.body;
        const data = { institute_id, discipline_id, subject_name, course_name, program_lavel, place, institute_type, institute_url, course_url }
        const addData = await Courses.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Courses Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_courses Error', error);
        res.status(500).json(error);
    }
}


module.exports.uploade_employeeId = async (req, res) => {
    try {
        if (!req.files || !req.files.excel_file) {
            return res.status(400).json({ error: 'First Upload Excel File' });
        }
        else {
            function generateRandomEmployeeID() {
                const min = 100000000;
                const max = 999999999;
                return Math.floor(min + Math.random() * (max - min + 1));
            }

            const excelFile = req.files.excel_file;
            let newUser = []
            const workbook = xlsx.read(excelFile.data, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);
            async function checkAndAddUser(row) {
                if (row.Sr_no) {
                    delete row.Sr_no
                }
                const employee_id = generateRandomEmployeeID().toString();
                row.employee_id = employee_id;
                newUser.push(row);
            }
            // newUser.push(row);
            await Promise.all(data.map(checkAndAddUser));
            console.log('newUser', newUser);
            const add_bulk = await Employees.insertMany(newUser).then(() => {
                return res.status(201).json({ status: true, message: 'employees Added' });
            }).catch((err) => {
                res.status(400).json(err.message);
            });
        }
    } catch (error) {
        console.error('uploade_employeeId Error:', error);
        res.status(500).json({ error: 'Server error' });
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
            res.status(200).json({ status: true, message: 'Entrance_stream Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_stream Error', error);
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
            res.status(200).json({ status: true, message: 'Entrance_exam Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_entrance_exam Error', error);
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
            res.status(200).json({ status: true, message: 'Sector Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_gov_sector Error', error);
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
            res.status(200).json({ status: true, message: 'gov Job Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_gov_jobs Error', error);
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
            res.status(200).json({ status: true, message: 'Sector Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_pvt_sector Error', error);
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
            res.status(200).json({ status: true, message: 'Pvt Job Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_pvt_jobs Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_central_name = async (req, res) => {
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
        const addData = await ScholarshipName.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Scholarship name added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_central_name Error', error);
        res.status(500).json(error);
    }
}


module.exports.add_central_scholarship = async (req, res) => {
    try {
        const schema = Joi.object({
            scholarship_id: Joi.string().required().messages({
                'string.empty': 'scholarship_id cannot be an empty field',
                'any.required': 'scholarship_id is required field'
            }),
            scheme_name: Joi.string().required().messages({
                'string.empty': 'scheme_name cannot be an empty field',
                'any.required': 'scheme_name is required field'
            }),
            amount_of_scholership: Joi.string().required().messages({
                'string.empty': 'amount_of_scholership cannot be an empty field',
                'any.required': 'amount_of_scholership is required field'
            }),
            eligibility: Joi.string().required().messages({
                'string.empty': 'eligibility cannot be an empty field',
                'any.required': 'eligibility is required field'
            }),
            category: Joi.string().required().messages({
                'string.empty': 'Category cannot be an empty field',
                'any.required': 'Category is required field'
            }),
            slots: Joi.string().required().messages({
                'string.empty': 'slots cannot be an empty field',
                'any.required': 'slots is required field'
            }),
            scheme_close_date: Joi.string().required().messages({
                'string.empty': 'scheme_close_date cannot be an empty field',
                'any.required': 'scheme_close_date is required field'
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
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { scholarship_id, scheme_name, amount_of_scholership, eligibility, category, slots, scheme_close_date, guidelines, faq, website } = req.body;
        const data = { scholarship_id, scheme_name, amount_of_scholership, eligibility, category, slots, scheme_close_date, guidelines, faq, website }
        const addData = await GovtScholership.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Pvt Job Added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_central_scholarship Error', error);
        res.status(500).json(error);
    }
}



module.exports.add_bank_loan = async (req, res) => {
    try {
        if (!req.files || !req.files.excel_file) {
            return res.status(400).json({ error: 'First Upload Excel File' });
        }
        else {
            const excelFile = req.files.excel_file;
            let newUser = []
            const workbook = xlsx.read(excelFile.data, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);
            async function checkAndAddUser(row) {
                if (row.Sr_no) {
                    delete row.Sr_no
                }
                newUser.push(row);
            }
            await Promise.all(data.map(checkAndAddUser));
            const add_bulk = await BankLoan.insertMany(newUser).then(() => {
                return res.status(201).json({ status: true, message: 'Bank Added sucessfully' });
            }).catch((err) => {
                res.status(400).json(err.message);
            });
        }
    } catch (error) {
        console.error('add_bank_loan Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}



module.exports.download_employee_sheet = async (req, res) => {
    try {
        const employees = await Employee.find();

        if (employees.length) {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Employees');

            // Define the columns in your Excel sheet
            worksheet.columns = [
                { header: 'S_NO', key: 's_no' },
                { header: 'Name', key: 'name' },
                { header: 'Employee Id', key: 'employee_id' },
            ];

            // Populate the worksheet with data from the employees array
            let counter = 1;
            employees.forEach((employee) => {
                worksheet.addRow({
                    s_no: counter,
                    name: employee.name,
                    employee_id: employee.employee_id,
                });
                counter++;
            });

            // Style the header row (optional)
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });

            // Save the workbook to a file
            const filePath = './public/employees-sheet.xlsx';
            await workbook.xlsx.writeFile(filePath);

            // Send the file download link in the response
            const url = `${req.protocol}://${req.get('host')}/employees-sheet.xlsx`;
            res.status(200).json({ status: true, message: 'Employee Sheet', data: url });
        } else {
            res.status(404).json({ status: false, message: 'Data not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};



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
            res.status(200).json({ status: true, message: 'Time slot added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_time_slot Error', error);
        res.status(500).json(error);
    }
}





module.exports.add_broadcast = async (req, res) => {
    try {
        const schema = Joi.object({
            agenda: Joi.string().min(1).max(65).required().messages({
                'string.empty': 'agenda cannot be an empty field',
                'any.required': 'agenda is required field',
                'string.min': '"agenda" length must be at least 1 character long',
                'string.max': '"agenda" length must be less than or equal to 65 characters long'
            }),
            date: Joi.string().required().messages({
                'string.empty': 'date cannot be an empty field',
                'any.required': 'date is required field'
            }),
            start_time: Joi.string().required().messages({
                'string.empty': 'start_time cannot be an empty field',
                'any.required': 'start_time is required field'
            }),
            end_time: Joi.string().required().messages({
                'string.empty': 'end_time cannot be an empty field',
                'any.required': 'end_time is required field'
            }),
            link: Joi.string().required().messages({
                'string.empty': 'link cannot be an empty field',
                'any.required': 'link is required field'
            })
        });
        checkValidation.joiValidation(schema, req.body);
        const { agenda, date, start_time, end_time, link } = req.body;
        const data = { agenda, date, start_time, end_time, link }
        const addData = await Broudcast.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Broadcast Added suceesfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_broadcast Error', error);
        res.status(500).json(error);
    }
}





module.exports.add_carrer_advise_agenda = async (req, res) => {
    try {
        const schema = Joi.object({
            agenda: Joi.string().required().messages({
                'string.empty': 'agenda cannot be an empty field',
                'any.required': 'agenda is required field'
            }),
        });
        checkValidation.joiValidation(schema, req.body);
        const { agenda } = req.body;
        const data = { agenda }
        const addData = await careerAgenda.create(data);
        if (addData) {
            res.status(200).json({ status: true, message: 'Career agenda added successfully', data: addData });
        }
        else {
            res.status(400).json({ status: false, message: "Please try again" });
        }
    } catch (error) {
        console.log('add_carrer_advise_agenda Error', error);
        res.status(500).json(error);
    }
}