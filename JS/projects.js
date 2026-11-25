
/* =========================================
   CARATECH STUDIOS
   PROJECTS PAGE FILTERS
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");

    // Check if project elements exist
    if (!filterButtons.length || !projectCards.length) {
        return;
    }


    /* =========================================
       FILTER PROJECTS FUNCTION
    ========================================= */

    function filterProjects(selectedFilter) {

        // Update active filter button
        filterButtons.forEach(button => {

            const isActive =
                button.dataset.filter === selectedFilter;

            button.classList.toggle("active", isActive);

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

        });


        // Show or hide project cards
        projectCards.forEach(card => {

            const category = card.dataset.category;

            const shouldShow =
                selectedFilter === "all" ||
                category === selectedFilter;

            card.classList.toggle("hidden", !shouldShow);

            card.setAttribute(
                "aria-hidden",
                String(!shouldShow)
            );

        });

    }


    /* =========================================
       FILTER BUTTON EVENTS
    ========================================= */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedFilter = button.dataset.filter;

            // Prevent invalid filter values
            if (!selectedFilter) {
                return;
            }

            filterProjects(selectedFilter);

        });

    });


    /* =========================================
       INITIALIZE PROJECT FILTERS
    ========================================= */

    const activeButton =
        document.querySelector(".filter-btn.active");

    const initialFilter =
        activeButton?.dataset.filter || "all";

    filterProjects(initialFilter);


});
