document.addEventListener("DOMContentLoaded", () => {
    const qs = (s, c = document) => c.querySelector(s);
    const fileInput = qs("#fileInput");
    const chooseBtn = qs("#chooseBtn");
    const uploadBtn = qs("#uploadBtn");
    const thumbnail = qs("#thumbnail");
    const uploadStatus = qs("#uploadStatus");
    const dropZone = qs("#dropZone");
    const iframe = qs("#playerFrame");
    let selectedFile = null;

    // Upload & Preview 
    chooseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        fileInput.value = "";
        fileInput.click();
    });


    const processFile = (file) => {
        if (!file) return;
        selectedFile = file;
        uploadBtn.disabled = false;

        const tmpUrl = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.src = tmpUrl;
        video.style.position = "fixed";
        video.style.left = "-9999px";
        document.body.appendChild(video);

        const cleanup = () => {
            try {
                URL.revokeObjectURL(tmpUrl);
            } catch (e) {
            }
            video.remove();
        };

        const FALLBACK_MS = 4000;
        let fallbackTimer = setTimeout(() => {
            thumbnail.hidden = true;
            cleanup();
        }, FALLBACK_MS);

        const capture = () => {
            try {
                const w = video.videoWidth > 0 ? video.videoWidth : 160;
                const h = video.videoHeight > 0 ? video.videoHeight : Math.round(w * 9 / 16);
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(160, Math.floor(w / 4));
                canvas.height = Math.max(90, Math.floor(h / 4));
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                thumbnail.src = canvas.toDataURL("image/png");
                thumbnail.hidden = false;
            } catch (err) {
                console.warn("captureFrame error", err);
                thumbnail.hidden = true;
            } finally {
                clearTimeout(fallbackTimer);
                cleanup();
            }
        };

        const onLoadedMeta = () => {
            const duration = video.duration || 0;
            let seekTime = 0.1;
            if (duration > 1) seekTime = Math.min(0.5, duration * 0.1);
            const onSeeked = () => {
                video.removeEventListener("seeked", onSeeked);
                if (video.videoWidth && video.videoHeight) capture();
                else {
                    video.addEventListener("canplay", function once() {
                        capture();
                    }, {once: true});
                }
            };
            video.addEventListener("seeked", onSeeked, {once: true});
            try {
                video.currentTime = seekTime;
            } catch (e) {
                video.addEventListener("loadeddata", () => capture(), {once: true});
            }
        };
        video.addEventListener("loadedmetadata", onLoadedMeta, {once: true});
        video.addEventListener("loadeddata", () => {
            if (thumbnail.hidden) {
                setTimeout(() => {
                    if (thumbnail.hidden) capture();
                }, 150);
            }
        }, {once: true});

        video.addEventListener("error", (e) => {
            console.warn("tmpVideo error", e);
            clearTimeout(fallbackTimer);
            thumbnail.hidden = true;
            cleanup();
        }, {once: true});
    };

    fileInput.addEventListener("change", (e) => processFile(e.target.files[0]));

    ["dragenter", "dragover", "dragleave", "drop"].forEach(evt =>
        dropZone.addEventListener(evt, e => e.preventDefault())
    );
    dropZone.addEventListener("drop", (e) => {
        const f = e.dataTransfer.files[0];
        if (f) processFile(f);
    });
    dropZone.addEventListener("click", () => fileInput.click());

    // post to iframe
    uploadBtn.addEventListener("click", () => {
        if (!selectedFile) return (uploadStatus.textContent = "Chưa chọn file!");
        const fileUrl = URL.createObjectURL(selectedFile);
        uploadStatus.textContent = "Đang phát video...";
        iframe.contentWindow.postMessage({type: "LOAD_VIDEO", url: fileUrl}, "*");
    });
});