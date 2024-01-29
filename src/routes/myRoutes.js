const express = require('express');
const app = express();
const myController = require('../controller/myController');

app.post('/add-institute', myController.add_institute);
app.post('/add-discipline', myController.add_discipline);
app.post('/add-subject', myController.add_subject);
app.post('/add-courses', myController.add_courses);
app.post('/upload-employeeId', myController.uploade_employeeId);
app.post('/add-stream', myController.add_stream);
app.post('/add-entrance-exam', myController.add_entrance_exam);
app.post('/add-gov-sector', myController.add_gov_sector);
app.post('/add-gov-jobs', myController.add_gov_jobs);
app.post('/add-pvt-sector', myController.add_pvt_sector);
app.post('/add-pvt-jobs', myController.add_pvt_jobs);
app.post('/add-central-name', myController.add_central_name);
app.post('/add-central-scholarship', myController.add_central_scholarship);
app.post('/add-bank-loan', myController.add_bank_loan);
app.get('/download-employee-sheet', myController.download_employee_sheet);
app.post('/add-time-slot', myController.add_time_slot);
app.post('/add-broadcast', myController.add_broadcast);

app.post('/add-career-advise-agenda', myController.add_carrer_advise_agenda);

module.exports = app; 
