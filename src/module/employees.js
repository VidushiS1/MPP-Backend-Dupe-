const mongoose = require('../helper/dbconnection');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    employee_id: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const Employees = mongoose.model('employees', employeeSchema);

module.exports = Employees;