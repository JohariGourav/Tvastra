const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");
const Doctor = require("../models/doctor-model");

// create password HASH
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function signup(req, res) {
    console.log("inside signup control");
    console.log("body user:", req.body.user);
    userObj = req.body.user;
    let newUser = new User({
        username: userObj.username,
        email: userObj.email,
        mobile: userObj.mobile,
        password: generateHash(userObj.password),
        gender: userObj.gender,
        birth: userObj.dob,
        city: userObj.city,
        state: userObj.state,
        country: userObj.country,
        isDoctor: userObj.isDoctor
    });
    console.log("new user:", newUser);
    // console.log("new user TYPE:",typeof newUser.isDoctor);
    // eval(require("locus"));

    if(!(newUser.username && newUser.email && newUser.mobile && newUser.password)) {
        console.log("new user check if occured");
        req.flash("error","Please enter all the required details");
        return res.redirect("/signup");
    }

    User.create(newUser, (err, user) => {
        console.log("inside user register");
        if(err) {
            console.log("User create err: ", err + " ENDS HERE");
            if(err.keyPattern && (err.keyPattern.email == 1 || err.keyPattern.mobile == 1)) {
                console.log("keypattern match: ", "email: " + err.keyPattern.email || "mobile: " + err.keyPattern.mobile);
                req.flash("error", "User already exists, please Login!");
                return res.redirect("/signup");
            }
            req.flash("error", "Signup Failed, Try Again!");
            return res.redirect("/signup");
        } else {
            console.log("record success", user); 
            // req.session.currentUser = {
            //     username: user.username,
            //     _id: user._id,
            //     email: user.email,
            //     mobile: user.mobile
            // };
            // console.log("req session", req.session.currentUser);
            req.flash("success", "Signup successfull, Please Login!");
            return res.redirect("/login");   
        }
        // console.log("before pasport auth", user);
        // passport.authenticate("local")(req, res, _ => {
        //     // req.flash("success", "Welcome" + user.username);
        //     console.log("user", user);
        //     res.redirect("/");    
        // })
    });
}

function doctorSignup(req, res, next) {
    console.log("inside doctor signup control");
    console.log("user.doctor: ", req.body.user.doctor);
    console.log("user.doctor: ", typeof req.body.user.doctor);
    if(req.body.user.doctor != "true") {
        console.log("Doc check if occured");
        return next();
    }
    // console.log("body user:", req.body.user);
    let newDoctor = new Doctor(req.body.user);
    // console.log("new Doc:", newDoctor);

    if(!(newDoctor.username && newDoctor.email && newDoctor.mobile && newDoctor.password)) {
        console.log("new user check if occured");
        req.flash("error","Please enter all the required details");
        return res.redirect("/signup");
    }

    newDoctor.password = generateHash(newDoctor.password);

    Doctor.create(newDoctor, (err, doctor) => {
        console.log("inside Doc register");
        if(err) {
            console.log("Doc create err: ", err + " ENDS HERE");
            if(err.keyPattern.email == 1 || err.keyPattern.mobile == 1 ) {
                console.log("keypattern match: ", "email: " + err.keyPattern.email || "mobile: " + err.keyPattern.mobile);
                req.flash("error", "User already exists, please Login!");
                return res.redirect("/signup");
            }
            req.flash("error", "Signup Failed, Try Again!");
            return res.redirect("/signup");
        } else {
            console.log("doc record success", doctor); 
            // req.session.currentUser = {
            //     username: user.username,
            //     _id: user._id,
            //     email: user.email,
            //     mobile: user.mobile
            // };
            // console.log("req session", req.session.currentUser);
            req.flash("success", "Signup successfull, Please Login!");
            return res.redirect("/login");   
        }
    });
}

module.exports = {
    signup: signup,
    doctorSignup: doctorSignup
}