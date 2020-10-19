const mongoose      = require("mongoose");
const slotSchema = require("../models/slot-model").slotSchema;

let appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    patient: {
        name: {type: String, required: true},
        email: {type: String, required: true},
        mobile: {type: Number, required: true},
    },
    selfBooking: {type: Boolean, default: true, required: true},
    slot: [slotSchema],
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed'],
        required: true,
        default: 'Confirmed'
    }
},
{timestamps: true});

module.exports = mongoose.model("Appointment", appointmentSchema);
