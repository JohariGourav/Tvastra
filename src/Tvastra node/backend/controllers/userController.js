const User = require("../models/user-model");
const Schedule = require("../models/slot-model").schedule;
const Slot = require("../models/slot-model").slot;
const Nexmo = require('nexmo');

const createDoctorProfileObject = require("../util/userUtil").createDoctorProfileObject;

const nexmo = new Nexmo({
    apiKey: process.env.NEXMO_APIKEY,
    apiSecret: process.env.NEXMO_APISECRET,
});

// show create/Edit schedule page to Doctor
function showSchedule (req, res) {
    Schedule.find({
        doctor: '5f3ab729f84cd91e487a27cc'
    }).
    populate('slots').
    exec( (err, schedules) => {
        console.log("err: ", err);
        // console.log("schedule: ", schedules);
        schedules.forEach( schedule => {
            console.log(schedule.date);
            let options = {month: 'short'};
            let formatter = new Intl.DateTimeFormat('default', options);
            schedule.date = schedule.date.getDate() + ' ' + formatter.format(schedule.date);
            console.log(schedule.date);
        });
        res.render("schedule", {schedules: schedules});
    });
}

function updateProfile(req, res, next) {
    console.log("----file-----", req.file);
    console.log("imageID: ", req.imageId);
    console.log("image: ", req.image);
    // console.log("body: ", req.body);
    const {user, doctor} = req.body;
    console.log("user: ", user);
    console.log("doctor: ", doctor);

    let updateData =  {
        username: user.username,
        email: user.email,
        gender: user.gender,
        birth: user.dob,
        city: user.city,
        state: user.state,
        country: user.country,
    };

    if(req.session.otp_verify && req.session.otp_verify.verified === true) {
        updateData.mobile = req.session.otp_verify.mobile;
    }

    if(doctor) {
        let docProfile = createDoctorProfileObject(req.body.doctor);
        delete docProfile.bio;
        console.log("function returned doc obj: ", docProfile);

        if (docProfile.education.length < 1 || docProfile.speciality.length < 1) {
            req.flash("error", "Please fill mandatory fields");
            return res.redirect("back");
        }
        updateData.doctorProfile = docProfile;
    }

    if(req.image && req.imageId) {
        updateData.image = req.image;
        updateData.imageId = req.imageId;
    }
    console.log("updateData final obj: ", updateData);

    User.findOneAndUpdate({
        _id: req.session.currentUser._id
    }, updateData, 
    {
        new: true
    }, (err, result) => {
        if (err) {
            console.log("update profile queryErr: ", err);
            req.flash("error", "Error Updating profile");
            return res.redirect("back");
        } else if (result) {
            req.session.currentUser.image = result.image;
            req.session.currentUser.imageId = result.imageId;
            req.flash("success", "Profile Updated");
            return res.redirect("/dashboard");
        } else {
            req.flash("error", "Profile Update Failed, Try Again!");
            return res.redirect("back");
        }
    });
}

function edit_mob_request_otp (req, res, next) {
    console.log("start");
    const mobile = req.body.mobile;
    if(!mobile) {
        console.log("not mobile");
        res.locals.error = "Mobile Number can't be empty";
        return res.render("partials/header");
    }
    else if(mobile.length != 10) {
        console.log("not 10 digit");
        res.locals.error = "Mobile Number should have 10 digits";
        return res.render("partials/header");
    }
    User.findOne({mobile: mobile},{password: 0}, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            console.log("otp find user success", "user"); 
            console.log("found user", foundUser); 
            if(foundUser) {  
                console.log("User found with this number");
                res.locals.error = "Number already registered";
                return res.render("partials/header");
            }
            else {
                console.log("mobile------- 91" + mobile);
                nexmo.verify.request({
                    number: "91" + mobile,
                    brand: 'Vonage',
                    code_length: '4',
                    pin_expiry: 180
                }, (err, result) => {
                    console.log(err ? "nexmo req error: " + err : "nexmo req result: " + JSON.stringify(result));
                    if(err || result.status != 0) {
                        console.log("nexmo otp gen error occured");
                        res.locals.error = "Error generating OTP, Try Again!";
                        return res.render("partials/header");
                    } else {
                        req.session.otp_verify = {
                            request_id: result.request_id,
                            mobile: mobile,
                            verified: false
                        };
                        console.log("session.otpverify set: ", req.session.otp_verify);
                        return res.send(true);
                    }
                });            
            }
        }
    });
}

function edit_mob_validate_otp (req, res, next) {
    let otp = req.body.otp;
    console.log("res otp: ", otp);
    console.log("res session.otpverify check: ", req.session.otp_verify);
    
    if(otp.length != 4) {
        console.log("not 4 digit");
        res.locals.error = "OTP must have 4 digits";
        return res.render("partials/header");
    } 
    else if (!req.session.otp_verify) {
        console.log("otp request ID undefined");
        res.locals.error = "OTP request not generated";
        return res.render("partials/header");
    }

    nexmo.verify.check({
        request_id: req.session.otp_verify.request_id,
        code: otp
    }, (err, result) => {
        console.log(err ? "nexmo validate req error: " + err : "nexmo validate req result: " + JSON.stringify(result));
        if(err) {
            req.session.otp_verify = undefined;
            delete req.session.otp_verify;
            res.locals.error = "Error verifying OTP";
            return res.render("partials/header");
        } else {
            if(result.status == 0) {
                console.log("res pass status: ", result.status);
                req.session.otp_verify.verified = true;
                return res.send(true);
            } else {
                console.log("res fail status: ", result.status);
                req.session.otp_verify = undefined;
                delete req.session.otp_verify;
                res.locals.error = "Error verifying OTP";
                return res.render("partials/header");
            }
        }
    });
}


module.exports = {
    showSchedule: showSchedule,
    updateProfile: updateProfile,
    edit_mob_request_otp: edit_mob_request_otp,
    edit_mob_validate_otp: edit_mob_validate_otp
}