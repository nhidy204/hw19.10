window.addEventListener("message", (e) => {
    if (e.data?.type === "LOAD_VIDEO") {
        const video = document.querySelector("video");
        const container = document.querySelector(".container");
        container.classList.remove("hidden");
        video.src = e.data.url;
        video.play();
    }
});