import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import {v4 as uuidv4} from "uuid";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "conversations.json";

let conversations = [];
try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    conversations = JSON.parse(data);
} catch (err) {
    conversations = [];
}

function saveConversations() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(conversations, null, 2));
}

app.get("/api/conversations", (res) => {
    res.json(conversations.map(c => ({id: c.id, title: c.title})));
});

app.post("/api/conversations", (req, res) => {
    const id = uuidv4();
    const newConvo = {id, title: req.body.title || "New Chat", messages: []};
    conversations.push(newConvo);
    saveConversations();
    res.json(newConvo);
});

app.get("/api/conversations/:id", (req, res) => {
    const convo = conversations.find(c => c.id === req.params.id);
    if (!convo) return res.status(404).json({error: "Not found"});
    res.json(convo);
});

app.post("/api/conversations/:id/messages", async (req, res) => {
    const convo = conversations.find(c => c.id === req.params.id);
    if (!convo) return res.status(404).json({error: "Not found"});

    const {message} = req.body;
    convo.messages.push({role: "user", text: message});

    try {
        const response = await fetch("https://api.cohere.com/v2/chat", {
            method: "POST",
            headers: {
                "Authorization": "Bearer T5v8y6pNgRUw1SA6VwG3NkmxKJ67B0YuwS8vDwWW",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "command-a-03-2025",
                messages: [
                    {role: "system", content: "You respond concisely."},
                    ...convo.messages.map(m => ({
                        role: m.role === "user" ? "user" : "assistant",
                        content: m.text
                    }))
                ]
            })
        });

        const data = await response.json();
        const botReply = data.message?.content?.[0]?.text || data.output_text || "No reply";

        convo.messages.push({role: "bot", text: botReply});
        saveConversations();
        res.json({reply: botReply});

    } catch (err) {
        console.error(err);
        const botReply = "Sorry, AI not available.";
        convo.messages.push({role: "bot", text: botReply});
        saveConversations();
        res.json({reply: botReply});
    }
});

app.patch("/api/conversations/:id", (req, res) => {
    const convo = conversations.find(c => c.id === req.params.id);
    if (!convo) return res.status(404).json({error: "Not found"});
    convo.title = req.body.title || convo.title;
    saveConversations();
    res.json(convo);
});

app.delete("/api/conversations/:id", (req, res) => {
    const index = conversations.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({error: "Not found"});
    conversations.splice(index, 1);
    saveConversations();
    res.json({success: true});
});

app.delete("/api/conversations/:id/messages", (req, res) => {
    const convo = conversations.find(c => c.id === req.params.id);
    if (!convo) return res.status(404).json({error: "Not found"});
    convo.messages = [];
    saveConversations();
    res.json({success: true});
});

app.listen(4000, () => console.log("Server running on port 4000"));
