emailjs.init({
    publicKey: "n-Rb-rryzLQR-2vwQ"
})

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
    feedbackForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(feedbackForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const service = String(formData.get("service") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const recommended = formData.get("recommend") ? "Recomendaria com certeza": "Não recomendaria";
        const rating = Number(ratingValue.value)
        const ratingStars = "★".repeat(rating) + "☆".repeat(5 - rating);

        formStatus.className = "form-status";

        if (!name || !email || !service || !message) {
            formStatus.textContent = "Preencha todos os campos obrigatórios para enviar seu feedback.";
            formStatus.classList.add("is-error");
            return;
        }
        const data = {
            to_email: email,
            from_name: name,
            subject: service,
            message: message,
            rating: rating,
            recommend: recommended,
            rating_stars: ratingStars
        };
        try {
            await emailjs.send("service_7f3g7px", "template_d5v69zu", data);
            formStatus.textContent = `Obrigado, ${name}. Seu feedback foi registrado para a equipe BH Tech.`;
            feedbackForm.reset();
            setRating(5);
        } catch(error) {
            formStatus.textContent = "Erro ao enviar. Tente novamente.";
            console.error(error);
            setRating(5);
        }
    });
}



