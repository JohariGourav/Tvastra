const User = require("../models/user-model");
const passport = require("passport");

function login(req, res) {
    const {email, password} = req.body;
    console.log("body", req.body);
    console.log("email pass", email, password);
    if(!(email && password)) {
        console.log("login user check if occured");
        req.flash("error","Please enter correct details");
        return res.redirect("/login");
    }
    User.findOne({
        email: email, 
        password: password
    }, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/login");
        } else {
            console.log("login success", "user"); 
            console.log("found user", foundUser); 
            if(foundUser) {
                req.session.currentUser = {
                    username: foundUser.username,
                    _id: foundUser._id,
                    email: foundUser.email,
                    mobile: foundUser.mobile
                };
                console.log("req session", req.session.currentUser);
                req.flash("success", "Hi " + foundUser.username);
                return res.redirect("/");   
            }
            else {
                console.log("found user query null");
                req.flash("error","user doesn't exist or incorrect details");
                return res.redirect("/login");
            }
        }
    })
    // User.findOne({},)
}

module.exports = {
    login: login
}