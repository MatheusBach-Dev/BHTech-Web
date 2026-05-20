const header = document.getElementById("header");
const headerContainer = document.getElementById("header-container");

function atualizarHeader() {
    const usuarioRolou = window.scrollY > 0;

    if(usuarioRolou){
        header.classList.add("fixed");
        header.classList.add("rolando");

    
        headerContainer.style.height = `${header.offsetHeight}px`;
    } else {
        header.classList.remove("fixed");
        header.classList.remove("rolando");

        headerContainer.style.height = "";
    }
}

window.addEventListener("scroll", atualizarHeader);
window.addEventListener("resize", atualizarHeader);

atualizarHeader();
