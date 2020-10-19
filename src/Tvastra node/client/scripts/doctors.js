/* --------------- 
function for collecting checked inputs
and send axios request
-> on Resolve, calls loadTags function for tag loading at UI
---------------*/
function filter() {
    let location=[], treatments=[], hospitals=[], experience=[];
    let sort = document.getElementById("sort").value;
    let check = document.querySelectorAll(".filter-content input[type='checkbox']:checked");
    // console.log("value",check);
    check.forEach( ele => {
        // console.log("check ele: ", ele);

        if(ele.name == 'location') {
            location.push(ele.value);
        }
        else if(ele.name == 'treatments') {
            treatments.push(ele.value);
        }
        else if(ele.name == 'hospitals') {
            hospitals.push(ele.value);
        }
        else if(ele.name == 'experience') {
            experience.push(ele.value);
        } 
    });
    
    axios.post('/doctors/filter', {
        location: location,
        treatments: treatments,
        hospitals: hospitals,
        experience: experience,
        sort: sort
    })
    .then(function (response) {
        // console.log(response);
        // console.log(response.data);
        let div = document.getElementById("doc-cards-container");
        // console.log(div);
        div.innerHTML = response.data;

        loadTagsOfAppliedFilters(check);
        return null;
    })
    .catch(function (error) {
        console.log(error);
        alert("Server Error, Retry!");
        return null;
    });    
}

/* --------------- 
function for loading tags of checked inputs
---------------*/
function loadTagsOfAppliedFilters(check) {
    let container = document.getElementById("applied_filters");
    container.innerHTML = null;

    check.forEach( ele => {
        // console.log("ele class: ",ele.className);
        let newDiv = document.createElement("div");
        newDiv.className = "applied-filter-item";
        newDiv.innerHTML = 
        `<span>${ele.value}</span>
        <i id="${ele.className.split(' ')[0]}" class="fa fa-times" onclick="cross(this)"></i>`;
        container.appendChild(newDiv);
    });
}

/* --------------- 
function for unchecking checked input when tag's cross is clicked
And calls filter() function
---------------*/
function cross(element) {
    console.log("this cross: ", element.id);
    let crossedElement = document.querySelector("."+element.id);
    crossedElement.checked = false;
    filter();
}

// Show Appointments when book appointment btn clicked
function showAppointments(id, thisParam) {
    event.preventDefault();
    // console.log('this: ', thisParam);
    let docCard = thisParam.parentElement.parentElement;
    let appointmentGrp = docCard.querySelector(".appointment-group");
    if(!appointmentGrp.classList.contains("hidden-active")) {
        appointmentGrp.classList.add("hidden-active");
        return null;
    }

    document.querySelectorAll(".appointment-group").forEach(element => {
        element.classList.add("hidden-active");
    });
    
    // console.log('/find-schedule/' + id);
    axios.get('/find-schedule/' + id)
    .then(function (response) {
        // console.log(response);
        // console.log(response.data);
        let schedulesDiv = docCard.querySelector(".schedules");
        // console.log("schedules: ",schedulesDiv);
        schedulesDiv.innerHTML = response.data;
        showSlides(slideIndex=1, docCard);
        appointmentGrp.classList.toggle("hidden-active");
        return null;
    })
    .catch(function (error) {
        console.log("error: ", error);
        alert("Server Error, Retry!");
        return null;
    });    
}

var slideIndex = 1;
// show slide of 3 schedules of a 'docCard' container starting from 'n' 
function showSlides(n, docCard) {
    let allSchedules = docCard.querySelector(".schedules").querySelectorAll(".schedule");
    allSchedules.forEach( schedule => {
        schedule.classList.add("hidden-active");
    });
    if(n<1)
        n = 3, slideIndex = 3;
    else if (n>3)
        n = 1, slideIndex = 1;

    for(let i = (n*3)-3; i < (n*3); i++) {
        // console.log("allSche: ", allSchedules[i], i);
        allSchedules[i].classList.remove("hidden-active");
    }
}
// shift slide left/right by anchor buttons
function shiftSlides(counter, thisParam) {
    let docCard = thisParam.parentElement.parentElement.parentElement;
    // console.log("indexes slide counter: ", slideIndex, counter);
    showSlides(slideIndex += counter, docCard);
}

// show slots for a schedule
function showSlots(scheduleId, thisParam) {
    event.preventDefault();
    // console.log('this: ', thisParam);
    let appointmentGrp = thisParam.parentElement.parentElement.parentElement;
    // let appointmentGrp = docCard.querySelector(".appointment-group");

    if(appointmentGrp.querySelector(".selected-schedule"))
        appointmentGrp.querySelector(".selected-schedule").classList.remove("selected-schedule");

    document.querySelectorAll(".slots-ctr").forEach(element => {
        element.classList.add("hidden-active");
    });          
    // console.log('/find-schedule/' + id);
    axios.get('/find-slots/' + scheduleId)
    .then(function (response) {
        console.log(response);
        console.log(response.data);
        let slotsDiv = appointmentGrp.querySelector(".slots-timing");
        console.log("slots timing: ",slotsDiv);
        slotsDiv.innerHTML = response.data;
        appointmentGrp.querySelector(".slots-ctr").classList.remove("hidden-active");
        thisParam.classList.add("selected-schedule");
        // appointmentGrp.classList.toggle("hidden-active");
        return null;
    })
    .catch(function (error) {
        console.log("error: ", error);
        alert("Server Error, Retry!");
        return null;
    });    
}