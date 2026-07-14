/*====================================
HERO PARALLAX
====================================*/

const heroImage = document.querySelector(".hero-image");

if (heroImage) {

    window.addEventListener("scroll", () => {

        const scroll = window.scrollY;

        heroImage.style.transform = `translateY(${scroll * 0.45}px)`;

    });

}

/*====================================
SCROLL REVEAL
====================================*/

const reveals = document.querySelectorAll(".reveal");

function revealSections() {

    reveals.forEach(section => {

        const top = section.getBoundingClientRect().top;

        const trigger = window.innerHeight * 0.85;

        if (top < trigger) {

            section.classList.add("active");

        }

    });

}

window.addEventListener("scroll", revealSections);

revealSections();

/*====================================
HIDE NAVBAR ON SCROLL
====================================*/

const header = document.getElementById("header");

if (header) {

    let lastScroll = 0;

    window.addEventListener("scroll", () => {

        const currentScroll = window.pageYOffset;

        if (currentScroll <= 200) {

            header.classList.remove("hide");

            lastScroll = currentScroll;

            return;

        }

        if (currentScroll > lastScroll) {

            header.classList.add("hide");

        } else {

            header.classList.remove("hide");

        }

        lastScroll = currentScroll;

    });

}