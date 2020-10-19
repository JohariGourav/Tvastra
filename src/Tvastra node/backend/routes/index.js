const express       = require("express"),
      router        = express.Router();

let mainController = require("../controllers/mainController");
let signupController = require("../controllers/signupController");
let loginController = require("../controllers/loginController");
let otpController = require("../controllers/otpController");
let doctorController = require("../controllers/doctorController");
let userController = require("../controllers/userController");
let slotController = require("../controllers/slotController");
let appointmentController = require("../controllers/appointmentController");

let indexMiddleware = require("../middleware/index");
let multerMiddleware = require("../middleware/multer");
let cloudinaryMiddleware = require("../middleware/cloudinaryUpload");
let doctorCheck = require("../middleware/doctorCheck");

router.get("/index.html", mainController.landing);
router.get("/", mainController.landing);
router.get("/tvastra-plus", mainController.tvastraPlus);

router.get("/doctors", doctorController.showDoctors);
router.post("/doctors/filter", doctorController.filterDoctors);
// router.get("/doctors/filter", doctorController.filterDoctors);
router.get("/find-schedule/:docId", doctorController.findSchedule);
router.get("/find-slots/:scheduleId", doctorController.findSlots);
router.get("/book-appointment/:slotId", indexMiddleware.isLoggedIn, appointmentController.showBookAppointment);
router.post("/book-appointment/:slotId", indexMiddleware.isLoggedIn, appointmentController.bookAppointment);
router.get("/cancel-appointment/:appointmentId", indexMiddleware.isLoggedIn, appointmentController.cancelAppointment);
router.get("/reschedule-appointment/:appointmentId", indexMiddleware.isLoggedIn, appointmentController.showRescheduleAppointment);
router.get("/reschedule-appointment/:appointmentId/new-slot/:slotId", indexMiddleware.isLoggedIn, appointmentController.rescheduleAppointment);

router.get("/submit-your-query", mainController.submitYourQuery);
router.get("/book-appointment", indexMiddleware.isLoggedIn, mainController.bookAppointment);
router.get("/faq", mainController.faq);
router.get("/signup", mainController.signup);
router.post("/signup", signupController.signup);
router.get("/login", mainController.login);

router.post("/login", loginController.login, doctorCheck.isDoctor);
router.get("/login-otp", mainController.login_otp);
router.post("/request-otp", otpController.request_otp, mainController.otp_submit);
router.post("/otp-validate", otpController.validate_otp, doctorCheck.isDoctor);

router.get("/logout", loginController.logout);

router.get("/forgot", mainController.forgot);
router.post("/forgot", otpController.recoverAccount_genOTP, mainController.recovery_otp_submit);
router.post("/recovery/otp-validate", otpController.recoverAccount_validateOTP);

router.get("/reset-password", mainController.resetPassword);
router.post("/reset-password", loginController.resetPassword);

router.get("/dashboard", indexMiddleware.isLoggedIn, mainController.dashboard);
router.post("/update-profile", indexMiddleware.isLoggedIn, multerMiddleware.updateProfileImg, cloudinaryMiddleware.cloudinaryProfileImg, userController.updateProfile );

router.get("/appointments", indexMiddleware.isLoggedIn, appointmentController.showAppointments);
// show current schedules and slots to doctor
router.get("/schedule", indexMiddleware.isLoggedIn, slotController.showSchedule);
router.post("/generate-slots", indexMiddleware.isLoggedIn, slotController.slotGenerator);
router.put("/change-slot-status", indexMiddleware.isLoggedIn, slotController.changeSlotStatus);

router.delete("/remove-schedule", indexMiddleware.isLoggedIn, slotController.removeSchedule);

router.post("/edit-mobile/request-otp", indexMiddleware.isLoggedIn, userController.edit_mob_request_otp);
router.post("/edit-mobile/validate-otp", indexMiddleware.isLoggedIn, userController.edit_mob_validate_otp);

// router.get("/test//reschedule-appointment/5f770e2ff1c1ee1017bb81f8", doctorController.showProfileForm);
router.get("/test-reschedule/:appointmentId", appointmentController.showRescheduleAppointment);
router.get("/test1/", (req, res) => {
    res.render("booking-status");
});
router.post("/testForm", multerMiddleware.updateProfileImg, cloudinaryMiddleware.cloudinaryProfileImg, userController.updateProfile );
// router.post("/testForm", (req, res) => {
//     console.log("body:", req.body);
//     console.log("body:", req.user);
//     console.log("body:", req.doctor);
//     res.redirect("/dashboard");
// });

module.exports = router;


// (req, res, next) => {
//     console.log(req.body.user);
//     // eval(require("locus"));
//     if(req.body.user.doctor == "true")
//         return signupController.doctorSignup;
//     else {
//         next();
//     }
// }