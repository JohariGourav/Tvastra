
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