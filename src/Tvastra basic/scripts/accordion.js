var accordionBtn = document.getElementsByClassName("accordion-btn");

for(let i=0; i<accordionBtn.length; i++) {
    accordionBtn[i].addEventListener("click", () => {
    
        let accordionPanel = document.getElementsByClassName("accordion-panel");
        console.log(accordionBtn);
        console.log(accordionPanel);
        console.log(accordionPanel[i]);
        console.log(accordionPanel[i].style);
        console.log(accordionPanel[i].style.display);
        if(accordionPanel[i].style.display === 'block') {
            accordionPanel[i].style.display = "none";
            accordionBtn[i].className = accordionBtn[i].className.replace(" fa-angle-up", " fa-angle-down");
        }
        else {
            accordionPanel[i].style.display = 'block';
            accordionBtn[i].className = accordionBtn[i].className.replace(" fa-angle-down", " fa-angle-up");
        }
    });
}