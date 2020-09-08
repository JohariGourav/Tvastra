const cloudinary = require("cloudinary").v2;
const path = require("path");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cloudinaryProfileImg (req, res, next) {
    if(!req.file) {
        return next();
    }
    try {
        var result = await cloudinary.uploader.upload(req.file.path, {
            public_id: "Tvastra/user/profile_image/" + req.file.filename.split('.')[0]
        });
        
    } catch(err) {
        console.log("cloudinary catch error: ", err);
        req.flash('error', err);
        return res.redirect("back");
    }
    req.imageId = result.public_id;
    req.image = result.secure_url;
    if(req.updateImgFlag) {
        destroyProfileImg();
    }
    return next();
}

async function destroyProfileImg() {
    console.log("inside destroy");
    try {
        var result = await cloudinary.uploader.destroy(req.session.currentUser.imageId);
    } catch (err) {
        console.log("cloudinary destroy catch error: ", err);
    } 
    finally {
        console.log("destroy result: ", result);
    }
}

module.exports = {
    cloudinaryProfileImg: cloudinaryProfileImg
};

// let path = '/home/gauravjohari/Documents/Konfinity/css/src/Tvastra node/backend/userData/15975782264531080p-hd-wallpapers-3d-download-620x349.jpg';
// cloudinary.uploader.upload(path, {
//     public_id: "Tvastra/user/profile_image/" + "15975782264531080p-hd-wallpapers-3d-download-620x349.jpg"
// }, (err, result) => {
//     if(err) {
//         console.log("err: ", err);
//     }
//     else
//         console.log("result: ", result);
// });
