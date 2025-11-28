document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector(".inputText");
    const sendBtn = document.querySelector(".send");
    const beginText = document.querySelector(".start");
    const container = document.querySelector(".container");
    const messagesWrapper = document.createElement("div");
    messagesWrapper.className = "messages";

    container.insertBefore(messagesWrapper, document.querySelector(".inputAdd"));

    function deleteMarkdown(text) {
        if (!text) return "";
        return text.replace(/(\*\*|__|`|~~|\[|])/g, "");
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        beginText.style.display = "none";

        addMessage(deleteMarkdown(text), "user");
        input.value = "";

        const loadingEl = addMessage("Typing...", "bot-loading");
        const reply = await callCohereAPI(text);
        loadingEl.remove();

        addMessage(deleteMarkdown(reply), "bot");
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function addMessage(text, type) {
        const msg = document.createElement("div");

        msg.style.padding = "10px 15px";
        msg.style.maxWidth = "80%";
        msg.style.borderRadius = "10px";
        msg.style.fontSize = "15px";
        msg.style.whiteSpace = "pre-wrap";
        msg.style.fontFamily = "monospace";

        if (type === "user") {
            msg.style.alignSelf = "flex-end";
            msg.style.background = "#008000";
            msg.style.color = "white";
        } else if (type === "bot") {
            msg.style.alignSelf = "flex-start";
            msg.style.background = "#d9d9d9";
            msg.style.color = "#000";
        } else {
            msg.style.alignSelf = "flex-start";
            msg.style.background = "#d9d9d9";
            msg.style.color = "#666";
        }

        msg.textContent = text;
        messagesWrapper.appendChild(msg);
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;

        return msg;
    }

    async function callCohereAPI(userMessage) {
        try {
            const res = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: userMessage})
            });

            const data = await res.json();
            return data.reply;
        } catch (err) {
            console.error(err);
            return "Error connecting to AI.";
        }
    }
});