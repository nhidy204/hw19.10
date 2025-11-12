let lists = document.getElementsByClassName("list");
let rightBox = document.getElementById("right");
let leftBox = document.getElementById("left");
let underBox = document.getElementsByClassName("under");

for (let list of lists) {
    list.addEventListener("dragstart", function (e) {
        let selected = e.target;

        const handleDragOver = (e) => e.preventDefault();

        const handleDrop = (target) => (e) => {
            if (e.target.classList.contains("list") && target.contains(e.target)) {
                let dropTarget = e.target;
                let allItems = Array.from(target.getElementsByClassName("list"));
                let selectedIndex = allItems.indexOf(selected);
                let dropIndex = allItems.indexOf(dropTarget);

                if (selectedIndex < dropIndex) {
                    target.insertBefore(selected, dropTarget.nextSibling);
                } else {
                    target.insertBefore(selected, dropTarget);
                }
            } else {
                target.appendChild(selected);
            }

            selected = null;
        };

        rightBox.addEventListener("dragover", handleDragOver);
        rightBox.addEventListener("drop", handleDrop(rightBox));

        leftBox.addEventListener("dragover", handleDragOver);
        leftBox.addEventListener("drop", handleDrop(leftBox));

        for (let under of underBox) {
            under.addEventListener("dragover", handleDragOver);
            under.addEventListener("drop", handleDrop(under));
        }
    });
}
