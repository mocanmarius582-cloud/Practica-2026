const btnTheme = document.getElementById("theme-toggle");

btnTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
});

const logoCard = document.querySelector(".logo-card");

document.addEventListener("mousemove", (e) => {

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    const rotateY = ((e.clientX - x) / x) * 20;
    const rotateX = -((e.clientY - y) / y) * 20;

    logoCard.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
    `;
});