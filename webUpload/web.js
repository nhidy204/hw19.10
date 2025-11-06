document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const chooseBtn = document.getElementById("chooseBtn");
    const uploadBtn = document.getElementById("uploadBtn");
    const thumbnail = document.getElementById("thumbnail");
    const uploadStatus = document.getElementById("uploadStatus");
    const dropZone = document.getElementById("dropZone");

    if (chooseBtn) chooseBtn.addEventListener("click", () => fileInput && fileInput.click());

    if (uploadBtn) uploadBtn.disabled = true;
    if (thumbnail) thumbnail.hidden = true;

    let selectedFile = null;

    function processSelectedFile(file) {
        if (!file) return;
        selectedFile = file;
        if (uploadBtn) uploadBtn.disabled = false;

        // creat video tạm để capture thumbnail
        const tmpVideo = document.createElement("video");
        tmpVideo.preload = "metadata";
        tmpVideo.muted = true;
        tmpVideo.playsInline = true;
        tmpVideo.style.position = "fixed";
        tmpVideo.style.left = "-9999px";
        document.body.appendChild(tmpVideo);

        const tmpUrl = URL.createObjectURL(file);
        tmpVideo.src = tmpUrl;

        const FALLBACK_MS = 2000;
        let fallbackTimer = null;
        const cleanup = () => {
            try {
                URL.revokeObjectURL(tmpUrl);
            } catch (e) {
            }
            clearTimeout(fallbackTimer);
            tmpVideo.remove();
        };

        function captureFrame() {
            try {
                const w = Math.max(160, (tmpVideo.videoWidth >> 2) || 160);
                const h = Math.max(90, (tmpVideo.videoHeight >> 2) || 90);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(tmpVideo, 0, 0, w, h);
                if (thumbnail) {
                    thumbnail.src = canvas.toDataURL("image/png");
                    thumbnail.hidden = false;
                }
            } catch (err) {
                console.warn("Thumbnail generation failed", err);
                if (thumbnail) thumbnail.hidden = true;
            } finally {
                cleanup();
            }
        }

        function onLoadedMeta() {
            const duration = tmpVideo.duration || 0;
            let seekTime = 0.5;
            if (duration > 1) seekTime = Math.min(0.5, duration * 0.1);
            if (seekTime <= 0) seekTime = 0.1;

            tmpVideo.addEventListener("seeked", function onSeeked() {
                tmpVideo.removeEventListener("seeked", onSeeked);
                captureFrame();
            }, {once: true});

            try {
                tmpVideo.currentTime = seekTime;
            } catch (err) {
                setTimeout(captureFrame, 250);
            }
            fallbackTimer = setTimeout(captureFrame, FALLBACK_MS);
        }

        tmpVideo.addEventListener("loadedmetadata", onLoadedMeta, {once: true});
        tmpVideo.addEventListener("loadeddata", onLoadedMeta, {once: true});
        tmpVideo.addEventListener("error", (err) => {
            console.warn("tmpVideo error", err);
            cleanup();
            if (thumbnail) thumbnail.hidden = true;
        }, {once: true});
    }

    if (fileInput) fileInput.addEventListener("change", (e) => processSelectedFile(e.target.files && e.target.files[0]));
    if (dropZone) {
        ["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
            dropZone.addEventListener(evt, (e) => e.preventDefault());
        });

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });
        dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) processSelectedFile(f);
        });

        dropZone.addEventListener("click", () => fileInput && fileInput.click());
    }

    function revealAndLoad(url) {
        const container = document.querySelector(".container");
        const videoEl = container?.querySelector("video");
        if (!container || !videoEl) return;
        container.classList.remove("hidden");
        container.classList.add("show-controls", "show-player");
        videoEl.pause();
        if (videoEl.src !== url) {
            videoEl.src = url;
            videoEl.load();
        }
        videoEl.play().catch(() => {
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            if (!selectedFile) {
                if (uploadStatus) uploadStatus.textContent = "Pick file first!";
                return;
            }
            const localUrl = URL.createObjectURL(selectedFile);
            revealAndLoad(localUrl);
        });
    }

    const container = document.querySelector(".container");
    const video = container.querySelector("video");
    if (!container || !video) return;

    const playBtn = container.querySelector(".play-pause");
    const playIcon = playBtn?.querySelector("i");
    const playTooltip = playBtn?.querySelector(".tooltip");

    const volumeBtn = container.querySelector(".volume i");
    const volumeTooltip = container.querySelector(".volume .tooltip");
    const volumeSlider = container.querySelector(".option.left input[type='range']");
    const volumeBtnIcon = container.querySelector(".volume i"); // icon
    const volumeBtnWrapper = volumeBtnIcon?.parentElement; // nút chứa icon
    const volumeTooltipEl = container.querySelector(".volume .tooltip");
    const volumeSliderEl = container.querySelector(".option.left input[type='range']");

    const fullscreenBtn = container.querySelector(".fullscreen i");
    const fullscreenTooltip = container.querySelector(".fullscreen .tooltip");

    const skipBackBtn = container.querySelector(".skip-backward");
    const skipForBtn = container.querySelector(".skip-forward");
    const skipBackTooltip = skipBackBtn?.querySelector(".tooltip");
    const skipForTooltip = skipForBtn?.querySelector(".tooltip");

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
    const wrapper = container.querySelector(".wrapper");

    let hideControlsTimer = null;

    if (skipBackTooltip) skipBackTooltip.textContent = "Seek backward";
    if (skipForTooltip) skipForTooltip.textContent = "Seek forward";

    const formatTime = (t) => {
        if (!isFinite(t) || t <= 0) return "00:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    };

    video.addEventListener("loadeddata", () => {
        if (durationEl) durationEl.textContent = formatTime(video.duration);
        if (volumeSlider) volumeSlider.value = Math.round((video.volume ?? 1) * 100);
    });

    video.addEventListener("timeupdate", () => {
        if (video.duration && progressBar) {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percent}%`;
        }
        if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
    });

    videoTimeline?.addEventListener("mousemove", (e) => {
        const rect = videoTimeline.getBoundingClientRect();
        const offsetX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const percent = offsetX / rect.width;
        const time = percent * (video.duration || 0);
        if (hoverTimeEl) {
            hoverTimeEl.textContent = formatTime(time);
            hoverTimeEl.style.left = `${offsetX}px`;
            hoverTimeEl.style.display = "block";
        }
    });
    videoTimeline?.addEventListener("mouseleave", () => {
        if (hoverTimeEl) hoverTimeEl.style.display = "none";
    });
    videoTimeline?.addEventListener("click", (e) => {
        if (!video.duration) return;
        const rect = videoTimeline.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        video.currentTime = percent * video.duration;
    });

    function updatePlayUI() {
        if (!playIcon) return;
        if (video.paused) {
            playIcon.classList.replace("fa-pause", "fa-play");
            playTooltip && (playTooltip.textContent = "Play");
        } else {
            playIcon.classList.replace("fa-play", "fa-pause");
            playTooltip && (playTooltip.textContent = "Pause");
        }
    }

    playBtn?.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
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

    skipBackBtn?.addEventListener("click", () => {
        video.currentTime = Math.max(0, video.currentTime - 5);
    });
    skipForBtn?.addEventListener("click", () => {
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
    });

    const fullscreenButton = fullscreenBtn?.parentElement;
    fullscreenButton?.addEventListener("click", () => {
        if (!document.fullscreenElement) container.requestFullscreen();
        else document.exitFullscreen();
    });

    document.addEventListener("fullscreenchange", () => {
        if (!fullscreenBtn) return;
        if (document.fullscreenElement) {
            fullscreenBtn.classList.replace("fa-expand", "fa-compress");
            fullscreenTooltip && (fullscreenTooltip.textContent = "Zoom out");
        } else {
            fullscreenBtn.classList.replace("fa-compress", "fa-expand");
            fullscreenTooltip && (fullscreenTooltip.textContent = "Zoom in");
        }
        updatePlayUI();
    });

    if (pipBtn) {
        pipBtn.addEventListener("click", async () => {
            try {
                if (document.pictureInPictureElement) await document.exitPictureInPicture();
                else await video.requestPictureInPicture();
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
                video.playbackRate = parseFloat(option.dataset.speed) || 1;
                speedMenu.classList.remove("show");
            });
        });
        document.addEventListener("click", (e) => {
            if (!playbackBtn.contains(e.target) && !speedMenu.contains(e.target)) speedMenu.classList.remove("show");
        });
    }

    const showControlsSafe = () => {
        container.classList.add("show-controls");
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(() => {
            if (!container.matches(":hover") && !(wrapper && wrapper.matches(":hover"))) container.classList.remove("show-controls");
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
                if (!container.matches(":hover") && !(wrapper && wrapper.matches(":hover"))) container.classList.remove("show-controls");
            }, 1000);
        });
    }

    container.classList.add("show-controls");
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
        if (!container.matches(":hover")) container.classList.remove("show-controls");
    }, 1500);

    function flashCenterIcon(type) {
        const ico = centerIcon?.querySelector("i");
        if (!ico) return;
        ico.className = type === "play" ? "fa-solid fa-play" : "fa-solid fa-pause";
        centerIcon.classList.add("show");
        setTimeout(() => centerIcon.classList.remove("show"), 400);
    }

    if (volumeBtnIcon && volumeBtnWrapper && volumeSliderEl) {

        volumeSliderEl.min = volumeSliderEl.min || 0;
        volumeSliderEl.max = volumeSliderEl.max || 100;
        volumeSliderEl.step = volumeSliderEl.step || 1;

        let lastVolume = Number.isFinite(video.volume) ? video.volume : 1;

        function updateVolumeUI() {
            const v = Number(video.volume ?? 1);
            volumeBtnIcon.classList.remove("fa-volume-xmark", "fa-volume-low", "fa-volume-high");
            if (video.muted || v === 0) {
                volumeBtnIcon.classList.add("fa-volume-xmark");
                volumeTooltipEl && (volumeTooltipEl.textContent = "Unmute");
            } else if (v <= 0.5) {
                volumeBtnIcon.classList.add("fa-volume-low");
                volumeTooltipEl && (volumeTooltipEl.textContent = "Mute");
            } else {
                volumeBtnIcon.classList.add("fa-volume-high");
                volumeTooltipEl && (volumeTooltipEl.textContent = "Mute");
            }
            volumeSliderEl.value = Math.round(v * 100);
        }

        volumeBtnWrapper.addEventListener("click", () => {
            if (video.muted || video.volume === 0) {
                video.muted = false;
                video.volume = lastVolume > 0 ? lastVolume : 1;
            } else {
                lastVolume = video.volume;
                video.muted = true;
            }
            updateVolumeUI();
        });

        volumeSliderEl.addEventListener("input", (e) => {
            const raw = Number(e.target.value);
            const norm = Math.min(Math.max(raw / 100, 0), 1);
            video.volume = norm;
            video.muted = norm === 0;
            if (!video.muted) lastVolume = norm;
            updateVolumeUI();
        });

        video.addEventListener("volumechange", updateVolumeUI);

        updateVolumeUI();
    } else {
        console.warn("error");
    }

let lastVolume = 1; // Lưu mức volume trước khi mute

// Khi kéo thanh volume
volumeSlider.addEventListener("input", () => {
  const volumeValue = volumeSlider.value / 100;
  video.volume = volumeValue;
  video.muted = volumeValue === 0;

  if (!video.muted) lastVolume = volumeValue;
  updateVolumeIcon();
});

// Khi bấm nút mute/unmute
volumeBtn.addEventListener("click", () => {
  if (video.muted) {
    // UNMUTE → trả về mức cũ
    video.muted = false;
    video.volume = lastVolume;
    volumeSlider.value = lastVolume * 100;
  } else {
    // MUTE → nhớ lại mức cũ rồi tắt tiếng
    lastVolume = video.volume;
    video.muted = true;
    volumeSlider.value = 0;
  }
  updateVolumeIcon();
});

// Cập nhật icon theo trạng thái
function updateVolumeIcon() {
  if (video.muted || video.volume === 0) {
    volumeBtn.className = "fa-solid fa-volume-xmark";
  } else if (video.volume < 0.5) {
    volumeBtn.className = "fa-solid fa-volume-low";
  } else {
    volumeBtn.className = "fa-solid fa-volume-high";
  }
}


});