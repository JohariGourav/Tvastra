/* ------------------
    TAGIFY controls
----------------------*/

let speciality = document.querySelector("input[name='doctor[speciality]']");
let tagifySpeciality = new Tagify(speciality);
let education = document.querySelector("input[name='doctor[education]']");
let tagifyEducation = new Tagify(education);
let treatments = document.querySelector("input[name='doctor[treatments]']");
let tagifyTreatments = new Tagify(treatments);
let hospitals = document.querySelector("input[name='doctor[hospitals]']");
let tagifyHospitals = new Tagify(hospitals);
let achievements = document.querySelector("input[name='doctor[achievements]']");
let tagifyAchievements = new Tagify(achievements);
let awards = document.querySelector("input[name='doctor[awards]']");
let tagifyAwards = new Tagify(awards);

/*----------------------------
    Edit mobile btn and cross icon click controllers 
---------------------------------*/

let editBtn = document.querySelector("#edit-mobile");
editBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("edit-mobile-container").classList.toggle("hidden-active");
});

// Cross Icons on editMobile & OTP Forms 
let iEditMobile = document.getElementById("hide-edit-mobile");
let iOtpCtr = document.querySelector("#hide-otp-container");

console.log(iEditMobile);
console.log(iOtpCtr);

iEditMobile.addEventListener("click", (e) => {
    document.getElementById("edit-mobile-container").classList.toggle("hidden-active");
});
iOtpCtr.addEventListener("click", (e) => {
    document.getElementById("otp-container").classList.toggle("hidden-active");
});

// Edit mobile form submission
let newMobileBtn = document.querySelector("#new-mobile-btn");
newMobileBtn.addEventListener("click", e => {
    e.preventDefault();

    let newMobile = document.querySelector("#new-mobile");
    console.log("new mobile: ", newMobile);
    console.log("new mobile: ", newMobile.value);

    if(newMobile.value.length != 10) {
        return alert('Please Enter Valid Number');
    }

    axios.post('/edit-mobile/request-otp', {
        mobile: newMobile.value
    })
    .then( response => {
        console.log("response: ",response);
        console.log("data: ", response.data);
        if(response.data == true) {
            document.getElementById("edit-mobile-container").classList.toggle("hidden-active");
            document.getElementById("otp-container").classList.toggle("hidden-active");
            document.getElementsByClassName('flash-container')[0].innerHTML = null;
        }
        else {
            renderFlashResponse(response.data);
        }
        return null;
    })
    .catch( error => {
        console.log(error);
        alert("Server Error, Retry!");
        return null;
    });  
});

/* -----------------------------
    rendering Flash Error Response received from axios request
 ------------------------------*/
function renderFlashResponse(responseData) {
    let parsed = (new DOMParser()).parseFromString(responseData, "text/html");
    // console.log("parsed: ",parsed);
    let flashed = parsed.getElementsByClassName('flash-container')[0].innerHTML;
    // console.log("flash: ",flashed[0]);
    document.getElementsByClassName('flash-container')[0].innerHTML = flashed;
    return null;
}
