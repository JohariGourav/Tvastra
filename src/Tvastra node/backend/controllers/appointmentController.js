const assert = require("assert");
const mongoose = require("mongoose");
const db = mongoose.connection;
const User = require("../models/user-model");
const Schedule = require("../models/slot-model").schedule;
const Slot = require("../models/slot-model").slot;
const Appointment = require("../models/appointment-model");

const createNextXDays = require("../util/userUtil").createNextXDays;



// show book appointment page
async function showBookAppointment(req, res) {
    let id = req.params.slotId;
    console.log("params11: ", req.params);
    console.log("body: ", req.body);
    console.log("id11: ", id);
    try {
        let slot = await Slot.findById({
            _id: id,
        }).
            populate({
                path: "doctor.id",
                select: { image: 1, doctorProfile: 1 }
            });

        // console.log("slot: ", slot);

        if (slot) {
            res.render("book_appointment", { slot: slot });
        }
        else {
            req.flash("error", "Slot doesn't exist, kindly book other slot!");
            return res.redirect("back");
        }

        // if(slot.status == 'Booked') {
        //     req.flash("error", "Slot reserved, kindly book other slot!");
        //     return res.redirect("back");
        // }
        // else if(slot.status == 'Busy') {
        //     req.flash("error", "Slot busy, kindly book other slot!");
        //     return res.redirect("back");
        // }
    } catch (error) {
        console.log("show book appointment Error: ", error);
        req.flash("error", "Server Error Occurred!");
        return res.status(500).redirect("back");
    }
}

async function bookAppointment(req, res) {
    let id = req.params.slotId;
    let patientName = req.body['patient-name'];
    let patientMobile = req.body['patient-mobile'];
    let patientEmail = req.body['patient-email'];
    let selfBooking = req.body.patient == 'self';
    // console.log("params: ", req.params);
    console.log("id: ", id, patientName, patientMobile, patientEmail);

    const session = await db.startSession();
    session.startTransaction();

    try {
        var transactionFlag = false, flashFlag = false;
        var slot = await Slot.findById({
            _id: id,
        }, null,
            { session: session }).
            populate({
                path: "doctor.id",
                select: { image: 1, doctorProfile: 1 }
            });
        // console.log("slot status: ", slot.status);
        if (slot.status != 'Available') {
            transactionFlag = false;
            req.flash("error", "Slot already booked or busy!");
            flashFlag = true;
            throw new Error('Slot is not Available');
        }
        else if (!verifySlotDateAndStartTime(slot.date, slot.startTime)) {
            console.log("slot time is passed");
            transactionFlag = false;
            req.flash("error", "Slot time is already passed, please take other slot!");
            flashFlag = true;
            throw new Error('Slot date/start time is less than current time');
        }
        else {
            console.log("slot status3: ", slot.status);
            slot.status = 'Booked';
            slot.save();
            var appointment = await Appointment.create({
                user: req.session.currentUser._id,
                patient: {
                    name: patientName,
                    email: patientEmail,
                    mobile: patientMobile
                },
                selfBooking: selfBooking,
                slot: [slot],
                status: 'Confirmed'
            });
            console.log("appoint status: ", appointment);
            // throw new Error('self error');
            transactionFlag = true;
            await session.commitTransaction();
        }
    } catch (error) {
        console.log("session withTransaction Error: ", error);
        transactionFlag = false;
        // console.log("flash Error: ", req.flash().error);
        // console.log("flash Error: ", req.flash().error);
        if (!flashFlag) {
            console.log("flash Error iff: ", req.flash().error);
            req.flash("error", "Internal Server Error, Retry!");
        }
        let abort = await session.abortTransaction();
        appointment = null;
        // console.log("abort: ", abort);
    }
    finally {
        session.endSession();
    }
    console.log("transac res: ", appointment);
    transactionFlag ? res.render("booking-status", { slot: slot, appointment: appointment }) : res.redirect("back");
}

