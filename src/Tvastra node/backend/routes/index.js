const express       = require("express"),
      router        = express.Router();

let mainController = require("../controllers/mainController");
let signupController = require("../controllers/signupController");
let loginController = require("../controllers/loginController");
let otpController = require("../controllers/otpController");
let mainMiddleware = require("../middleware/index");

// router.route("/abc").get((req, res) => {
//     console.log("book route");
//     res.send("Hi ABC");
// });

router.get("/index.html", mainMiddleware.isLoggedIn, mainController.landing);
router.get("/", mainMiddleware.isLoggedIn, mainController.landing);
router.get("/tvastra-plus", mainController.tvastraPlus);

router.get("/submit-your-query", mainController.submitYourQuery);
router.get("/book-appointment", mainController.bookAppointment);
router.get("/faq", mainController.faq);
router.get("/signup", mainController.signup);
router.post("/signup", signupController.signup);
router.get("/login", mainController.login);

router.post("/login", loginController.login);
router.get("/login-otp", mainController.login_otp);
router.post("/request-otp", otpController.request_otp, mainController.otp_submit);
router.post("/otp-validate", otpController.validate_otp);

module.exports = router;