document.addEventListener("DOMContentLoaded", function () {
    const notice = document.createElement("div");
    notice.style.position = "fixed";
    notice.style.top = "0";
    notice.style.left = "0";
    notice.style.width = "100%";
    notice.style.padding = "15px";
    notice.style.background = "#222";
    notice.style.color = "#fff";
    notice.style.textAlign = "center";
    notice.style.zIndex = "9999";
    notice.innerText = "This site is temporarily unavailable due to a billing issue. Please contact support.";

    document.body.prepend(notice);
});