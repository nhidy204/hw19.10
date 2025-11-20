document.addEventListener("DOMContentLoaded", () => {
    const qs = (sel, ctx = document) => ctx.querySelector(sel);
    const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const fileInput = qs("#fileInput");

    fileInput?.addEventListener("change", e => processSelectedFile(e.target.files?.[0]));

    const container = qs(".container");
    const video = qs("video", container);
    if (!container || !video) return;

    // main controls button
    const playBtn = qs(".play-pause", container);
    const skipBackBtn = qs(".skip-backward", container);
    const skipForBtn = qs(".skip-forward", container);
    const fullscreenBtn = qs(".fullscreen i", container);
    const pipBtn = qs(".pic-in-pic", container);

    // volume slider + speed 
    const volumeSlider = qs(".option.left input[type='range']", container);
    const playbackBtn = qs(".playback-speed", container);
    const speedMenu = qs(".speed-options", container);

    // Icon & tooltip
    const playIcon = qs(".play-pause i", container);
    const playTooltip = qs(".play-pause .tooltip", container);
    const volumeBtn = qs(".volume i", container);
    const volumeTooltip = qs(".volume .tooltip", container);
    const fullscreenTooltip = qs(".fullscreen .tooltip", container);
    const skipBackTooltip = qs(".skip-backward .tooltip", container);
    const skipForTooltip = qs(".skip-forward .tooltip", container);

    //timeline/video
    const videoTimeline = qs(".video-timeline", container);
    const progressBar = qs(".progress-bar", container);
    const hoverTimeEl = qs(".progress-area span", container);
    const currentTimeEl = qs(".current-time", container);
    const durationEl = qs(".video-duration", container);
    const centerIcon = qs(".center-icon", container);

    //wrapper
    const wrapper = qs(".wrapper", container);


    const formatTime = (t) => {
        if (!isFinite(t)) return "00:00";
        const m = Math.floor(t / 60), s = Math.floor(t % 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    video.addEventListener("loadeddata", () => {
        durationEl.textContent = formatTime(video.duration);
        volumeSlider.value = Math.round(video.volume * 100);
    });

    video.addEventListener("timeupdate", () => {
        const p = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${p}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
    });

    videoTimeline.addEventListener("mousemove", e => {
        const rect = videoTimeline.getBoundingClientRect();
        const offset = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const t = (offset / rect.width) * video.duration;
        Object.assign(hoverTimeEl.style, {left: `${offset}px`, display: "block"});
        hoverTimeEl.textContent = formatTime(t);
    });
    videoTimeline.addEventListener("mouseleave", () => hoverTimeEl.style.display = "none");
    videoTimeline.addEventListener("click", e => {
        const rect = videoTimeline.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });

    const updatePlayUI = () => {
        const isPaused = video.paused;
        playIcon.className = `fa-solid fa-${isPaused ? "play" : "pause"}`;
        playTooltip.textContent = isPaused ? "Play" : "Pause";
    };
    const flashCenterIcon = (type) => {
        const ico = qs("i", centerIcon);
        ico.className = `fa-solid fa-${type}`;
        centerIcon.classList.add("show");
        setTimeout(() => centerIcon.classList.remove("show"), 400);
    };

    playBtn.addEventListener("click", () => video.paused ? video.play() : video.pause());
    video.addEventListener("click", () => {
        video.paused ? video.play() : video.pause();
        flashCenterIcon(video.paused ? "pause" : "play");
    });
    video.addEventListener("play", updatePlayUI);
    video.addEventListener("pause", updatePlayUI);

    skipBackTooltip.textContent = "Seek backward";
    skipForTooltip.textContent = "Seek forward";
    skipBackBtn.addEventListener("click", () => video.currentTime -= 5);
    skipForBtn.addEventListener("click", () => video.currentTime += 5);

    fullscreenBtn.parentElement.addEventListener("click", () =>
        document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen()
    );
    document.addEventListener("fullscreenchange", () => {
        const fs = document.fullscreenElement;
        fullscreenBtn.className = `fa-solid fa-${fs ? "compress" : "expand"}`;
        fullscreenTooltip.textContent = fs ? "Zoom out" : "Zoom in";
    });

    pipBtn?.addEventListener("click", async () => {
        try {
            document.pictureInPictureElement
                ? await document.exitPictureInPicture()
                : await video.requestPictureInPicture();
        } catch (err) {
            console.error("PiP error:", err);
        }
    });

    if (playbackBtn && speedMenu) {
        playbackBtn.addEventListener("click", e => {
            e.stopPropagation();
            speedMenu.classList.toggle("show");
        });
        qsa("li", speedMenu).forEach(opt =>
            opt.addEventListener("click", () => {
                qs(".active", speedMenu)?.classList.remove("active");
                opt.classList.add("active");
                video.playbackRate = parseFloat(opt.dataset.speed) || 1;
                speedMenu.classList.remove("show");
            })
        );
        document.addEventListener("click", e => {
            if (!speedMenu.contains(e.target) && !playbackBtn.contains(e.target))
                speedMenu.classList.remove("show");
        });
    }

    let hideTimer;

    function showControls() {
        container.classList.add("show-controls");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!container.matches(":hover") && !wrapper?.matches(":hover"))
                container.classList.remove("show-controls");
        }, 2000);
    }

    container.addEventListener("mousemove", showControls);
    container.addEventListener("mouseleave", () => {
        clearTimeout(hideTimer);
        container.classList.remove("show-controls");
    });
    wrapper?.addEventListener("mouseenter", showControls);
    wrapper?.addEventListener("mouseleave", showControls);

    let lastVolume = video.volume;

    const updateVolumeUI = () => {
        const v = video.muted ? 0 : video.volume;

        let level;
        if (v === 0) {
            level = "mute";
        } else if (v <= 0.5) {
            level = "low";
        } else {
            level = "high";
        }

        switch (level) {
            case "mute":
                volumeBtn.className = "fa-solid fa-volume-xmark";
                volumeTooltip.textContent = "Unmute";
                break;

            case "low":
                volumeBtn.className = "fa-solid fa-volume-low";
                volumeTooltip.textContent = "Mute";
                break;

            case "high":
                volumeBtn.className = "fa-solid fa-volume-high";
                volumeTooltip.textContent = "Mute";
                break;

            default:
                volumeTooltip.textContent = "Mute";
                break;
        }

        volumeSlider.value = String(Math.round(v * 100));
    };


    volumeBtn?.parentElement?.addEventListener("click", () => {
        if (video.muted || video.volume === 0) {
            video.muted = false;
            video.volume = lastVolume || 1;
        } else {
            lastVolume = video.volume;
            video.muted = true;
        }
        updateVolumeUI();
    });

    volumeSlider?.addEventListener("input", (e) => {
        const v = Math.min(Math.max(e.target.value / 100, 0), 1);
        video.volume = v;
        video.muted = v === 0;
        if (!video.muted) lastVolume = v;
        updateVolumeUI();
    });
    video.addEventListener("volumechange", updateVolumeUI);
    updateVolumeUI();
});
