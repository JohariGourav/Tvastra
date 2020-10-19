const User = require("../models/user-model");

function landing (req, res) {
    console.log("index contorller");
    res.render("index");
}

function tvastraPlus (req, res) {
    res.render("tvastra-plus.html");
}

function submitYourQuery (req, res) {
    res.render("submit-your-query");
}
function faq (req, res) {
    res.render("FAQ.html");
}

function bookAppointment (req, res) {
    console.log("book contorller");
    res.render("book-appointment");
}
function signup (req, res) {
    res.render("signup");
}
function login (req, res) {
    res.render("login");
}
function login_otp (req, res) {
    res.render("login-otp");
}
function otp_submit (req, res) {
    res.render("otp-submit");
}
function forgot (req, res) {
    res.render("forgot");
}
function recovery_otp_submit (req, res) {
    res.render("recovery-otp-submit");
}
function resetPassword (req, res) {
    res.render("reset-password");
}

function dashboard (req, res) {
    User.findById({
        _id: res.locals.currentUser._id
    },{
        password: 0,
        imageId: 0
    }, (err ,result) => {
        console.log("err: ", err, " --result: ",typeof result.birth);
        if (err) {
            console.log("dashboard queryErr: ", err);
            req.flash("error", "Server Error");
            return res.redirect("back");
        } else if (result) {
            // req.flash("success", "Profile Updated");
            return res.render("dashboard", { doctor: result });
        } else {
            req.flash("error", "Server error occurred");
            return res.redirect("back");
        }
    });
}

module.exports = {
    landing: landing,
    tvastraPlus: tvastraPlus,
    submitYourQuery: submitYourQuery,
    faq: faq,
    bookAppointment: bookAppointment,
    signup: signup,
    login: login,
    login_otp: login_otp,
    otp_submit: otp_submit,
    forgot: forgot,
    resetPassword: resetPassword,
    recovery_otp_submit: recovery_otp_submit,
    dashboard: dashboard
};