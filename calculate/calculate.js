let equalPressed = false;
let input = document.getElementById("input");
let buttons = document.querySelectorAll(".button");
let equal = document.getElementById("equal");
let historyContent = document.getElementById("historyContent");
const clearBtn = document.getElementById("clearHistory");
const closeBtn = document.getElementById("closeHistory");

window.onload = () => {
    input.value = "";
};

clearBtn.addEventListener("click", () => {
    historyContent.innerHTML = ""; // xóa hết nội dung
});

closeBtn.addEventListener("click", () => {
    const historyBox = document.querySelector(".history");
    historyBox.classList.remove("active"); // ẩn history
});

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        let value = btn.dataset.number;

        if (equalPressed) {
            equalPressed = false;
        }
        if (value === "AC") {
            input.value = "";
            return;
        }
        if (value === "DEL") {
            input.value = input.value.slice(0, -1);
            return;
        }
        if (value === "hs") {
            let historyBox = document.querySelector(".history");
            historyBox.classList.toggle("active");
            return;
        }
        input.value += value;
    });
});

equal.addEventListener("click", () => {
    equalPressed = true;
    let expression = input.value;

    if (expression.trim() === "") return;

    let result = eval(expression);

    input.value = result;
    addToHistory(expression, result);
});

function addToHistory(expression, result) {
    historyContent.innerHTML += `
        <div class="historyItem" style="display:flex; justify-content:space-between">
            <span class="history-span" data-user-input="${expression}" style="cursor:pointer; color:white;">
                ${expression} = ${result}
            </span>
            <button class="history-del btn-sm " style="background:red; color:white;">
                Delete
            </button>
        </div>
    `;
    
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
            btn.parentElement.remove();
        };
    });
}


