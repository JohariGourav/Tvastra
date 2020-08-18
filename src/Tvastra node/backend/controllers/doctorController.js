const User = require("../models/user-model");


function showProfileForm (req, res) {
    res.render("doctor-profile-form");
}

function submitProfileForm (req, res) {
    console.log("----file-----", req.file);
    console.log("imageID: ", req.imageId);
    console.log("image: ", req.image);
    let _id = req.params.docId;
    let docProfile = req.body.doctor;

    console.log("id: ", _id);
    console.log("doc obj: ", docProfile);

    if(_id != req.session.currentUser._id) {
        console.log("both ids: docID: ", _id, " sessionId: ", req.session.currentUser._id);
        req.logout();
        req.session.currentUser = undefined;
        req.flash("error", "Unauthorized Access, Please Login!")
        return res.redirect("/login");
    }
    var bio = docProfile.bio,
        location = docProfile.location,
        experience = docProfile.experience,
        fees = docProfile.fees;
    var speciality = [],
        education = [],
        treatments = [],
        hospitals = [],
        achievements = [],
        awards = [];

    JSON.parse(docProfile.speciality).forEach(element => {
        speciality.push(element.value);
    });
    JSON.parse(docProfile.education || '[]').forEach(element => {
        education.push(element.value);
    });
    JSON.parse(docProfile.treatments || '[]').forEach(element => {
        treatments.push(element.value);
    });
    JSON.parse(docProfile.hospitals || '[]').forEach(element => {
        hospitals.push(element.value);
    });
    JSON.parse(docProfile.achievements || '[]').forEach(element => {
        achievements.push(element.value);
    });
    JSON.parse(docProfile.awards || '[]').forEach(element => {
        awards.push(element.value);
    });

    docProfile = {
        bio: bio,
        speciality: speciality,
        education: education,
        treatments: treatments,
        location: location,
        hospitals: hospitals,
        achievements: achievements,
        awards: awards,
        experience: experience,
        fees: fees
    };
    console.log("Updated doc obj: ", docProfile);

    if(education.length < 1 || speciality.length < 1) {
        req.flash("error", "Please fill mandatory fields");
        return res.redirect("back");
    }

    User.findOneAndUpdate({
        _id: _id
    }, {
        doctorProfile: docProfile,
        image: req.image,
        imageId: req.imageId
    },{
        new: true
    }, (err, result) => {
        if(err) {
            console.log("docUpdate queryErr: ", err);
            req.flash("error", "Error Updating profile");
            return res.redirect("back");
        } else if(result){
            req.flash("success", "Profile Updated");
            return res.redirect("/");
        } else {
            req.flash("error", "Profile Update Failed, Try Again!");
            return res.redirect("back");
        }
    });
}

module.exports = {
    showProfileForm: showProfileForm,
    submitProfileForm: submitProfileForm
};