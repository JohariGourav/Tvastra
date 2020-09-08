const mongoose      = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let doctorSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    mobile: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    gender: String,
    birth: Date,
    city: String,
    state: String,
    country: String,
    isDoctor: {
        type: Boolean, default: false
    },
    doctorProfile: {
        bio: String,
        speciality: Array,
        education: Array,
        treatments: Array,
        location: String,
        hospitals: Array,
        achievements: Array,
        awards: Array,
        experience: String,
        fees: String,
    }
});

// doctorSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model("Doctor", doctorSchema);

// schedule = [
//     {
//         date: date,
//         day: day,
//         dayStartTime: time,
//         dayEndTime: time,
//         slots = [
//             { ref: slotId}
//         ]
//     }
// ]

// slots = [
//     {
//         id: {},
//         date: date,
//         startTime: Time,
//         endTime: Time,
//         interval: integer,
        
//         doctor: { id, name },
//         hospital: name,
//         status: [Available, Booked, Busy]
//     }
// ]

// appointment = {
//     status: [confirmed, cancelled, completed],
//     user: { id: ref},
//     patient: {  name, mobile, email,  },
//     selfBooking: {boolean , default: true},
//     slot : [slotschema],
// }