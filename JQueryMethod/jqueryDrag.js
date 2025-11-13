$(function () {
    $("#list_sortable").sortable({
        axis: "x",
        placeholder: "placeholder",
        tolerance: "pointer",
        revert: 200
    });

    function initSortableCards() {
        $(".m-card-sortable").sortable({
            connectWith: ".m-card-sortable",
            placeholder: "placeholder",
            items: "> .m-card",
            tolerance: "pointer",
            revert: 200
        }).disableSelection();
    }

    initSortableCards();
});