async function cancelAppointment(req, res) {
    let appopintmentId = req.params.appointmentId;

    console.log("params: ", req.params);
    console.log("body: ", req.body);
    console.log("id: ", appopintmentId);

    const session = await db.startSession();
    session.startTransaction();

    try {
        var transactionFlag = false, flashFlag = false;
        var appointment = await Appointment.findById({
            _id: appopintmentId,
        });

        if (appointment.user != req.session.currentUser._id) {
            req.flash("error", "Unauthorized Request!");
            flashFlag = true;
            transactionFlag = false;
            throw new Error('User is not associated with this appointment');
        }
        else if (appointment.status == "Cancelled" || appointment.status == "Completed") {
            req.flash("error", "Appointment already cancelled or completed!");
            flashFlag = true;
            transactionFlag = false;
            throw new Error('Appointment already cancelled or completed');
        }
        else if (!verifySlotDateAndStartTime(appointment.slot[0].date, appointment.slot[0].startTime)) {
            console.log("appointment is in past", appointment.slot[0].date, appointment.slot[0].startTime);
            transactionFlag = false;
            req.flash("error", "Cannot cancel past appointment!");
            flashFlag = true;
            // res.redirect("back");
            throw new Error('Slot date/start time is less than current time');
        }
        else {
            var slot = await Slot.findById({
                _id: appointment.slot[0]._id,
            }).populate({
                path: "doctor.id",
                select: { image: 1, doctorProfile: 1 }
            });

            if (slot.status == "Booked" && appointment.status == "Confirmed") {

                slot.status = "Available";
                await slot.save();

                appointment.status = "Cancelled";
                appointment.slot[0].status = slot.status;
                await appointment.save();
            }
            else {
                console.log("slot status != Booked OR appoint status != Confirmend");
            }
            // console.log("slot status: ", slot); 
            // console.log("appoint status: ", appointment);
            // throw new Error('self error');
            transactionFlag = true;
            await session.commitTransaction();
        }
    } catch (error) {
        console.log("session withTransaction Error: ", error);
        if (!flashFlag)
            req.flash("error", "Internal Server Error, Retry!");
        let abort = await session.abortTransaction();
        appointment = null;
        transactionFlag = false;
        // console.log("abort: ", abort);
    }
    finally {
        session.endSession();
    }
    console.log("transac res: ", appointment);
    transactionFlag ? res.render("booking-status", { slot: slot, appointment: appointment }) : res.redirect("back");
}

// Show Reschedule appointment page
async function showRescheduleAppointment(req, res) {
    let appointmentId = req.params.appointmentId;
    console.log("id: ", appointmentId);

    try {
        let appointment = await Appointment.findById({
            _id: appointmentId,
        });
        let schedules = await Schedule.find({
            doctor: appointment.slot[0].doctor.id,
            date: { $gt: new Date(new Date().setHours(0, 0, 0, -1)) },
        }).
            populate({
                path: "slots",
                match: { status: "Available" }
            }).
            sort({ date: 1 });

        // console.log("schedules query: ", schedules);
        let days9 = createNextXDays(9);
        let days = {};
        days9.forEach(day => {
            days[day.getTime()] = null;
        });
        schedules.forEach((schedule, index) => {
            if (days['' + schedule.date.getTime() + ''] === null) {
                days[schedule.date.getTime()] = index;
            }
        });
        console.log("days after: ", days);
        return res.render("reschedule", { schedules: schedules, days: days, appointment: appointment });

    } catch (error) {
        console.log("show reschedule Error: ", error);
        req.flash("error", "Internal Server Error, Retry!");
        return res.redirect("back");
    }
}

// Reschedule the appointment
async function rescheduleAppointment(req, res) {
    let appointmentId = req.params.appointmentId;
    let slotId = req.params.slotId;
    console.log("ids:---------------------------");
    console.log("ids: ", appointmentId, slotId);

    const session = await db.startSession();
    session.startTransaction();
    try {
        var transactionFlag = false, flashFlag = false;
        var appointment = await Appointment.findById({
            _id: appointmentId,
        });
        if (appointment.user != req.session.currentUser._id) {
            req.flash("error", "Unauthorized Request!");
            flashFlag = true;
            transactionFlag = false;
            throw new Error('User is not associated with this appointment');
        }
        else if (appointment.status == "Cancelled" || appointment.status == "Completed") {
            req.flash("error", "Can't reschedule, appointment already cancelled or completed!");
            flashFlag = true;
            transactionFlag = false;
            throw new Error('Appointment already cancelled or completed');
        }
        else if (!verifySlotDateAndStartTime(appointment.slot[0].date, appointment.slot[0].startTime)) {
            console.log("appointment is in past", appointment.slot[0].date, appointment.slot[0].startTime);
            transactionFlag = false;
            req.flash("error", "Cannot reschedule past appointment!");
            flashFlag = true;
            // res.redirect("back");
            throw new Error('Appointment date/start time is less than current time');
        }
        else {
            console.log("else -----------------------------");
            var slot = await Slot.findById({
                _id: slotId,
            }).populate({
                path: "doctor.id",
                select: { image: 1, doctorProfile: 1 }
            });

            if (slot.status != "Available") {
                transactionFlag = false;
                req.flash("error", "Selected Slot not available!");
                flashFlag = true;
                throw new Error('Selected Slot not available!');
            }
            else if (toString(appointment.slot[0].doctor.id) != toString(slot.doctor.id)) {
                console.log("doc ids", appointment.slot[0].doctor.id, slot.doctor.id._id);
                console.log("doc types",typeof appointment.slot[0].doctor.id, typeof slot.doctor.id._id);
                transactionFlag = false;
                req.flash("error", "Selected Slot doesn't belong to same doctor!");
                flashFlag = true;
                throw new Error("Selected Slot doesn't belong to same doctor!");
            }
            else {
                slot.status = "Booked";
                await slot.save();

                await Slot.findByIdAndUpdate({
                    _id: appointment.slot[0]._id,
                }, {
                    status: "Available"
                });

                appointment.slot.pop();
                appointment.slot.push(slot);
                await appointment.save();
            }
            // console.log("slot status: ", slot); 
            // console.log("appoint status: ", appointment);
            // throw new Error('self error');
            transactionFlag = true;
            await session.commitTransaction();
        }
    } catch (error) {
        console.log("reschedule session Transaction Error: ", error);
        if (!flashFlag)
            req.flash("error", "Internal Server Error, Retry!");
        let abort = await session.abortTransaction();
        appointment = null;
        transactionFlag = false;
        // console.log("abort: ", abort);
    }
    finally {
        session.endSession();
    }
    console.log("transac res: ", appointment);
    transactionFlag ? res.render("booking-status", { slot: slot, appointment: appointment }) : res.redirect("back");
}

