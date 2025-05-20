fetch("assets/json/projects.json")
    .then(res => res.json())
    .then(data => {
        const container = document.querySelector(".swiper-wrapper");
        // Inject projects dynamically
        data.forEach(proj => {
            const div = document.createElement("div");
            div.className = "projectContent swiper-slide";
            div.innerHTML = `
                <img src="${proj.img}" alt="project image" class="projectImage"/>
                <div>
                  <span class="projectSubtitle">${proj.subtitle}</span>
                  <h1 class="projectTitle">${proj.title}</h1>
                  <a href="${proj.link}" target="_blank" class="projectButton">
                    ${proj.linkText} <i class="ri-arrow-right-line"></i>
                  </a>
                </div>`;
            container.appendChild(div);
        });

        // Initialize Swiper after content is loaded
        setTimeout(() => {
            const swiper = new Swiper('.swiper', {
                loop: true, // Enable looping of slides
                slidesPerView: 2, // Default slides per view
                spaceBetween: 30,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets', // Use bullets for pagination (dots)
                    clickable: true,
                    dynamicBullets: true, // Use dynamic bullets to reduce extra dots
                },
                breakpoints: {
                    340: {
                        slidesPerView: 1, // For small screens (max-width: 340px)
                        spaceBetween: 10,
                    },
                    576: {
                        slidesPerView: 1, // For medium devices (min-width: 576px)
                        spaceBetween: 20,
                    },
                    767: {
                        slidesPerView: 1, // For large medium devices (min-width: 767px)
                        spaceBetween: 30,
                    },
                    1023: {
                        slidesPerView: 2, // For large devices (min-width: 1023px)
                        spaceBetween: 30,
                    },
                    1200: {
                        slidesPerView: 2, // For extra-large devices (min-width: 1200px)
                        spaceBetween: 30,
                    },
                },
            });

            // Update Swiper (important to call after DOM is updated)
            swiper.update();
        }, 100);

    })
    .catch(err => console.error("Failed to load projects:", err));
