let middlewareObj = {};

middlewareObj.isLoggedIn = (req, res ,next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Login Required");
    res.redirect("/login");
}

module.exports = middlewareObj;