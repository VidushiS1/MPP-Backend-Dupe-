const express = require('express');
const app = express();
const userController = require('../controller/userController');
const jwtToken = require('../helper/decodedToken');

app.post('/sign_up', userController.sign_up);
app.post('/login', userController.login);
app.post('/student-registration', jwtToken.decodedToken, userController.student_registration);
app.post('/education-qualification', jwtToken.decodedToken, userController.education_qualification);
app.post('/below-8th-qualification', jwtToken.decodedToken, userController.below_8th_qualification);
app.post('/below-10th-qualification', jwtToken.decodedToken, userController.below_10th_qualification);
app.post('/class-10th-qualification', jwtToken.decodedToken, userController.class_10th_qualification);
app.post('/class-12th-qualification', jwtToken.decodedToken, userController.class_12th_qualification);
app.post('/ug-diploma-qualification', jwtToken.decodedToken, userController.ug_diploma_qualification);
app.post('/ug-qualification', jwtToken.decodedToken, userController.ug_qualification);
app.post('/pg-qualification', jwtToken.decodedToken, userController.pg_qualification);


app.post('/jobs-seeker', jwtToken.decodedToken, userController.jobs_seeker);
app.post('/select-hobbys', jwtToken.decodedToken, userController.select_hobby);
app.get('/slots-list', jwtToken.decodedToken, userController.slots_list);
app.post('/schedule-career-advice', jwtToken.decodedToken, userController.schedule_career_advice);
app.get('/schedule-career-list', jwtToken.decodedToken, userController.schedule_career_list);
app.get('/schedule-career-view', jwtToken.decodedToken, userController.schedule_view);
app.put('/schedule-career-edit', jwtToken.decodedToken, userController.schedule_edit);


app.get('/explore-more-discipline', jwtToken.decodedToken, userController.explore_more_discipline);
app.get('/explore-more-subject', jwtToken.decodedToken, userController.explore_more_subject);
app.get('/explore-more-courses', jwtToken.decodedToken, userController.explore_more_courses);
app.get('/explore-more-level', jwtToken.decodedToken, userController.explore_more_level);
app.get('/explore-more-city', jwtToken.decodedToken, userController.explore_more_city);
app.get('/explore-more-type', jwtToken.decodedToken, userController.explore_more_type);


app.post('/filtered-result', jwtToken.decodedToken, userController.filtered_result);


app.get('/get-entrance-streams', jwtToken.decodedToken, userController.get_entrance_stream);
app.get('/get-entrance-exam', jwtToken.decodedToken, userController.get_entrance_exam);
app.get('/get-entrance-exam-view', jwtToken.decodedToken, userController.get_entrance_exam_view);


app.get('/get-gov-sector', jwtToken.decodedToken, userController.get_gov_sector);
app.post('/get-gov-jobs', jwtToken.decodedToken, userController.get_gov_jobs);
app.get('/get-gov-job-view', jwtToken.decodedToken, userController.get_gov_job_view);


app.get('/get-pvt-sector', jwtToken.decodedToken, userController.get_pvt_sector);
app.post('/get-pvt-jobs', jwtToken.decodedToken, userController.get_pvt_jobs);
app.get('/get-pvt-job-view', jwtToken.decodedToken, userController.get_pvt_job_view);


app.get('/get-scholarship-list', jwtToken.decodedToken, userController.get_scholership_list);
app.get('/get-scholarship-view', jwtToken.decodedToken, userController.get_scholarship_view);

app.get('/get-loan-bank-list', jwtToken.decodedToken, userController.get_loan_bank_list);

app.get('/get-profile', jwtToken.decodedToken, userController.get_profile);
app.put('/update-profile', jwtToken.decodedToken, userController.update_profile);
app.get('/get-student-profile', jwtToken.decodedToken, userController.get_student_profile);
app.put('/update-student-profile', jwtToken.decodedToken, userController.update_student_profile);
app.post('/upload-profile-pic', jwtToken.decodedToken, userController.upload_profile_pic);

app.post('/forget-password', userController.forget_password);
app.post('/verify-otp', userController.verify_otp);
app.post('/reset-password', userController.reset_password);

app.get('/broadcast-list', jwtToken.decodedToken, userController.broadcast_list);

app.get('/career-advise-agenda-list', jwtToken.decodedToken, userController.carrer_advise_agenda_list);

app.get('/notification-list', jwtToken.decodedToken, userController.notification_list);
app.post('/notification-delete', jwtToken.decodedToken, userController.notification_delete);


app.get('/cast-category-list', jwtToken.decodedToken, userController.cast_category_list);
app.get('/scholarship-list', jwtToken.decodedToken, userController.scholarship_list);
app.get('/scholarship-view', jwtToken.decodedToken, userController.scholarship_view);


module.exports = app; 
