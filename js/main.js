const menuBtn = document.getElementById("menuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

if (menuBtn && dropdownMenu) {

    menuBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        dropdownMenu.classList.toggle("show");

    });

    document.addEventListener("click", (e) => {

        if (
            !menuBtn.contains(e.target) &&
            !dropdownMenu.contains(e.target)
        ) {

            dropdownMenu.classList.remove("show");

        }

    });

}

/*====================================
FLOATING SUBSCRIBE BUTTON
====================================*/

const floatingSubscribe = document.getElementById("floatingSubscribe");

if (floatingSubscribe) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 3700) {

            floatingSubscribe.classList.add("hide");

        } else {

            floatingSubscribe.classList.remove("hide");

        }

    });

}

/*====================================
LOADER
====================================*/

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    if (!loader) return;

    setTimeout(function () {

        loader.classList.add("hide");

    }, 600);

});

/*====================================
SCROLL PROGRESS BAR
====================================*/

const progressBar = document.getElementById("scrollProgress");

if(progressBar){

    window.addEventListener("scroll",()=>{

        const scrollTop = window.scrollY;

        const docHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

        const progress =
        (scrollTop / docHeight) * 100;

        progressBar.style.width =
        progress + "%";

    });

}

const subscribeBtn = document.getElementById("subscribeBtn");
const telegramModal = document.getElementById("telegramModal");
const continuePayment = document.getElementById("continuePayment");
const closeModal = document.getElementById("closeModal");

const paymentPage =
"https://superprofile.bio/vig/6a5fc72a0f3a3c0014fc0912";

if (subscribeBtn) {

    subscribeBtn.addEventListener("click", function(e){

        e.preventDefault();

        telegramModal.classList.add("show");

    });

}

continuePayment.addEventListener("click", function(){

    window.location.href = paymentPage;

});

closeModal.addEventListener("click", function(){

    telegramModal.classList.remove("show");

});

telegramModal.addEventListener("click", function(e){

    if(e.target === telegramModal){

        telegramModal.classList.remove("show");

    }

});