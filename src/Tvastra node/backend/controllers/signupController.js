const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

// create password HASH
function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

function signup(req, res) {
    console.log("inside signup control");
    // console.log("body user:", req.body.user);
    let newUser = new User(req.body.user);
    // console.log("new user:", newUser);

    if(!(newUser.username && newUser.email && newUser.mobile && newUser.password)) {
        console.log("new user check if occured");
        req.flash("error","Please enter all the required details");
        return res.redirect("/signup");
    }

    newUser.password = generateHash(newUser.password);

    User.create(newUser, (err, user) => {
        console.log("inside user register");
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/signup");
        } else {
            console.log("record success", user); 
            // req.session.currentUser = {
            //     username: user.username,
            //     _id: user._id,
            //     email: user.email,
            //     mobile: user.mobile
            // };
            // console.log("req session", req.session.currentUser);
            req.flash("success", "Signup successfull, Please Login!");
            return res.redirect("/login");   
        }
        // console.log("before pasport auth", user);
        // passport.authenticate("local")(req, res, _ => {
        //     // req.flash("success", "Welcome" + user.username);
        //     console.log("user", user);
        //     res.redirect("/");    
        // })
    });
}

module.exports = {
    signup: signup
}