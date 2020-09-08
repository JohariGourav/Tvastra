const express       = require("express"),
      router        = express.Router();

let mainController = require("../controllers/mainController");
let doctorController = require("../controllers/doctorController");

let indexMiddleware = require("../middleware/index");
let multerMiddleware = require("../middleware/multer");
let cloudinaryMiddleware = require("../middleware/cloudinaryUpload");


// Doctor profile form - SHOW AND SUBMIT ROUTES
router.get("/:docId/doctor/profile-form", indexMiddleware.isLoggedIn, doctorController.showProfileForm);
router.post("/:docId/doctor/profile-form", indexMiddleware.logBody, indexMiddleware.isLoggedIn, multerMiddleware.uploadDocImg, cloudinaryMiddleware.cloudinaryProfileImg, doctorController.submitProfileForm);

router.get("/:docId/doctor/profile", doctorController.showProfile);

// router.post("/testForm",indexMiddleware.logBody, (req, res) => {
//     console.log("body:", req.body);
//     console.log("body:", req.user);
//     console.log("body:", req.doctor);
//     res.redirect("/dashboard");
// });

module.exports = router;
