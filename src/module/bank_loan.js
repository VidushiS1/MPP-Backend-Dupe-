const mongoose = require('../helper/dbconnection');

const bankLoanSchema = new mongoose.Schema({
    bank_name: {
        type: String,
        require: true,
    },
    bank_loan_link: {
        type: String,
        require: true,
    },
}, { timestamps: true });

const BankLoan = mongoose.model('bank_loan', bankLoanSchema);

module.exports = BankLoan;