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
    country: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);