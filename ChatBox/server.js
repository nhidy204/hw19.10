import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
    const {message} = req.body;

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
                    {role: "user", content: message}
                ]
            })
        });

        const data = await response.json();

        res.json({reply: data.message?.content?.[0]?.text || "No reply"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "API error"});
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
