// Nav bar

var menu = document.getElementById('barIcon');
var nav = document.getElementById('nav-ul');
var exit = document.getElementById('exit-menu');

console.log(menu, nav, exit);

menu.addEventListener('click', function (e) {
    nav.classList.toggle('hide-mobile');
    e.preventDefault();
});

exit.addEventListener('click', function (e) {
    nav.classList.add('hide-mobile');
    e.preventDefault();
});
// Nav bar ends

// How it works images

let step_boxClass = document.getElementsByClassName("step-box");

for(let i=0; i<step_boxClass.length; i++) {
    step_boxClass[i].addEventListener('click', function(e) {
        console.log(this);
        let step_contentClass = document.getElementsByClassName("step-content");
        let currentActiveStepContent = document.getElementsByClassName("active-content");
        let currentActiveStepBox = document.getElementsByClassName("click-box");

        currentActiveStepContent[0].className = currentActiveStepContent[0].className.replace(" active-content", "");
        currentActiveStepBox[0].className = currentActiveStepBox[0].className.replace(" click-box", "");

        step_contentClass[i].className += " active-content";
        step_boxClass[i].className += " click-box";

        //this.classList.toggle('active-content');
        console.log(this.className);
        e.preventDefault();
    });
    
}
//console.log(step_contentClass);

// how it works Ends