const applyFiltersBtn = document.querySelector(".js-apply-filters");
applyFiltersBtn.addEventListener("click", applyFilters);

function applyFilters() {
  new IndexPage().updateRestaurants();
  resetFocusToFiltersContainer();
}

function resetFocusToFiltersContainer() {
  const filtersContainer = document.getElementById("filters");
  filtersContainer.focus();
}
