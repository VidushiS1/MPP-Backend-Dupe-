const express = require('express');
const app = express();
const contentManagerController = require('../controller/contentManagerController');
const { decodedToken } = require('../helper/contentManagerJwt');


app.post('/login', contentManagerController.login);

app.post('/forget-password', contentManagerController.forget_password);
app.post('/verify-otp', contentManagerController.verify_otp);
app.post('/reset-password', contentManagerController.reset_password);

app.get("/get-profile", decodedToken, contentManagerController.get_profile);
app.post('/check-password', decodedToken, contentManagerController.check_password);
app.post('/update-profile', decodedToken, contentManagerController.update_profile);

app.get('/user-list', decodedToken, contentManagerController.user_list);
app.get('/user-view', decodedToken, contentManagerController.user_view);

app.get('/schedule-career-list', decodedToken, contentManagerController.career_advise_list);
app.get('/schedule-career-view', decodedToken, contentManagerController.career_advise_view);

app.post('/add-gov-sector', decodedToken, contentManagerController.add_gov_sector);
app.get('/gov-sector-list', decodedToken, contentManagerController.gov_sector_list);
app.put('/govt-sector-edit', decodedToken, contentManagerController.govt_sector_edit);
app.delete('/govt-sector-delete', decodedToken, contentManagerController.govt_sector_delete);

app.post('/add-gov-jobs', decodedToken, contentManagerController.add_gov_jobs);
app.post('/gov-jobs-list', decodedToken, contentManagerController.gov_jobs_list);
app.get('/gov-job-view', decodedToken, contentManagerController.gov_job_view);
app.put('/govt-job-edit', decodedToken, contentManagerController.govt_job_edit);
app.delete('/govt-job-delete', decodedToken, contentManagerController.govt_job_delete);

app.post('/add-pvt-sector', decodedToken, contentManagerController.add_pvt_sector);
app.get('/pvt-sector-list', decodedToken, contentManagerController.pvt_sector_list);
app.put('/pvt-sector-edit', decodedToken, contentManagerController.pvt_sector_edit);
app.delete('/pvt-sector-delete', decodedToken, contentManagerController.pvt_sector_delete);

app.post('/add-pvt-jobs', decodedToken, contentManagerController.add_pvt_jobs);
app.post('/pvt-jobs-list', decodedToken, contentManagerController.pvt_jobs_list);
app.get('/pvt-job-view', decodedToken, contentManagerController.pvt_job_view);
app.put('/pvt-job-edit', decodedToken, contentManagerController.pvt_job_edit);
app.delete('/pvt-job-delete', decodedToken, contentManagerController.pvt_job_delete);

app.post('/add-stream', decodedToken, contentManagerController.add_stream);
app.get('/entrance-streams-list', decodedToken, contentManagerController.entrance_stream_list);
app.put('/entrance-streams-edit', decodedToken, contentManagerController.entrance_stream_edit);
app.delete('/entrance-streams-delete', decodedToken, contentManagerController.entrance_stream_delete);

app.post('/add-entrance-exam', decodedToken, contentManagerController.add_entrance_exam);
app.get('/entrance-exam-list', decodedToken, contentManagerController.entrance_exam_list);
app.get('/entrance-exam-view', decodedToken, contentManagerController.entrance_exam_view);
app.put('/entrance-exam-edit', decodedToken, contentManagerController.entrance_exam_edit);
app.delete('/entrance-exam-delete', decodedToken, contentManagerController.entrance_exam_delete);


// app.post('/add-scholarship-name', decodedToken, contentManagerController.add_scholarship_name);
// app.post('/add-scholarship', decodedToken, contentManagerController.add_scholarship1);

app.get('/get-scholarship-list', decodedToken, contentManagerController.get_scholership_list);
app.get('/get-scholarship-view', decodedToken, contentManagerController.get_scholarship_view);


app.put('/career-advise-agenda-edit', decodedToken, contentManagerController.carrer_advise_agenda_edit);
app.get('/career-advise-agenda-list', decodedToken, contentManagerController.carrer_advise_agenda_list);
app.get('/career-advise-agenda-view', decodedToken, contentManagerController.carrer_advise_agenda_view);

