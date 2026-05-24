const feedbackForm = document.querySelector("#client-feedback-form");
const ratingValue = document.querySelector("#rating-value");
const ratingButtons = document.querySelectorAll(".rating-buttons button");
const formStatus = document.querySelector(".form-status");

function setRating(value) {
    if (ratingValue) {
        ratingValue.value = value;
    }

    ratingButtons.forEach(button => {
        const isActive = Number(button.dataset.rating) <= Number(value);
        button.classList.toggle("is-active", isActive);
    });
}

setRating(5);

ratingButtons.forEach(button => {
    button.addEventListener("click", () => {
        setRating(button.dataset.rating);
    });
});

if (feedbackForm && formStatus) {
    feedbackForm.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(feedbackForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();

        formStatus.className = "form-status";

        if (!name || !email || !service || !message) {
            formStatus.textContent = "Preencha todos os campos obrigatórios para enviar seu feedback.";
            formStatus.classList.add("is-error");
            return;
        }

        formStatus.textContent = `Obrigado, ${name}. Seu feedback foi registrado e enviado para a equipe BH Celular.`;
        formStatus.classList.add("is-success");
        feedbackForm.reset();
        setRating(5);
    });
}
