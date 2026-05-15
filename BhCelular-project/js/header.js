const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){
        header.classList.add("rolando");
    } else {
        header.classList.remove("rolando");
    }

});