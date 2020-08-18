const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
    filename: function(req, file, callback) {
        console.log("file: ", file);
        callback(null, Date.now() + file.originalname);
    },
    destination: function(req, file, callback) {
        console.log("path: ",path.dirname("../"));
        console.log(path.dirname("./"));
        console.log(path.dirname(__dirname));
        callback(null,  path.join( path.dirname(__dirname) + "/userData"));
        // path.join(__dirname + "/userData")
    }
});
let imageFilter = function (req, file, callback) {
    // accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    callback(null, true);
}

let uploadProfilePhoto = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {fileSize: 1 * 1024 * 1024, files: 1} 
});

function uploadDocImg (req, res, next) {
    let upload = uploadProfilePhoto.single("doctor[image]");

    upload( req, res, err => {
        if(err instanceof multer.MulterError) {
            // Multer error occurred while uploading
            console.log("multer error: ", err);
            req.flash('error', err);
            return res.redirect("back");
        } else if (err) {
            // Unknown error occurred while uploading
            console.log("unknown upload err: ", err);
            req.flash('error', err);
            return res.redirect("back");
        }
        return next();
    });
}

function uploadUserImg (req, res, next) {
    // yet to be created
}

module.exports = {
    uploadDocImg: uploadDocImg
};
