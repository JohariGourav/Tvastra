const User = require("../models/user-model");
const Schedule = require("../models/slot-model").schedule;
const Slot = require("../models/slot-model").slot;
const createNextXDays = require("../util/userUtil").createNextXDays;

const createDoctorProfileObject = require("../util/userUtil").createDoctorProfileObject;

// Show Doctors Page
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
            return res.render("doctors", { doctors: result });
        } else {
            req.flash("error", "Server error occurred");
            return res.redirect("back");
        }
    });
    // res.render("doctor.html");
}

// filter functionality for Doctors page filters
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
        return res.render("partials/doctorsPartial", { doctors: result});
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

/*-------------------------------------------------
    Show Doctor Profile form to Doctors who are logging 
    in for first time OR who haven't filled the form yet
------------------------------------------------*/
function showProfileForm(req, res) {
    res.render("doctor-profile-form");
}

// Submit the filled Doctor profile form
function submitProfileForm(req, res) {
    console.log("----file-----", req.file);
    console.log("imageID: ", req.imageId);
    console.log("image: ", req.image);
    console.log("body: ", req.body);
    let _id = req.params.docId;
    console.log("id: ", _id);

    if (_id != req.session.currentUser._id) {
        console.log("both ids: docID: ", _id, " sessionId: ", req.session.currentUser._id);
        req.logout();
        req.session.currentUser = undefined;
        req.flash("error", "Unauthorized Access, Please Login!")
        return res.redirect("/login");
    }

    let docProfile = createDoctorProfileObject(req.body.doctor);
    console.log("function returned doc obj: ", docProfile);

    if (docProfile.education.length < 1 || docProfile.speciality.length < 1) {
        req.flash("error", "Please fill mandatory fields");
        return res.redirect("back");
    }

    let updateData = {
        doctorProfile: docProfile
    };
    if(req.image && req.imageId) {
        updateData.image = req.image;
        updateData.imageId = req.imageId;
    }

    User.findOneAndUpdate({
        _id: _id
    }, updateData, 
    {
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

// Show the basic Doctor Profile (from Tvastra tasks)
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

// Serves schedule of a doctor on doctors page through axios get request
async function findSchedule(req, res) {
    let id = req.params.docId;
    console.log("params: ", req.params);
    console.log("body: ", req.body);
    console.log("id: ", id);
    // console.log("id: ", new Date( new Date().setHours(0, 0, 0, -1)));
    try {
        let schedules = await Schedule.find({
            doctor: req.params.docId,
            date: { $gt: new Date( new Date().setHours(0, 0, 0, -1)) },
            // slots: { $elemMatch: { status: 'Available'}}
            // "slots.status": 'Available'
        }).
        populate('slots').
        sort({date: 1});

        // function(err, results) {
            schedules.forEach( result => {
                result.slots = result.slots.filter( x => {
                    // console.log("x: ", x.status);
                    return x.status == 'Available';
                });
                // console.log("status : ", result.slots);
            });
            // return results;
        // }
        
        // where('slots.slot.status').equals('Available');
        // console.log("schedule result: ", schedules);
        let days10 = createNextXDays(9);
        let days = {};
        days10.forEach(day => {
            days[day.getTime()] = null;
        });
        // console.log("days: ", days);
        schedules.forEach( (schedule, index)  => {
            // console.log("schedule.date.getTime(): ", schedule.date.getTime());
            // console.log("schedule.date.getTime(): ", days['' + schedule.date.getTime() + '']);
            if(days['' + schedule.date.getTime() + ''] === null) {
                days[schedule.date.getTime()] = index;
            }
        });
        console.log("days: ", days);
        return res.render("partials/schedulesPartial", {schedules: schedules, days: days});
    } catch (error) {
        console.log("find schedules Error: ", error);
		return res.status(500).send(false);
    }
}

// Serves slots of a schedule on doctors page through axios get request
async function findSlots(req, res) {
    let id = req.params.scheduleId;
    console.log("params: ", req.params);
    // console.log("id: ", new Date( new Date().setHours(0, 0, 0, -1)));
    try {
        let morningSlots = [],
            afternoonSlots = [],
            eveningSlots = [];
        let slotsEmptyFlag = false;

        if(id.length != 24) {
            slotsEmptyFlag = true;
            // afternoonSlots.push({time: 'No Slot Available'});
            return res.render("partials/slotsPartial", {
                morningSlots: morningSlots,
                afternoonSlots: afternoonSlots,
                eveningSlots: eveningSlots,
                slotsEmptyFlag: slotsEmptyFlag
            });
        }
        let schedule = await Schedule.findById({
            _id: id,
            // date: { $gt: new Date( new Date().setHours(0, 0, 0, -1)) },
        }).
        populate('slots').
        sort({createdAt: 1});
  
        schedule.slots.forEach( slot => {
            if(slot.status == 'Available') {
                let startTime = slot.startTime.split(':'); 
                let startTimeTotalMinutes = startTime[0] * 60 + parseInt(startTime[1]);
                // console.log("start time : ", startTime, startTimeTotalMinutes);
                if( startTimeTotalMinutes < (12 * 60) )
                    morningSlots.push({slotId: slot._id, time: `${slot.startTime} - ${slot.endTime}`});
                else if( startTimeTotalMinutes >= (16 * 60))
                    eveningSlots.push({slotId: slot._id, time: `${slot.startTime} - ${slot.endTime}`});
                else
                    afternoonSlots.push({slotId: slot._id, time: `${slot.startTime} - ${slot.endTime}`});
            }  
        });
        // console.log("mor slots: ", morningSlots); 
        if( morningSlots.length == 0 && afternoonSlots.length == 0 && eveningSlots.length == 0) {
            slotsEmptyFlag = true
        }    
        return res.render("partials/slotsPartial", {
            morningSlots: morningSlots,
            afternoonSlots: afternoonSlots,
            eveningSlots: eveningSlots,
            slotsEmptyFlag: slotsEmptyFlag
        });
    } catch (error) {
        console.log("find slots Error: ", error);
		return res.status(500).send(false);
    }
}

module.exports = {
    showDoctors: showDoctors,
    filterDoctors: filterDoctors,
    showProfileForm: showProfileForm,
    submitProfileForm: submitProfileForm,
    showProfile: showProfile,
    findSchedule: findSchedule,
    findSlots: findSlots
};