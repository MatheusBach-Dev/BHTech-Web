const header = document.getElementById("header");
const headerContainer = document.getElementById("header-container");

function atualizarHeader() {
    const usuarioRolou = window.scrollY > 50;

    if (usuarioRolou) {
        header.classList.add("fixed");
        header.classList.add("rolando");
    } else {
        header.classList.remove("fixed");
        header.classList.remove("rolando");
    }
}

window.addEventListener("scroll", atualizarHeader);
window.addEventListener("resize", atualizarHeader);

atualizarHeader();