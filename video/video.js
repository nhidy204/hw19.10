const container = document.querySelector(".container");
const video = container.querySelector("video");

const playBtn = container.querySelector(".play-pause");
const playIcon = playBtn.querySelector("i");
const playTooltip = playBtn.querySelector(".tooltip");

const volumeBtn = container.querySelector(".volume i");
const volumeTooltip = container.querySelector(".volume .tooltip");

const fullscreenBtn = container.querySelector(".fullscreen i");
const fullscreenTooltip = container.querySelector(".fullscreen .tooltip");

const skipBackBtn = container.querySelector(".skip-backward");
const skipForBtn = container.querySelector(".skip-forward");
const skipBackTooltip = skipBackBtn.querySelector(".tooltip");
const skipForTooltip = skipForBtn.querySelector(".tooltip");

const pipBtn = container.querySelector(".pic-in-pic");
const playbackBtn = container.querySelector(".playback-speed");
const speedMenu = container.querySelector(".speed-options");

const videoTimeline = container.querySelector(".video-timeline");
const progressBar = container.querySelector(".progress-bar");
const progressArea = container.querySelector(".progress-area");
const hoverTimeEl = progressArea?.querySelector("span");
const currentTimeEl = container.querySelector(".current-time");
const durationEl = container.querySelector(".video-duration");

const centerIcon = document.querySelector(".center-icon");

const volumeSlider = container.querySelector(".option.left input[type='range']");


skipBackTooltip.textContent = "Seek backward";
skipForTooltip.textContent = "Seek forward";

const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
};

video.addEventListener("loadeddata", () => {
    durationEl.textContent = formatTime(video.duration);
});

video.addEventListener("timeupdate", () => {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
});

videoTimeline.addEventListener("mousemove", (e) => {
    const rect = videoTimeline.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const time = percent * video.duration;

    if (hoverTimeEl) {
        hoverTimeEl.textContent = formatTime(time);
        hoverTimeEl.style.left = `${offsetX}px`;
        hoverTimeEl.style.display = "block";
    }
});

videoTimeline.addEventListener("mouseleave", () => {
    if (hoverTimeEl) hoverTimeEl.style.display = "none";
});

videoTimeline.addEventListener("click", (e) => {
    const rect = videoTimeline.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
});

function updatePlayUI() {
    if (video.paused) {
        playIcon.classList.replace("fa-pause", "fa-play");
        playTooltip.textContent = "Play";
    } else {
        playIcon.classList.replace("fa-play", "fa-pause");
        playTooltip.textContent = "Pause";
    }
}

playBtn.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
video.addEventListener("click", () => {
    if (video.paused) {
        video.play();
        flashCenterIcon("play");
    } else {
        video.pause();
        flashCenterIcon("pause");
    }
});

video.addEventListener("play", updatePlayUI);
video.addEventListener("pause", updatePlayUI);

skipBackBtn.addEventListener("click", () => {
    video.currentTime = Math.max(0, video.currentTime - 5);
});
skipForBtn.addEventListener("click", () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
});

const fullscreenButton = fullscreenBtn.parentElement;
fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        container.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        fullscreenBtn.classList.replace("fa-expand", "fa-compress");
        fullscreenTooltip.textContent = "Zoom out";
    } else {
        fullscreenBtn.classList.replace("fa-compress", "fa-expand");
        fullscreenTooltip.textContent = "Zoom in";
    }
    updatePlayUI();
});

if (pipBtn) {
    pipBtn.addEventListener("click", async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.error("PiP error:", err);
        }
    });
}

if (playbackBtn && speedMenu) {
    playbackBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        speedMenu.classList.toggle("show");
    });

    speedMenu.querySelectorAll("li").forEach((option) => {
        option.addEventListener("click", () => {
            speedMenu.querySelector(".active")?.classList.remove("active");
            option.classList.add("active");
            video.playbackRate = parseFloat(option.dataset.speed);
            speedMenu.classList.remove("show");
        });
    });

    document.addEventListener("click", (e) => {
        if (!playbackBtn.contains(e.target) && !speedMenu.contains(e.target)) {
            speedMenu.classList.remove("show");
        }
    });
}

const wrapper = container.querySelector(".wrapper");
let hideControlsTimer = null;

const showControlsSafe = () => {
    container.classList.add("show-controls");
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
        if (!container.matches(":hover") && !(wrapper && wrapper.matches(":hover"))) {
            container.classList.remove("show-controls");
        }
    }, 2000);
};

container.addEventListener("mousemove", showControlsSafe);

container.addEventListener("mouseleave", () => {
    clearTimeout(hideControlsTimer);
    container.classList.remove("show-controls");
});

if (wrapper) {
    wrapper.addEventListener("mouseenter", () => {
        clearTimeout(hideControlsTimer);
        container.classList.add("show-controls");
    });
    wrapper.addEventListener("mouseleave", () => {
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(() => {
            if (!container.matches(":hover") && !(wrapper && wrapper.matches(":hover"))) {
                container.classList.remove("show-controls");
            }
        }, 1000);
    });
}

container.classList.add("show-controls");
clearTimeout(hideControlsTimer);
hideControlsTimer = setTimeout(() => {
    if (!container.matches(":hover")) container.classList.remove("show-controls");
}, 1500);

function flashCenterIcon(type) {
    centerIcon.querySelector("i").className =
        type === "play" ? "fa-solid fa-play" : "fa-solid fa-pause";
    centerIcon.classList.add("show");
    setTimeout(() => centerIcon.classList.remove("show"), 400);
}


let prevVolume = video.volume || 1;

function updateVolumeUI() {
    const v = video.volume;
    if (video.muted || v === 0) {
        volumeBtn.className = "fa-solid fa-volume-xmark";
        volumeTooltip.textContent = "Unmute";
    } else if (v < 0.5) {
        volumeBtn.className = "fa-solid fa-volume-low";
        volumeTooltip.textContent = "Mute";
    } else {
        volumeBtn.className = "fa-solid fa-volume-high";
        volumeTooltip.textContent = "Mute";
    }
    volumeSlider.value = v;
}

volumeBtn.parentElement.addEventListener("click", () => {
    if (video.muted || video.volume === 0) {
        video.muted = false;
        video.volume = prevVolume;
    } else {
        prevVolume = video.volume;
        video.muted = true;
    }
    updateVolumeUI();
});

volumeSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    video.volume = v;
    video.muted = v === 0;
    if (!video.muted) prevVolume = v;
    updateVolumeUI();
});
video.addEventListener("volumechange", updateVolumeUI);
updateVolumeUI();

