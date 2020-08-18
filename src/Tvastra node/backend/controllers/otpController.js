const Nexmo = require('nexmo');
const User = require("../models/user-model");

let apiKey = process.env.NEXMO_APIKEY;
let apiSecret = process.env.NEXMO_APISECRET;


// console.log("otp env: ",process.env.APIKEY);
// console.log(process.env.APISECRET);

// console.log("otp var env: ",apiKey);
// console.log(apiSecret);

const nexmo = new Nexmo({
    apiKey: apiKey,
    apiSecret: apiSecret,
});

let tempUser = {};

module.exports = {
    request_otp: request_otp,
    validate_otp: validate_otp,
    recoverAccount_genOTP: recoverAccount_genOTP,
    recoverAccount_validateOTP: recoverAccount_validateOTP,
    request_otp1: request_otp1,
    validate_otp1: validate_otp1
}

function request_otp (req, res, next) {
    const mobileNum = req.body.number;
    if(!mobileNum) {
        req.flash("error", "Mobile Number can't be empty");
        return res.redirect("back");
    }
    User.findOne({mobile: mobileNum}, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            console.log("otp find user success", "user"); 
            console.log("found user", foundUser); 
            if(foundUser) {  
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
                        return res.redirect("back");
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
                return res.redirect("back");
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
            req.session.otp_verify = undefined;
            req.flash("error", "Error verifying OTP");
            return res.redirect("/login-otp");
        } else {
            if(result.status == 0) {
                console.log("res pass status: ", result.status);
                
                // console.log("assign tempUser: ", tempUser);
                req.session.currentUser = tempUser;
                // console.log("session: ", req.session);
                req.loggedUser = foundUser;
                return next();
                req.flash("success", "OTP verification success");
                return res.redirect("/");
            } else {
                console.log("res fail status: ", result.status);
                req.session.otp_verify = undefined;
                req.flash("error", "Error verifying OTP");
                return res.redirect("/login-otp");
            }
        }
    });

}

function recoverAccount_genOTP (req, res, next) {
    const mobileNum = req.body.number;
    if(!mobileNum) {
        req.flash("error", "Mobile Number can't be empty");
        return res.redirect("back");
    }
    User.findOne({mobile: mobileNum}, (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            console.log("found user", foundUser); 
            if(foundUser) {  
                tempUser = foundUser;
                console.log("set tempUser: ", tempUser);

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
                        return res.redirect("back");
                    } else {
                        req.session.otp_verify = {
                            request_id: result.request_id,
                            mobile: foundUser.mobile
                        };
                        console.log("session.otpverify set: ", req.session.otp_verify);
                        return next();
                    }
                });
            }
            else {
                console.log("found user query null");
                req.flash("error","Mobile Number not registered or incorrect number");
                return res.redirect("back");
            }
        }
    });
}

function recoverAccount_validateOTP (req, res, next) {
    let otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
    console.log("res otp: ", otp);
    console.log("res session.otpverify check: ", req.session.otp_verify);
    
    nexmo.verify.check({
        request_id: req.session.otp_verify.request_id,
        code: otp
    }, (err, result) => {
        console.log(err ? "nexmo validate req error: " + err : "nexmo validate req result: " + JSON.stringify(result));
        if(err) {
            req.session.otp_verify = undefined;
            req.flash("error", "Error verifying OTP");
            return res.redirect("/forgot");
        } else {
            if(result.status == 0) {
                console.log("res pass status: ", result.status);
                
                // console.log("assign tempUser: ", tempUser);
                
                // console.log("session: ", req.session);
                req.session.reset = {
                    mobile: req.session.otp_verify.mobile
                } 
                req.session.otp_verify = undefined;
                req.flash("success", "OTP verification success");
                return res.redirect("/reset-password");
            } else {
                console.log("res fail status: ", result.status);
                req.session.otp_verify = undefined;
                req.flash("error", "Error verifying OTP");
                return res.redirect("/forgot");
            }
        }
    });

}

async function generateOtpRequest(mobNum) {
    var resultObj = {};
    await nexmo.verify.request({
        number: "91" + mobNum,
        brand: 'Vonage',
        code_length: '4',
        pin_expiry: 180
    }, async (err, result) => {
        // console.log(err ? "nexmo req error: " + err : "nexmo req result: " + JSON.stringify(result));
        console.log("nexmo req error: " + err + " \n nexmo req result: " + JSON.stringify(result));
        if(err) {
            resultObj.error = err;
            resultObj.result = result;
            return {error: err, result: result};
        } else if(result.status != 0) {
            resultObj.resultFail = result;
            return {resultFail: result};
        } else {
            resultObj.resultSuccess = result;
            return {resultSuccess: result};
        }
    });
    console.log('generateOTP resultPbj: ', resultObj);
    return resultObj;
}

function verifyOtpRequest(requestId, code) {
    var resultObj = {};
    resultObj =  nexmo.verify.check({
        request_id: req.session.otp_verify.request_id,
        code: otp
    }, (err, result) => {
        // console.log(err ? "nexmo validate req error: " + err : "nexmo validate req result: " + JSON.stringify(result));
        console.log("nexmo req error: " + err + " \n nexmo req result: " + JSON.stringify(result));
        if(err) {
            return {error: err, result: result};
        } else if(result.status != 0) {
            return {resultFail: result};
        } else {
            return {resultSuccess: result};
        }
    });
    return resultObj;
}

 function request_otp1 (req, res, next) {
    const mobileNum = req.body.number;
    if(!mobileNum) {
        req.flash("error", "Mobile Number can't be empty");
        return res.redirect("back");
    }
    User.findOne({mobile: mobileNum}, async (err, foundUser) => {
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            console.log("otp1 found user", foundUser); 
            if(foundUser) {  
                tempUser = foundUser;
                console.log("set tempUser: ", tempUser);
                let mobNum = "91" + foundUser.mobile;
                console.log("otp req 91 Num: ", mobNum);
                var resultObj;
                await generateOtpRequest(mobNum).then(res => {
                    resultObj = res;
                });
                console.log("resultObj: ", resultObj);
                if(resultObj.error || resultObj.resultFail) {
                    console.log("nexmo otp gen error occured");
                    req.flash("error", "Error generating OTP, Try Again!");
                    return res.redirect("back");
                } else {
                    req.session.otp_verify = {
                        request_id: resultObj.resultSuccess.request_id,
                        mobile: foundUser.mobile
                    };
                    console.log("session.otpverify set: ", req.session.otp_verify);
                    next();
                }
            }
            else {
                console.log("found user query null");
                req.flash("error","Mobile Number not registered or incorrect number");
                return res.redirect("back");
            }
        }
    });
}
function validate_otp1 (req, res, next) {
    let otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
    console.log("res otp: ", otp);
    console.log("res session.otpverify check: ", req.session.otp_verify);

    let resultObj = verifyOtpRequest(req.session.otp_verify.request_id, otp);

    console.log("resultObj: ", resultObj);
    if(resultObj.error || resultObj.resultFail) {
        console.log("validate otp1 IF: ", resultObj);
        req.session.destroy();
        req.flash("error", "Error verifying OTP");
        return res.redirect("/login-otp");
    } else {
        console.log("res pass status: ", resultObj.resultSuccess.status);
        // console.log("assign tempUser: ", tempUser);
        req.session.currentUser = tempUser;
        // console.log("session: ", req.session);
        req.flash("success", "OTP verification success");
        return res.redirect("/");
    }
}



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