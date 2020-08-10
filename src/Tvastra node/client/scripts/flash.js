let flashMsg = document.querySelector("#flash-msg");
let hideFlash_Icon = document.querySelector("#hide-flash");

console.log(flashMsg);
console.log(hideFlash_Icon);

hideFlash_Icon.addEventListener("click", (e) => {
    flashMsg.style.display = "none";
});