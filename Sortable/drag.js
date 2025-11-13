document.addEventListener("DOMContentLoaded", () => {
    async function readySortable() {
        if (typeof Sortable === "undefined") {
            try {
                // try CDN - same version as before
                await loadScript("https://cdn.jsdelivr.net/npm/sortablejs@1.17.0/Sortable.min.js");
            } catch (err) {
                console.error("Sortable.js not found and CDN load failed:", err);
                return null;
            }
        }
        return typeof Sortable !== "undefined" ? Sortable : null;
    }

    readySortable().then((SortableLib) => {
        if (!SortableLib) return;

        console.log("Sortable ready:", SortableLib);

        const listContainer = document.getElementById('list_sortable');
        if (!listContainer) {
            console.error("#list_sortable not found in DOM");
        } else {
            new Sortable(listContainer, {
                animation: 150,
                ghostClass: 'placeholder',
                draggable: '.list',
                handle: '.list-header'
            });
        }

        const cardLists = document.querySelectorAll('.m-card-sortable');
        if (!cardLists || cardLists.length === 0) {
            console.warn("No .m-card-sortable containers found");
        }
        cardLists.forEach(function (el) {
            new Sortable(el, {
                group: 'shared-cards',
                animation: 150,
                ghostClass: 'placeholder',
                draggable: '.m-card'
            });
        });
    });
});