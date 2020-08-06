let password= document.getElementById("password");
let eyeSlash= document.getElementById("password-hide");
let eye= document.getElementById("password-show");

 eyeSlash.addEventListener("click", function(){
    eyeSlash.style.display="none";
    eye.style.display="block";
    password.type="text";
 });

 eye.addEventListener("click", function(){
    eye.style.display="none";
    eyeSlash.style.display="block";
    password.type="password";
 });