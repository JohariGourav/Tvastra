const User = require("../models/user-model");

function showDoctors(req, res) {
    User.find({
        isDoctor: true
    }, {
        email: 0,
        mobile: 0,
        password: 0,
        gender: 0,
        birth: 0,
        imageId: 0
    }, (err, result) => {
        console.log("err: ", err, " --result: ", null);
        if (err) {
            console.log("show profile queryErr: ", err);
            req.flash("error", "Server Error");
            return res.redirect("back");
        } else if (result) {
            // req.flash("success", "Profile Updated");
            return res.render("doctors", { doctors: result, location: false });
        } else {
            req.flash("error", "Server error occurred");
            return res.redirect("back");
        }
    });
    // res.render("doctor.html");
}

function filterDoctors(req, res) {
    console.log(req.body);
    let {location, treatments, hospitals, experience, sort} = req.body;
    
    // filteration vars query setup
    location.length == 0 ? location= {$exists: true} : location = location;
    treatments.length == 0 ? treatments= {$exists: true} : treatments = { $in: treatments };
    hospitals.length == 0 ? hospitals= {$exists: true} : hospitals = { $in: hospitals };
    experience.length == 0 ? experience= {$exists: true} : experience = experience;
    console.log("body loc: ",req.body.location);
    console.log("location: ",location);
    console.log("treatments: ",treatments);
    console.log("hospitals: ",hospitals);
    console.log("experience: ",experience);
    console.log("sort: ",sort);
    console.log("tye: ",typeof sort);

    // sort vars query setup
    let sortQuery = undefined,
        sortFields = {
            'name-asc': { username: 1},
            'name-dec': { username: -1},
            'hospital-asc': {"doctorProfile.hospitals": 1},
            'hospital-dec': {"doctorProfile.hospitals": -1},
            'fees-asc': {"doctorProfile.fees": 1},
            'fees-dec': {"doctorProfile.fees": -1},
            'experience-dec': {"doctorProfile.experience": -1},
            '' : undefined
        };
        sortQuery = sortFields[sort];
        console.log("query: ",sortQuery);

    User.find({
        $and: [
             { "doctorProfile.location": location },  
             { "doctorProfile.treatments": treatments }, 
             { "doctorProfile.hospitals":  hospitals  },
             { "doctorProfile.experience": experience }, 
        ],
        // $or: [{ username: "John Nission" }, { email: "john_nission@gmail.com" }, { username: "doctor3" }],
        isDoctor: true
    }, {
        email: 0,
        mobile: 0,
        password: 0,
        gender: 0,
        birth: 0,
        imageId: 0
    }, {
        sort: sortQuery
    }, (err, result) => {
        console.log("err: ", err, " --result: ", 'result');
        return res.render("doctorsPartial", { doctors: result});
    });
    // res.JSON("hello");
}
// let x = {
//     location: { Dwarka: 'Dwarka', LajpatNagar: 'Lajpat Nagar' },
//     city: { delhi: 'delhi', mumbai: 'mumbai' }
// }
// let a = { location: [ 'DLF Cyber City', 'Dwarka' ],
//           city: ['delhi',  'mumbai']
// };
// for (let key in x) {
//     if(x.hasOwnProperty(key)) {
//         console.log(key, x[key], Object.values(x[key]));
//     }
// }

function showProfileForm(req, res) {
    res.render("doctor-profile-form");
}

function submitProfileForm(req, res) {
    console.log("----file-----", req.file);
    console.log("imageID: ", req.imageId);
    console.log("image: ", req.image);
    let _id = req.params.docId;
    let docProfile = req.body.doctor;

    console.log("id: ", _id);
    console.log("doc obj: ", docProfile);

    if (_id != req.session.currentUser._id) {
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

    if (education.length < 1 || speciality.length < 1) {
        req.flash("error", "Please fill mandatory fields");
        return res.redirect("back");
    }

    User.findOneAndUpdate({
        _id: _id
    }, {
        doctorProfile: docProfile,
        image: req.image,
        imageId: req.imageId
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            console.log("docUpdate queryErr: ", err);
            req.flash("error", "Error Updating profile");
            return res.redirect("back");
        } else if (result) {
            req.flash("success", "Profile Updated");
            return res.redirect("/");
        } else {
            req.flash("error", "Profile Update Failed, Try Again!");
            return res.redirect("back");
        }
    });
}

function showProfile(req, res) {
    User.findById(req.params.docId, (err, result) => {
        console.log("err: ", err, " --result: ", result);
        if (err) {
            console.log("show profile queryErr: ", err);
            req.flash("error", "Server Error");
            return res.redirect("back");
        } else if (result) {
            // req.flash("success", "Profile Updated");
            return res.render("doctor's-profile", {
                docProfile: result.doctorProfile,
                username: result.username,
                image: result.image
            });
        } else {
            req.flash("error", "Profile not found");
            return res.redirect("back");
        }
    });
}

module.exports = {
    showDoctors: showDoctors,
    filterDoctors: filterDoctors,
    showProfileForm: showProfileForm,
    submitProfileForm: submitProfileForm,
    showProfile: showProfile
};