// Меню и базовая доступность перенесены из КР3 и адаптированы к новому оформлению.
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");
const mobile = matchMedia("(max-width:760px)");
function syncMenu() {
  menu.hidden = mobile.matches;
  menuButton.setAttribute("aria-expanded", String(!mobile.matches));
}
menuButton.hidden = false;
syncMenu();
mobile.addEventListener("change", syncMenu);
menuButton.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobile.matches && !menu.hidden) {
    syncMenu();
    menuButton.focus();
  }
});
updateCounters();
renderCart();
renderOrderSummary();
const featured = document.querySelector("#featured");
if (featured)
  products.slice(0, 4).forEach((p) => featured.append(productCard(p)));
if (document.querySelector("#catalog-products")) {
  const category = new URLSearchParams(location.search).get("category");
  if (Object.keys(categories).includes(category))
    document.querySelector("#category").value = category;
  document.querySelector("#search").addEventListener("input", renderCatalog);
  document.querySelector("#max-price").addEventListener("input", renderCatalog);
  ["category", "sort", "available", "favorites-only"].forEach((id) =>
    document.querySelector("#" + id).addEventListener("change", renderCatalog),
  );
  document
    .querySelector("#reset-filters")
    .addEventListener("click", resetFilters);
  document
    .querySelector("[data-reset]")
    .addEventListener("click", resetFilters);
  renderCatalog();
}
const detail = document.querySelector("#product-detail");
if (detail) {
  const value = new URLSearchParams(location.search).get("id");
  const product = products.find((p) => p.id === Number(value || 1));
  if (product) {
    detail.append(detailContent(product));
    document.title = product.title + " — techshop";
  } else
    detail.append(
      emptyBlock(
        "Товар не найден",
        "Возможно, ссылка устарела. Посмотрите, что есть в каталоге.",
        "Открыть каталог",
        "catalog.html",
      ),
    );
}
const promoButton = document.querySelector("#apply-promo");
if (promoButton)
  promoButton.addEventListener("click", () => {
    const code = document.querySelector("#promo").value.trim().toUpperCase();
    promoActive = code === "START10";
    saveState();
    renderCart();
    document.querySelector("#promo-message").textContent = promoActive
      ? "Готово, скидка 10% применена."
      : code
        ? "Такого промокода нет. Проверьте написание."
        : "Промокод убран.";
  });
