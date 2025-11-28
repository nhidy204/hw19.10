document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector(".inputText");
    const sendBtn = document.querySelector(".send");
    const beginText = document.querySelector(".start");
    const messagesWrapper = document.querySelector(".messages");
    const convoListEl = document.getElementById("convoList");
    const newChatBtn = document.getElementById("newChatBtn");

    let currentConvo = null;
    let conversations = [];
    let newChatCount = 1;

    sendBtn.disabled = true;

    function deleteMarkdown(text) {
        if (!text) return "";
        return text.replace(/(\*\*|__|`|~~|\[|\])/g, "");
    }

    async function loadConversations() {
        const res = await fetch("http://localhost:4000/api/conversations");
        conversations = await res.json();
        renderConvoList();

        const savedId = localStorage.getItem("currentConvoId");
        if (savedId && conversations.find(c => c.id === savedId)) {
            await loadConversation(savedId);
        } else if (!currentConvo && conversations.length > 0) {
            await loadConversation(conversations[0].id);
        }
        sendBtn.disabled = false;
    }

    function renderConvoList() {
        convoListEl.innerHTML = "";
        conversations.forEach(c => {
            const li = document.createElement("li");
            li.className = currentConvo?.id === c.id ? "active" : "";

            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.alignItems = "center";

            const delBtn = document.createElement("button");
            delBtn.textContent = "X";
            delBtn.className = "deleteConvoBtn";
            delBtn.style.color = "white";
            delBtn.style.background = "red";
            delBtn.style.border = "none";
            delBtn.style.borderRadius = "50%";
            delBtn.style.width = "20px";
            delBtn.style.height = "20px";
            delBtn.style.cursor = "pointer";
            delBtn.style.marginRight = "5px";
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                await fetch(`http://localhost:4000/api/conversations/${c.id}`, {method: "DELETE"});
                conversations = conversations.filter(cv => cv.id !== c.id);
                if (currentConvo?.id === c.id) {
                    currentConvo = null;
                    messagesWrapper.innerHTML = "";
                    beginText.style.display = "block";
                    localStorage.removeItem("currentConvoId");
                }
                renderConvoList();
            };

            const titleSpan = document.createElement("span");
            titleSpan.textContent = deleteMarkdown(c.title);
            titleSpan.style.flex = "1";
            titleSpan.style.cursor = "pointer";
            titleSpan.onclick = () => loadConversation(c.id);

            container.appendChild(delBtn);
            container.appendChild(titleSpan);
            li.appendChild(container);
            convoListEl.appendChild(li);
        });
    }

    async function loadConversation(id) {
        const res = await fetch(`http://localhost:4000/api/conversations/${id}`);
        currentConvo = await res.json();
        localStorage.setItem("currentConvoId", currentConvo.id);
        renderMessages();
        renderConvoList();
    }

    function renderMessages() {
        messagesWrapper.innerHTML = "";
        if (!currentConvo) return;
        currentConvo.messages.forEach(m => addMessage(deleteMarkdown(m.text), m.role));
        beginText.style.display = currentConvo.messages.length === 0 ? "block" : "none";
    }

    function addMessage(text, role) {
        const msg = document.createElement("div");
        msg.textContent = text;
        msg.className = role;
        messagesWrapper.appendChild(msg);
        messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
        return msg;
    }

    async function sendMessage() {
        if (!currentConvo) return;
        const text = input.value.trim();
        if (!text) return;

        beginText.style.display = "none";
        addMessage(deleteMarkdown(text), "user");
        currentConvo.messages.push({role: "user", text});
        input.value = "";

        if (currentConvo.title.startsWith("New Chat") && currentConvo.messages.length === 1) {
            const newTitle = deleteMarkdown(text.length > 30 ? text.slice(0, 30) + "…" : text);
            currentConvo.title = newTitle;
            await fetch(`http://localhost:4000/api/conversations/${currentConvo.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: newTitle})
            });
        }

        renderConvoList();

        const loadingEl = addMessage("Typing...", "bot-loading");

        try {
            const res = await fetch(`http://localhost:4000/api/conversations/${currentConvo.id}/messages`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: text})
            });
            const data = await res.json();
            loadingEl.remove();
            const botReply = deleteMarkdown(data.reply);
            addMessage(botReply, "bot");
            currentConvo.messages.push({role: "bot", text: botReply});
        } catch (err) {
            console.error(err);
            loadingEl.remove();
            addMessage("Error connecting to AI.", "bot");
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });

    newChatBtn.addEventListener("click", async () => {
        const title = `New Chat ${newChatCount++}`;
        const res = await fetch("http://localhost:4000/api/conversations", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title})
        });
        const newConvo = await res.json();
        conversations.push(newConvo);
        renderConvoList();
    });

    loadConversations();
});