// show appointments on dashboard panel
async function showAppointments(req, res) {
    console.log("is doctor: ", req.session.currentUser.isDoctor);

    let appointments, upcomingAppointments = [], pastAppointments = [];

    if (req.session.currentUser.isDoctor) {
        appointments = await Appointment.find({
            "slot.0.doctor.id": req.session.currentUser._id
        }).sort({ "slot.0.date": -1 });
        // console.log("doc appoi: ", appointments);
    }
    else if (!req.session.currentUser.isDoctor) {
        appointments = await Appointment.find({
            user: req.session.currentUser._id
        });
    }
    appointments.forEach(appointment => {
        let boolean = verifySlotDateAndStartTime(appointment.slot[0].date, appointment.slot[0].startTime);
        if (boolean)
            upcomingAppointments.push(appointment);
        else
            pastAppointments.push(appointment);
    });
    res.render("appointments", {
        upcomingAppointments: upcomingAppointments,
        pastAppointments: pastAppointments
    });
}

/*
 * Verifies if slot start time is greater than current time
 * Also, verifies slot date must not be less than today
 * @params - slotDate (format - Mongo Date/ JS Date)
 *           slotStartTime (format - "23:07")
 * return - false (if slot start time is in past OR slot date is in past)
 *          true (if slot start time is in future)
 */
function verifySlotDateAndStartTime(slotDate, slotStartTime) {
    let slotStartTotalSeconds = (slotStartTime.split(":")[0] * 60 * 60) + (slotStartTime.split(":")[1] * 60);
    let currentTime = new Date();
    let today = new Date(new Date().setHours(0, 0, 0, 0));
    let tomorrow = new Date(new Date().setHours(0, 0, 0, 0));
    tomorrow.setDate(tomorrow.getDate() + 1);
    let currentTotalSeconds = (currentTime.getHours() * 60 * 60) + (currentTime.getMinutes() * 60) + currentTime.getSeconds();

    if (slotDate.getTime() < today.getTime()) {
        console.log("slot date is in past");
        return false;
    }
    else if ((slotDate.getTime() == today.getTime()) && currentTotalSeconds > slotStartTotalSeconds) {
        console.log("slot time, now time: ", slotStartTime, currentTime);
        return false;
    }
    else {
        console.log("slot date is in future or today");
        return true;
    }
}

module.exports = {
    showBookAppointment: showBookAppointment,
    bookAppointment: bookAppointment,
    cancelAppointment: cancelAppointment,
    showRescheduleAppointment: showRescheduleAppointment,
    rescheduleAppointment: rescheduleAppointment,
    showAppointments: showAppointments
}

// if(appointment.user != req.session.currentUser._id) {
//     req.flash("error", "Unauthorized Request!");
//     flashFlag = true;
//     transactionFlag = false;
//     throw new Error('User is not associated with this appointment');
// }
// else if (appointment.status == "Cancelled" || appointment.status == "Completed") {
//     req.flash("error", "Appointment already cancelled or completed!");
//     flashFlag = true;
//     transactionFlag = false;
//     throw new Error('Appointment already cancelled or completed');
// }
// else if( !verifySlotDateAndStartTime(appointment.slot[0].date, appointment.slot[0].startTime)) {
//     console.log("appointment is in past",appointment.slot[0].date, appointment.slot[0].startTime);
//     transactionFlag = false;
//     req.flash("error", "Cannot cancel past appointment!");
//     flashFlag = true;
//     // res.redirect("back");
//     throw new Error('Slot date/start time is less than current time');
// }
// else {
//     var slot = await Slot.findById({
//         _id: appointment.slot[0]._id,
//     }).populate({
//         path: "doctor.id",
//         select: {image: 1, doctorProfile: 1}
//     });        

//     if(slot.status == "Booked" && appointment.status == "Confirmed") {

//         slot.status = "Available";
//         await slot.save();

//         appointment.status = "Cancelled";
//         appointment.slot[0].status = slot.status;
//         await appointment.save();
//     }
//     else {
//         console.log("slot status != Booked OR appoint status != Confirmend");                
//     }
//     // console.log("slot status: ", slot); 
//     // console.log("appoint status: ", appointment);
//     // throw new Error('self error');