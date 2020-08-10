const Nexmo = require('nexmo');
const User = require("../models/user-model");

let apiKey = process.env.APIKEY || "c1dc8544";
let apiSecret = process.env.APISECRET || "mCZf54eQFK5cBOJu";


// console.log("otp env: ",process.env.APIKEY);
// console.log(process.env.APISECRET);

console.log("otp var env: ",apiKey);
console.log(apiSecret);

const nexmo = new Nexmo({
    apiKey: apiKey,
    apiSecret: apiSecret,
});

let tempUser = {};


// nexmo.verify.request({
//     number: '918700181848',
//     brand: 'Vonage',
//     code_length: '4'
// }, (err, result) => {
//     console.log(err ? err : result)
// });

// nexmo.verify.check({
//     request_id: 'REQUEST_ID',
//     code: 'CODE'
//   }, (err, result) => {
//     console.log(err ? err : result)
//   });

function request_otp (req, res, next) {
    const mobileNum = req.body.number;
    if(!mobileNum) {
        req.flash("error", "Mobile Number can't be empty");
        return res.redirect("/login-otp");
    }
    User.findOne({mobile: mobileNum}, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/login-otp");
        } else {
            console.log("otp find user success", "user"); 
            console.log("found user", foundUser); 
            if(foundUser) {
                // req.session.currentUser = {
                //     username: foundUser.username,
                //     _id: foundUser._id,
                //     email: foundUser.email,
                //     mobile: foundUser.mobile
                // };
                // console.log("req session", req.session.currentUser);
                // req.flash("success", "Hi " + foundUser.username);
                // return res.redirect("/");   
                tempUser = foundUser;
                console.log("set tempUser: ", tempUser);
                let mobNum = "91" + foundUser.mobile;
                console.log("otp req 91 Num: ", mobNum);
                nexmo.verify.request({
                    number: "91" + foundUser.mobile,
                    brand: 'Vonage',
                    code_length: '4',
                    pin_expiry: 180
                }, (err, result) => {
                    console.log(err ? "nexmo req error: " + err : "nexmo req result: " + JSON.stringify(result));
                    if(err || result.status != 0) {
                        console.log("nexmo otp gen error occured");
                        req.flash("error", "Error generating OTP, Try Again!");
                        return res.redirect("/login-otp");
                    } else {
                        req.session.otp_verify = {
                            request_id: result.request_id,
                            mobile: foundUser.mobile
                        };
                        console.log("session.otpverify set: ", req.session.otp_verify);
                        next();
                    }
                });
            }
            else {
                console.log("found user query null");
                req.flash("error","Mobile Number not registered or incorrect number");
                return res.redirect("/login-otp");
            }
        }
    });
}

function validate_otp (req, res, next) {
    let otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
    console.log("res otp: ", otp);
    console.log("res session.otpverify check: ", req.session.otp_verify);
    nexmo.verify.check({
        request_id: req.session.otp_verify.request_id,
        code: otp
    }, (err, result) => {
        console.log(err ? "nexmo validate req error: " + err : "nexmo validate req result: " + JSON.stringify(result));
        if(err) {
            req.session.destroy();
            req.flash("error", "Error verifying OTP");
            return res.redirect("/login-otp");
        } else {
            if(result.status == 0) {
                console.log("res pass status: ", result.status);
                
                // console.log("assign tempUser: ", tempUser);
                req.session.currentUser = tempUser;
                // console.log("session: ", req.session);
                req.flash("success", "OTP verification success");
                return res.redirect("/");
            } else {
                console.log("res fail status: ", result.status);
                req.session.destroy();
                req.flash("error", "Error verifying OTP");
                return res.redirect("/login-otp");
            }
        }
    });

}

module.exports = {
    request_otp: request_otp,
    validate_otp: validate_otp
}