app.post('/add-time-slot', decodedToken, contentManagerController.add_time_slot);
app.get('/time-slot-list', decodedToken, contentManagerController.time_slot_list);
app.get('/time-slot-view', decodedToken, contentManagerController.time_slot_view);
app.put('/time-slot-edit', decodedToken, contentManagerController.time_slot_edit);
app.delete('/time-slot-delete', decodedToken, contentManagerController.time_slot_delete);


app.post('/add-institute', decodedToken, contentManagerController.add_institute);
app.get('/institute-list', decodedToken, contentManagerController.institute_list);
app.get('/institute-view', decodedToken, contentManagerController.institute_view);
app.put('/institute-edit', decodedToken, contentManagerController.institute_edit)
app.delete('/institute-delete', decodedToken, contentManagerController.institute_delete);

app.get('/cities-list', decodedToken, contentManagerController.cities_list);


app.post('/add-discipline', decodedToken, contentManagerController.add_discipline);
app.get('/discipline-list', decodedToken, contentManagerController.discipline_list);
app.get('/discipline-view', decodedToken, contentManagerController.discipline_view);
app.put('/discipline-edit', decodedToken, contentManagerController.discipline_edit)
app.delete('/discipline-delete', decodedToken, contentManagerController.discipline_delete);
app.post('/discipline-institute-delete', decodedToken, contentManagerController.discipline_institute_delete);
app.get('/discipline-subject-view', decodedToken, contentManagerController.discipline_subject_view);


app.post('/add-subject', decodedToken, contentManagerController.add_subject);
app.get('/subject-list', decodedToken, contentManagerController.subject_list);
app.get('/subject-view', decodedToken, contentManagerController.subject_view);
app.put('/subject-edit', decodedToken, contentManagerController.subject_edit)
app.delete('/subject-delete', decodedToken, contentManagerController.subject_delete);
app.get('/discipline-list-instituteId', decodedToken, contentManagerController.discipline_list_instituteId)

app.get('/course-list', decodedToken, contentManagerController.course_list);
app.put('/course-edit', decodedToken, contentManagerController.course_edit);
app.get('/course-view', decodedToken, contentManagerController.course_view);
app.delete('/course-delete', decodedToken, contentManagerController.course_delete);

app.get('/course-level', decodedToken, contentManagerController.course_level);


app.post('/add-notification', decodedToken, contentManagerController.add_notification);
app.get('/notification-list', decodedToken, contentManagerController.notification_list);
app.get('/notification-view', decodedToken, contentManagerController.notification_view);


app.post('/block-student', decodedToken, contentManagerController.block_student);


// app.get('/authorization-url',decodedToken, contentManagerController.authorization_url);
// app.post('/genrate-auth-url',decodedToken, contentManagerController.generate_auth_url);


app.post('/add-cast-category', decodedToken, contentManagerController.add_cast_category);
app.get('/cast-category-list', decodedToken, contentManagerController.cast_category_list);
app.put('/cast-category-edit', decodedToken, contentManagerController.cast_category_edit);
app.delete('/cast-category-delete', decodedToken, contentManagerController.cast_category_delete);

app.post('/add-scholarship', decodedToken, contentManagerController.add_scholarship);
app.get('/scholarship-list-national', decodedToken, contentManagerController.scholarship_list_national);
app.get('/scholarship-list-state', decodedToken, contentManagerController.scholarship_list_state);
app.get('/scholarship-view', decodedToken, contentManagerController.scholarship_view);
app.put('/scholarship-edit', decodedToken, contentManagerController.scholarship_edit);
app.delete('/scholarship-delete', decodedToken, contentManagerController.scholarship_delete);

app.get('/access-token', decodedToken, contentManagerController.get_zoom_access_token);
app.post('/create-meeting', decodedToken, contentManagerController.create_meeting);
app.get('/meeting-list', decodedToken, contentManagerController.meeting_list);
app.get('/meeting-view', decodedToken, contentManagerController.meeting_view);


app.post('/add-eligibility', decodedToken, contentManagerController.add_eligibility);
app.get('/eligibility-list', decodedToken, contentManagerController.eligibility_list);
app.put('/eligibility-edit', decodedToken, contentManagerController.eligibility_edit);
app.delete('/eligibility-delete', decodedToken, contentManagerController.eligibility_delete);

module.exports = app; 
