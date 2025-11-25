(() => {
    const input = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const exportBtn = document.getElementById("exportBtn");
    const statusEl = document.querySelector(".sync-status");
    const dropZones = Array.from(document.querySelectorAll(".dropzone"));

    const API = "https://691ecfe9bb52a1db22bf34d0.mockapi.io/taskManager";

    let tasks = [];
    let undoList = [];
    let redoList = [];

    const setStatus = (t) => statusEl && (statusEl.textContent = t);
    const synced = () => setStatus("synced✓");
    const syncing = () => setStatus("syncing...");
    const loading = () => setStatus("loading...");

    const updateUndoRedo = () => {
        undoBtn.disabled = undoList.length === 0;
        redoBtn.disabled = redoList.length === 0;
    };
    const mapTask = (t) => ({id: Number(t.id), text: t.text || "", column: t.column || "To Do"});

    // api
    const coreAddTask = async (task) => {
        try {
            syncing();
            const res = await fetch(API, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(task),
            });
            if (!res.ok) throw new Error(res.status);
            const newTask = mapTask(await res.json());
            tasks.push(newTask);
            renderTasks();
            synced();
            return newTask;
        } catch (err) {
            console.error(err);
            setStatus("add failed");
        }
    };

    const coreRemoveTask = async (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        try {
            syncing();
            const res = await fetch(`${API}/${taskId}`, {method: "DELETE"});
            if (!res.ok) throw new Error(res.status);
            tasks = tasks.filter((t) => t.id !== taskId);
            renderTasks();
            synced();
            return task;
        } catch (err) {
            console.error(err);
            setStatus("delete failed");
        }
    };

    const coreUpdateTask = async (task) => {
        try {
            syncing();
            const res = await fetch(`${API}/${task.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(task),
            });
            if (!res.ok) throw new Error(res.status);
            const updated = mapTask(await res.json());
            tasks[tasks.findIndex((t) => t.id === task.id)] = updated;
            synced();
            return updated;
        } catch (err) {
            console.error(err);
            setStatus("update failed");
        }
    };

    // UI
    const createTaskElement = (task) => {
        const el = document.createElement("div");
        el.className = "task-item";
        el.draggable = true;
        el.dataset.id = task.id;

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✎";
        editBtn.title = "Edit task";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Delete task";

        editBtn.addEventListener("click", () => {
            const inputEl = document.createElement("input");
            inputEl.type = "text";
            inputEl.value = task.text;
            inputEl.className = "task-text edit-input";


            el.replaceChild(inputEl, span);
            inputEl.focus();

            let handled = false;

            const restore = () => {
                if (inputEl.parentNode === el) el.replaceChild(span, inputEl);
            };

            const save = async () => {
                if (handled) return;
                handled = true;

                inputEl.removeEventListener("blur", save);
                inputEl.removeEventListener("keydown", onKey);

                const newText = inputEl.value.trim();
                const oldText = task.text;

                if (!newText || newText === oldText) {
                    restore();
                    return;
                }

                undoList.push({type: "edit", taskId: task.id, oldText, newText});
                redoList.length = 0;
                updateUndoRedo();

                task.text = newText;
                span.textContent = newText;
                restore();

                try {
                    await coreUpdateTask(task);
                } catch {
                    setStatus("update failed");
                }
            };

            const onKey = (keyBoardEvent) => {
                if (keyBoardEvent.key === "Enter") {
                    keyBoardEvent.preventDefault();
                    save();
                }
                if (keyBoardEvent.key === "Escape") {
                    handled = true;
                    restore();
                }
            };

            inputEl.addEventListener("blur", save);
            inputEl.addEventListener("keydown", onKey);
        });

        deleteBtn.addEventListener("click", () => {
            coreRemoveTask(task.id).then((removed) => {
                undoList.push({type: "delete", task: removed});
                redoList.length = 0;
                updateUndoRedo();
            });
        });

        el.append(span, editBtn, deleteBtn);

        el.addEventListener("dragstart", () => el.classList.add("dragging"));
        el.addEventListener("dragend", () => el.classList.remove("dragging"));

        return el;
    };


    const clearDropzoneHighlights = () => dropZones.forEach((dz) => dz.classList.remove("drag-over"));

    const renderTasks = () => {
        dropZones.forEach((dz) => (dz.innerHTML = ""));
        tasks.forEach((task) => {
            const target = document.querySelector(`.dropzone[data-col="${task.column}"]`);
            if (target) target.appendChild(createTaskElement(task));
        });
    };

    //undo
    const undo = async () => {
        if (!undoList.length) return;
        const action = undoList.pop();
        redoList.push(action);

        switch (action.type) {
            case "add":
                await coreRemoveTask(action.task.id);
                break;

            case "delete":
                await coreAddTask(action.task);
                break;

            case "edit": {
                const taskToEdit = tasks.find((taskToEdit) => taskToEdit.id === action.taskId);
                if (taskToEdit) {
                    taskToEdit.text = action.oldText;
                    const el = document.querySelector(`.task-item[data-id="${taskToEdit.id}"] .task-text`);
                    if (el) el.textContent = action.oldText;
                    renderTasks();
                    coreUpdateTask(taskToEdit);
                }
                break;
            }

            case "move": {
                const taskToMove = tasks.find((taskToMove) => taskToMove.id === action.taskId);
                if (taskToMove) {
                    taskToMove.column = action.oldColumn;
                    renderTasks();
                    coreUpdateTask(taskToMove);
                }
                break;
            }
        }
        updateUndoRedo();
    };

    //reddo
    const redo = async () => {
        if (!redoList.length) return;
        const action = redoList.pop();
        undoList.push(action);

        switch (action.type) {
            case "add":
                await coreAddTask(action.task);
                break;

            case "delete":
                await coreRemoveTask(action.task.id);
                break;

            case "edit": {
                const taskToEdit = tasks.find((taskToEdit) => taskToEdit.id === action.taskId);
                if (taskToEdit) {
                    taskToEdit.text = action.newText;
                    const el = document.querySelector(`.task-item[data-id="${taskToEdit.id}"] .task-text`);
                    if (el) el.textContent = action.newText;
                    renderTasks();
                    coreUpdateTask(taskToEdit);
                }
                break;
            }

            case "move": {
                const taskToMove = tasks.find((taskToMove) => taskToMove.id === action.taskId);
                if (taskToMove) {
                    taskToMove.column = action.newColumn;
                    renderTasks();
                    coreUpdateTask(taskToMove);
                }
                break;
            }
        }
        updateUndoRedo();
    };

    const addTask = async (text) => {
        const clean = (text || "").trim();
        if (!clean) return;
        const newTask = await coreAddTask({text: clean, column: "To Do"});
        undoList.push({type: "add", task: newTask});
        redoList.length = 0;
        updateUndoRedo();
        input.value = "";
    };

    // drag drop
    const setupDragDrop = () => {
        dropZones.forEach((dz) => {
            dz.addEventListener("dragover", (e) => {
                e.preventDefault();
                dz.classList.add("drag-over");
            });
            dz.addEventListener("dragleave", () => dz.classList.remove("drag-over"));
            dz.addEventListener("drop", (e) => {
                e.preventDefault();
                clearDropzoneHighlights();

                const id =
                    Number(e.dataTransfer.getData("text/plain")) ||
                    Number(document.querySelector(".task-item.dragging")?.dataset.id);
                if (!id || !dz.dataset.col) return;

                const task = tasks.find((t) => t.id === id);
                if (!task || task.column === dz.dataset.col) return;

                const oldColumn = task.column;
                task.column = dz.dataset.col;

                const el = document.querySelector(`.task-item[data-id="${task.id}"]`);
                if (el) dz.appendChild(el);

                undoList.push({
                    type: "move",
                    taskId: id,
                    oldColumn,
                    newColumn: task.column,
                });
                redoList.length = 0;
                updateUndoRedo();

                coreUpdateTask(task);
            });
        });
        document.addEventListener("dragend", clearDropzoneHighlights);
    };

    addBtn.addEventListener("click", () => addTask(input.value));
    input.addEventListener("keydown", (e) => e.key === "Enter" && addTask(input.value));
    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    exportBtn.addEventListener("click", async () => {
        if (!tasks.length) return alert("No tasks to export!");
        const rows = [["id", "text", "column"], ...tasks.map((t) => [t.id, t.text.replace(/"/g), t.column.replace(/"/g)])];
        const csv = rows.map((r) => `"${r.join('","')}"`).join("\r\n");
        const blob = new Blob(["\uFEFF" + csv], {type: "text/csv;charset=utf-8;"});
        const anchorEl = document.createElement("anchorEl");
        const now = new Date();
        anchorEl.href = URL.createObjectURL(blob);
        anchorEl.download = `tasks_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`;
        anchorEl.click();
        synced();
    });

    // init
    (async () => {
        try {
            loading();
            const res = await fetch(API);
            const data = await res.json();
            tasks = Array.isArray(data) ? data.map(mapTask) : [];
            renderTasks();
            synced();
            setupDragDrop();
            updateUndoRedo();
        } catch (err) {
            console.error(err);
            setStatus("load failed");
        }
    })();
})();
