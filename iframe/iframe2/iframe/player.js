window.addEventListener("message", (e) => {
    if (e.data?.type === "LOAD_VIDEO") {
        const video = document.querySelector("video");
        const container = document.querySelector(".container");
        container.classList.remove("hidden");
        video.src = e.data.url;
        video.play();
    }
    if (e.data?.type === "SEEK_TO") {
    const video = document.querySelector("video");
    if (video && !isNaN(e.data.time)) {
        video.currentTime = e.data.time;
    }
}

});
window.addEventListener("DOMContentLoaded", () => {
    const video = document.querySelector("video");
    if (!video) return;

    video.addEventListener("play", () => {
        window.parent.postMessage({type: "VIDEO_PLAYING"}, "*");
    });

    video.addEventListener("pause", () => {
        window.parent.postMessage({type: "VIDEO_PAUSING"}, "*");
    });
});

