const mongoose      = require("mongoose");

let scheduleSchema = new mongoose.Schema({
    date: {type: Date, required: true},
    day: {
        type: String,
        enum: ['Sun', 'Mon', 'Tue', 'Wed','Thu','Fri','Sat'],
        required: true
    },
    dayStartTime: {type: String, required: true, maxlength:5},
    dayEndTime: {type: String, required: true, maxlength:5},
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    slots: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Slot"
        }
    ]
},
{timestamps: true});

let slotSchema = new mongoose.Schema({
    date: {type: Date, required: true},
    startTime: {type: String, required: true, maxlength: 5, minlength: 5},
    endTime: {type: String, required: true, maxlength: 5, minlength: 5},
    interval: { type: Number, required: true, min: 10},
    hospital: {type: String, required: true},
    doctor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: {type: String, required: true}
    },
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Busy'],
        required: true,
        default: 'Available'
    }
},
{timestamps: true});

module.exports = {
    schedule: mongoose.model("Schedule", scheduleSchema),
    slot: mongoose.model("Slot", slotSchema),
    slotSchema: slotSchema
};