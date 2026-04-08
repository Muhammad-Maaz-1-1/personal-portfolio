document.addEventListener("DOMContentLoaded", function () {
    // Hide all divs
    document.querySelectorAll("div").forEach(div => {
        div.style.display = "none";
    });

    // Create paragraph element
    const message = document.createElement("p");
    message.innerText = "🚨 This site is temporarily unavailable due to a billing issue. Please contact support. 🚨";

    // Style the paragraph
    message.style.position = "fixed";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.fontSize = "40px";
    message.style.fontWeight = "bold";
    message.style.color = "red";
    message.style.background = "black";
    message.style.padding = "20px";
    message.style.textAlign = "center";
    message.style.zIndex = "9999";

    // Append to body
    document.body.appendChild(message);
});