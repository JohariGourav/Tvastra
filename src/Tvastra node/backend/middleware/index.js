let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res ,next) => {
    console.log("inside islog check");
    // console.log(req.session);
    // console.log("curentUser: ",req.session.currentUser);
    if(req.session.currentUser && req.session.currentUser._id && req.session.currentUser._id.length > 0) {
        return next();
    }
    req.flash("error", "Login Required");
    res.redirect("/login");
    res.session.destroy();
    // console.log("end");
};

middlewareObj.logBody = (req, res ,next) => {
    console.log("req:", req.image || null);
    console.log("body:", JSON.stringify(req.body));
    next();
}

module.exports = middlewareObj;