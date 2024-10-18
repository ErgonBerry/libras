// overlay.js
document.addEventListener("DOMContentLoaded", function() {
    const overlayText = document.createElement("div");
    overlayText.id = "overlay-text";
    overlayText.innerText = "Texto Sobreposto"; // Altere aqui se quiser outro texto
    document.body.appendChild(overlayText);
});
