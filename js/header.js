const header = document.getElementById("header");
const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("aberto");
    nav.classList.toggle("aberto");
});

nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("aberto");
        nav.classList.remove("aberto");
    });

    if (link.getAttribute("href") === window.location.pathname) {
        link.classList.add("ativo");
    }
});

function atualizarHeader() {
    const usuarioRolou = window.scrollY > 50;
    header.classList.toggle("rolando", usuarioRolou);
    header.classList.toggle("fixed", usuarioRolou);
}

window.addEventListener("scroll", atualizarHeader);
window.addEventListener("resize", atualizarHeader);
atualizarHeader();

// Carrega o miniCart.js se ainda não foi carregado
if (!window.BHMiniCart) {
    const cartScript = document.createElement("script");
    cartScript.src = "/js/miniCart.js";
    document.body.appendChild(cartScript);
}