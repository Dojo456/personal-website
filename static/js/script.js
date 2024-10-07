// You can add any JavaScript functionality here
console.log("Welcome to my personal website!");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("query");
const searchResults = document.getElementById("search-results");

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        searchForm.classList.add("hidden");
    }
});

document.addEventListener("keydown", function(event) {
    if (event.altKey && event.key === "p") {
        searchForm.classList.remove("hidden");
        searchInput.focus();
    }
});

searchInput.addEventListener("input", function(event) {
    const term = event.target.value;

    console.log(term)

    if (term === "meowmeow") {
        searchResults.innerHTML = "You found me!";
    } else {
        searchResults.innerHTML = ""
    }

});
