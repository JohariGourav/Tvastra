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
    res.render("index");
}
function signup (req, res) {
    res.render("signup.html");
}
function login (req, res) {
    res.render("login");
}

module.exports = {
    landing: landing,
    tvastraPlus: tvastraPlus,
    submitYourQuery: submitYourQuery,
    faq: faq,
    bookAppointment: bookAppointment,
    signup: signup,
    login: login
};