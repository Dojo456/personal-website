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
        searchInput.value = ""
        searchInput.focus();
    }
});


searchInput.addEventListener("input", function(event) {
    const term = event.target.value;

    fetch(`/search?query=${term}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(result => {
                const li = document.createElement("li");
                li.innerHTML = result.description;
                li.onclick = () => {
                    window.location.href = result.url;
                }
                searchResults.appendChild(li);
            });
        }).catch(error => {
            console.error("Error:", error);
        });
});
