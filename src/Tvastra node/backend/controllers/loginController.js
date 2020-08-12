const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

const validPassword = function(user, password) {
    return bcrypt.compareSync(password, user.password);
}
// create password HASH
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function login(req, res) {
    const {email, password} = req.body;
    // console.log("body", req.body);
    console.log("email pass", email, password);
    if(!(email && password)) {
        console.log("login user check if occured");
        req.flash("error","Please enter correct details");
        return res.redirect("/login");
    }
    User.findOne({
        email: email
    }, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/login");
        } else {
            console.log("login success", "user"); 
            console.log("found user", foundUser); 
            if(foundUser == null) {
                req.flash("error","User doesn't exist or incorrect credentials");
                return res.redirect("/login");
            } 
            else if(!validPassword(foundUser, password)) {
                req.flash('error', 'Incorrect Credentials')
                return res.redirect("/login");
            }
            else  {
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
            // else {
            //     console.log("found user query null");
            //     req.flash("error","user doesn't exist or incorrect details");
            //     return res.redirect("/login");
            // }
        }
    })
    // User.findOne({},)
}

function resetPassword(req, res, next) {
    const {newPassword, confirmPassword} = req.body;
    console.log("passwords: ", newPassword, confirmPassword);
    if(newPassword == null || confirmPassword == null) {
        req.flash("error", "Password cannot be empty");
        res.redirect("/reset-password");        
    } else if(newPassword != confirmPassword) {
        req.flash("error", "Both Passwords should match");
        res.redirect("/reset-password");        
    } else {
        User.findOneAndUpdate({
            mobile: req.session.reset.mobile
        },{
            password: generateHash(newPassword)
        },{
            new: true
        }, (err, result) => {
            if(err) {
                req.session.reset = undefined;
                req.flash("error", "Password Reset Failed");
                return res.redirect("/forgot");
            }
            else if(result){
                req.session.reset = undefined;
                req.flash("success", "Password Reset Successfull");
                return res.redirect("/login");
            } else {
                req.session.reset = undefined;
                req.flash("error", "Password Reset Failed");
                return res.redirect("/forgot");
            }
        });
    }
}

module.exports = {
    login: login,
    resetPassword: resetPassword
}