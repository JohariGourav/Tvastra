const mongoose      = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
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
    },
    image: { 
        type: String,
        default: 'https://res.cloudinary.com/devcloudmedia/image/upload/v1597748962/Tvastra/user/profile_image/default-profile-picture_ncauvp.png'
    },
    imageId: { 
        type: String,
        default: 'Tvastra/user/profile_image/default-profile-picture_ncauvp'
    }
},
{timestamps: true});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);