// Function for making doctor Profile Object ready for updation in DB
// it takes doctor profile object as param (usually from req.body.doctor)
function createDoctorProfileObject(docProfile) {
    console.log("inside create Doc Object Fucniton");
    var bio = docProfile.bio,
        location = docProfile.location,
        experience = docProfile.experience,
        fees = docProfile.fees;
    var speciality = [],
        education = [],
        treatments = [],
        hospitals = [],
        achievements = [],
        awards = [];

    JSON.parse(docProfile.speciality).forEach(element => {
        speciality.push(element.value);
    });
    JSON.parse(docProfile.education || '[]').forEach(element => {
        education.push(element.value);
    });
    JSON.parse(docProfile.treatments || '[]').forEach(element => {
        treatments.push(element.value);
    });
    JSON.parse(docProfile.hospitals || '[]').forEach(element => {
        hospitals.push(element.value);
    });
    JSON.parse(docProfile.achievements || '[]').forEach(element => {
        achievements.push(element.value);
    });
    JSON.parse(docProfile.awards || '[]').forEach(element => {
        awards.push(element.value);
    });

    return {
        bio: bio,
        speciality: speciality,
        education: education,
        treatments: treatments,
        location: location,
        hospitals: hospitals,
        achievements: achievements,
        awards: awards,
        experience: experience,
        fees: fees
    };
}

function validateUserObj(user) {
    if(!(user.username && user.email && user.gender && user.dob && user.country)) {
        return false;
    }
    else
        return true;
}

module.exports = {
    createDoctorProfileObject: createDoctorProfileObject,
    validateUserObj: validateUserObj
}