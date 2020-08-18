const User = require("../models/user-model");

function isDoctor(req, res, next) {
    if(req.loggedUser.isDoctor == true) {
        User.findById(req.loggedUser._id, (err, foundUser) => {
            if(err) {
                console.log(err);
                req.flash("error", err);
                return res.redirect("back");
            } else {
                // console.log("doc profile: ",foundUser.doctorProfile);
                // console.log("doc education: ",foundUser.doctorProfile.education.length);
                // console.log("doc speciality: ",foundUser.doctorProfile.speciality.length);
                if(foundUser.doctorProfile && (foundUser.doctorProfile.education.length >0 || foundUser.doctorProfile.speciality.length > 0 )) {
                    req.flash("success", "Hi " + foundUser.username);
                    return res.redirect("/");
                }
                else {
                    req.flash("success", "Hi Dr." + foundUser.username);
                    return res.redirect("/user/" + foundUser._id + "/doctor/profile-form");
                }
            }
        });
    }
    else {
        req.flash("success", "Hi " + req.session.currentUser.username);
        return res.redirect("/")
    }
}

module.exports = {
    isDoctor: isDoctor
};