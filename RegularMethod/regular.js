let currentItem = null;
let currentList = null;

function initItems() {
    const items = document.querySelectorAll('.item');
    const lists = document.querySelectorAll('.list');

    items.forEach(item => {
        item.addEventListener('dragstart', () => {
            currentItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });

        item.addEventListener('dragend', () => {
            currentItem = null;
            item.classList.remove('dragging');
            document.querySelectorAll('.item').forEach(i => i.classList.remove('over'));
        });

        item.addEventListener('dragover', e => {
            e.preventDefault();
            if (item !== currentItem) item.classList.add('over');
        });

        item.addEventListener('dragleave', () => item.classList.remove('over'));

        item.addEventListener('drop', () => {
            if (!currentItem || currentItem === item) return;

            const parentList = item.parentNode;
            const allItems = Array.from(parentList.children);

            const draggedIndex = allItems.indexOf(currentItem);
            const dropIndex = allItems.indexOf(item);

            if (draggedIndex < dropIndex)
                parentList.insertBefore(currentItem, item.nextSibling);
            else
                parentList.insertBefore(currentItem, item);

            item.classList.remove('over');
        });
    });

    lists.forEach(list => {
        list.addEventListener('dragover', e => e.preventDefault());
        list.addEventListener('drop', () => {
            if (currentItem && currentItem.parentNode !== list) {
                list.appendChild(currentItem);
            }
        });
    });
}

function initLists() {
    const headers = document.querySelectorAll('.list-header');
    const board = document.getElementById('board');

    headers.forEach(header => {
        const list = header.parentNode;

        header.addEventListener('dragstart', () => {
            currentList = list;
            setTimeout(() => list.classList.add('dragging'), 0);
        });

        header.addEventListener('dragend', () => {
            currentList = null;
            list.classList.remove('dragging');
        });

        list.addEventListener('dragover', e => e.preventDefault());

        list.addEventListener('drop', () => {
            if (!currentList || currentList === list) return;

            const allLists = Array.from(board.children);
            const draggedIndex = allLists.indexOf(currentList);
            const dropIndex = allLists.indexOf(list);

            if (draggedIndex < dropIndex)
                board.insertBefore(currentList, list.nextSibling);
            else
                board.insertBefore(currentList, list);
        });
    });
}

initItems();
initLists();
