let equalPressed = false;
let input = document.getElementById("input");
let buttons = document.querySelectorAll(".button");
let equal = document.getElementById("equal");
let historyContent = document.getElementById("historyContent");
const clearBtn = document.getElementById("clearHistory");
const closeBtn = document.getElementById("closeHistory");

window.onload = () => {
    input.value = "";
    renderHistory(); 
};

clearBtn.addEventListener("click", () => {
    historyContent.innerHTML = ""; 
});

closeBtn.addEventListener("click", () => {
    const historyBox = document.querySelector(".history");
    historyBox.classList.remove("active");
});

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        let value = btn.dataset.number;

        if (equalPressed) {
            input.value = "";
            equalPressed = false;
        }
        switch (value) {
            case "AC":
                input.value = "";
                break;
            case "DEL":
                input.value = input.value.slice(0, -1);
                break;
            case "hs":
                let historyBox = document.querySelector(".history");
                historyBox.classList.toggle("active");
                break;
            default:
                input.value += value;
                break;
        }
    });
});

equal.addEventListener("click", () => {
    equalPressed = true;
    let expression = input.value.trim();

    if (expression === "") return;

    // Chỉ cho phép ký tự toán học
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        alert("Invalid expression!");
        return;
    }

    // Xử lý dấu phần trăm
    expression = expression.replace(/(\d+)%/g, "($1/100)");

    let result;
    try {
        result = Function(`"use strict"; return (${expression})`)();
    } catch {
        result = "Error";
    }

    input.value = result;
    addToHistory(expression, result);
});



function addToHistory(expression, result) {
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    history.push({ expression, result });

    localStorage.setItem("calcHistory", JSON.stringify(history));

    renderHistory();
}
function renderHistory() {
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    historyContent.innerHTML = "";

    history.forEach((item, index) => {
        historyContent.innerHTML += `
        <div class="historyItem" style="display:flex; justify-content:space-between">
            <span class="history-span" data-user-input="${item.expression}" style="cursor:pointer; color:white;">
                ${item.expression} = ${item.result}
            </span>
            <button class="history-del btn-sm" data-index="${index}" style="background:red; color:white;">
                Delete
            </button>
        </div>
        `;
    });

    addHistoryEvents(); 
}
function addHistoryEvents() {
    document.querySelectorAll(".history-span").forEach(span => {
        span.onclick = () => {
            input.value = span.dataset.userInput;
        };
    });

    document.querySelectorAll(".history-del").forEach(btn => {
        btn.onclick = () => {
            let index = btn.dataset.index;
            let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
            history.splice(index, 1);

            localStorage.setItem("calcHistory", JSON.stringify(history)); 

            renderHistory(); 
        };
    });
}
clearBtn.addEventListener("click", () => {
    localStorage.removeItem("calcHistory");
    renderHistory(); 
});



