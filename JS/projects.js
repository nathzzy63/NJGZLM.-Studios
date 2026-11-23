
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        const selectedFilter = button.dataset.filter;

        // Update active filter button
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // Filter project cards
        projectCards.forEach(card => {

            const category = card.dataset.category;

            if (
                selectedFilter === "all" ||
                category === selectedFilter
            ) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }

        });

    });
});
