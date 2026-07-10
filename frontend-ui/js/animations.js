// ================= PAGE ANIMATIONS =================


document.addEventListener("DOMContentLoaded", () => {


    const cards = document.querySelectorAll(".card, .agent-card, .priority-card, .rag-card, .practice-card, .activity-card, .recommendations-card");


    cards.forEach((card, index) => {


        card.style.opacity = "0";

        card.style.transform = "translateY(30px)";


        setTimeout(() => {


            card.style.transition =
            "all 0.6s ease";


            card.style.opacity = "1";


            card.style.transform =
            "translateY(0)";


        }, index * 100);



    });



});


// ================= PROGRESS ANIMATION =================


document.addEventListener("DOMContentLoaded", () => {


    const progressBars =
    document.querySelectorAll(".progress-fill");


    progressBars.forEach(bar => {


        const target =
        bar.style.width;


        bar.style.width = "0%";


        setTimeout(() => {


            bar.style.transition =
            "width 1.5s ease";


            bar.style.width =
            target;


        },500);



    });


});


// ================= COUNTER ANIMATION =================

document.addEventListener("DOMContentLoaded", () => {

    const counters = document.querySelectorAll(".counter");


    counters.forEach(counter => {

        const target = Number(counter.dataset.target);

        let count = 0;


        const updateCounter = () => {

            const increment = Math.ceil(target / 60);

            count += increment;


            if(count < target){

                counter.innerText = count;

                requestAnimationFrame(updateCounter);

            } else {

                counter.innerText = target;

            }

        };


        updateCounter();

    });

});