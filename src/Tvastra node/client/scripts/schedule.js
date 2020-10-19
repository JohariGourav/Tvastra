/*----------------------------
    Edit mobile btn and cross icon click controllers 
---------------------------------*/
let iHideForm = document.getElementById("hide-schedule-form");
iHideForm.addEventListener("click", (e) => {
    document.getElementById("schedule-form-container").classList.add("hidden-active");
});
let showFormBtn = document.getElementById("show-form-btn");
showFormBtn.addEventListener("click", (e) => {
    document.getElementById("schedule-form-container").classList.remove("hidden-active");
});

// View Slots show & hide buttons
let viewSlotsBtns = document.querySelectorAll(".view-slots-btn");
console.log('btns: ', viewSlotsBtns.length);
for (let i = 0; i < viewSlotsBtns.length; i++) {
    console.log('btns: ', 'for durn', viewSlotsBtns[i]);
    viewSlotsBtns[i].addEventListener("click", function (e) {
        e.preventDefault();
        console.log('this: ', this);
        let slotsContainers = document.getElementsByClassName("slots-container");
        slotsContainers[i].classList.toggle("hidden-active");
    });
}

/*----------------------------
    Remove Schedule
---------------------------------*/
function removeSchedule(id) {
    axios({
        method: 'DELETE',
        url: '/remove-schedule',
        data: { id: id }
    })
    .then(function (response) {
        // console.log(response);
        console.log(response.data);
        return window.location.reload(true);
    })
    .catch(function (error) {
        console.log(error);
        alert("Server Error, Retry!");
        return null;
    });
}

/*----------------------------
    Change Slot Status
---------------------------------*/
function changeSlotStatus(id, currentElement) {
    // console.log("event: ", event);
    // console.log("this: ", currentElement);
    event.preventDefault();
    axios({
        method: 'PUT',
        url: '/change-slot-status',
        data: { id: id }
    })
    .then(function (response) {
        // console.log(response);
        // console.log(response.data);
        let status = response.data.status;
        if (status == 'Available') {
            currentElement.checked = false;
            currentElement.parentElement.setAttribute('data-status', 'Available');
            // console.log("changed this: ", currentElement);
            // console.log("parent this: ", currentElement.parentElement.dataStatus);
        }
        if (status == 'Busy') {
            currentElement.checked = true;
            currentElement.parentElement.setAttribute('data-status', 'Busy');
            // console.log("changed this: ", currentElement);
            // console.log("parent this: ", currentElement.parentElement.dataStatus);
        }
        return null;
    })
    .catch(function (error) {
        console.log("catch error: ", error);
        alert("Server Error, Retry!");
        return null;
    });
}