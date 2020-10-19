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

/* --------------------------------
    Validate the Date is between today and next 6 days
    @params - Array with elements of Date
    example - [1599747369202, 2020-09-10T14:16:09.202Z]
    Returns - Boolean flag
------------------------------------*/
function validate7Days(daysArr) {
    let flag = true;
    let today = new Date( new Date().setHours(0, 0, 0, 0));
	let day7 = new Date( new Date().setHours(0, 0, 0, 0));
	day7.setDate(today.getDate() + 6);

	daysArr.forEach( date => {
		if(!(date >= today && date <= day7)) {
			console.log("today: ", today);
			console.log("date: ", date);
			console.log("day7: ", day7);
			flag = false;
		}
	});
    return flag;
}

// Creates X consecutive Dates starting from (including)Today
function createNextXDays(totalDaysToCreate=7) {
    let daysX = [];
    daysX[0] = new Date(new Date().setHours(0, 0, 0, 0));
    console.log("daysX 0: ", daysX[0]);
    for(let i=1; i<= totalDaysToCreate-1; i++) {
        let temp = new Date(new Date().setHours(0, 0, 0, 0));
        temp.setDate(daysX[0].getDate() + i);
        daysX.push(temp);
    }
    // console.log("daysX: ", daysX);
    return daysX;
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
    validateUserObj: validateUserObj,
    validate7days: validate7Days,
    createNextXDays: createNextXDays
}