const quickDialog = document.querySelector("#quick-view");
let quickOpener;
function openQuickView(product, button) {
  quickOpener = button;
  const box = document.querySelector("#quick-content");
  box.replaceChildren(detailContent(product, true));
  quickDialog.showModal();
}
if (quickDialog) {
  quickDialog
    .querySelector(".close-dialog")
    .addEventListener("click", () => quickDialog.close());
  quickDialog.addEventListener("close", () => quickOpener?.focus());
  quickDialog.addEventListener("click", (event) => {
    if (event.target === quickDialog) {
      const rect = quickDialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        quickDialog.close();
    }
  });
}
