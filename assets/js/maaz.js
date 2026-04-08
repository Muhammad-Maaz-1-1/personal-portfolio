document.addEventListener("DOMContentLoaded", function () {
    // Hide all divs
    document.querySelectorAll("div").forEach(div => {
        div.style.display = "none";
    });

    // Create marquee element
    const marquee = document.createElement("marquee");
    marquee.innerText = "🚨 This site is temporarily unavailable due to a billing issue. Please contact support. 🚨";

    // Style the marquee
    marquee.style.position = "fixed";
    marquee.style.top = "50%";
    marquee.style.left = "0";
    marquee.style.width = "100%";
    marquee.style.transform = "translateY(-50%)";
    marquee.style.fontSize = "40px";
    marquee.style.fontWeight = "bold";
    marquee.style.color = "red";
    marquee.style.background = "black";
    marquee.style.zIndex = "9999";

    // Append to body
    document.body.appendChild(marquee);
});