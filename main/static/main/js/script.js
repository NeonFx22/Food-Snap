function display_more() {
    const moreResults = document.getElementById("more-results");
    if (!moreResults) return;
    moreResults.style.display = moreResults.style.display === "none" ? "block" : "none";
}

// Live-preview the selected file before the form is submitted.
document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector('input[type="file"]');
    if (!input) return;

    input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;

        let preview = document.querySelector(".preview-area img");
        if (!preview) {
            const container = document.createElement("div");
            container.className = "preview-area";
            preview = document.createElement("img");
            container.appendChild(preview);
            input.closest("form").insertAdjacentElement("afterend", container);
        }

        const reader = new FileReader();
        reader.onload = (e) => { preview.src = e.target.result; };
        reader.readAsDataURL(file);
    });

    // Show a loading spinner while the photo is being matched.
    const form = document.getElementById("upload-form");
    if (!form) return;
    form.addEventListener("submit", () => {
        const spinner = document.getElementById("loading-spinner");
        const button = document.getElementById("submit-button");
        if (spinner) spinner.style.display = "block";
        if (button) button.disabled = true;
    });
});
