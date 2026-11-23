// Все текстовые данные попадают в DOM через textContent.
function make(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.classList.add(...className.split(" "));
  if (text !== "") el.textContent = text;
  return el;
}
function emptyBlock(title, text, buttonText, href) {
  const box = make("div", "empty");
  box.append(make("h2", "", title), make("p", "", text));
  const link = make("a", "button", buttonText);
  link.href = href;
  box.append(link);
  return box;
}
function productCard(p) {
  const card = make("article", "product-card");
  const photo = make("div", "card-photo");
  const link = make("a");
  link.href = "product.html?id=" + p.id;
  const img = make("img");
  img.src = p.image;
  img.alt = p.title;
  img.loading = "lazy";
  img.width = 1000;
  img.height = 750;
  link.append(img);
  photo.append(link);
  if (p.badge) photo.append(make("span", "badge", p.badge));
  const favorite = make(
    "button",
    "favorite",
    favorites.includes(p.id) ? "♥" : "♡",
  );
  favorite.type = "button";
  favorite.setAttribute("aria-label", "В избранное: " + p.title);
  favorite.setAttribute("aria-pressed", String(favorites.includes(p.id)));
  favorite.addEventListener("click", () => {
    favorites = favorites.includes(p.id)
      ? favorites.filter((id) => id !== p.id)
      : [...favorites, p.id];
    saveState();
    favorite.textContent = favorites.includes(p.id) ? "♥" : "♡";
    favorite.setAttribute("aria-pressed", String(favorites.includes(p.id)));
    if (document.querySelector("#favorites-only")?.checked) renderCatalog();
  });
  photo.append(favorite);
  const body = make("div", "card-body");
  const heading = make(
    document.querySelector("#catalog-products") ? "h2" : "h3",
  );
  const title = make("a", "", p.title);
  title.href = link.href;
  heading.append(title);
  const add = make(
    "button",
    "button",
    p.isAvailable ? "В корзину" : "Нет в наличии",
  );
  add.type = "button";
  add.disabled = !p.isAvailable;
  add.addEventListener("click", () => addToCart(p.id));
  const quick = make("button", "quick-button", "↗");
  quick.type = "button";
  quick.setAttribute("aria-label", "Быстрый просмотр: " + p.title);
  quick.addEventListener("click", () => openQuickView(p, quick));
  const actions = make("div", "card-actions");
  actions.append(add, quick);
  body.append(
    make("p", "category-label", categories[p.category]),
    heading,
    make(
      "p",
      p.isAvailable ? "stock" : "stock unavailable",
      p.isAvailable ? "● В наличии" : "○ Пока закончились",
    ),
    make("p", "price", money(p.price)),
    actions,
  );
  card.append(photo, body);
  return card;
}
function renderCatalog() {
  const grid = document.querySelector("#catalog-products");
  if (!grid) return;
  const query = document
    .querySelector("#search")
    .value.trim()
    .toLocaleLowerCase("ru");
  const category = document.querySelector("#category").value;
  const max = document.querySelector("#max-price").value;
  let list = products.filter(
    (p) =>
      p.title.toLocaleLowerCase("ru").includes(query) &&
      (!category || p.category === category) &&
      (max === "" || p.price <= Number(max)) &&
      (!document.querySelector("#available").checked || p.isAvailable) &&
      (!document.querySelector("#favorites-only").checked ||
        favorites.includes(p.id)),
  );
  list = [...list];
  const sort = document.querySelector("#sort").value;
  if (sort === "cheap") list.sort((a, b) => a.price - b.price);
  if (sort === "expensive") list.sort((a, b) => b.price - a.price);
  if (sort === "name")
    list.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  grid.replaceChildren();
  list.forEach((p) => grid.append(productCard(p)));
  document.querySelector("#results-count").textContent =
    "Найдено товаров: " + list.length;
  document.querySelector("#empty-results").hidden = list.length !== 0;
}
function resetFilters() {
  document.querySelector("#search").value = "";
  document.querySelector("#category").value = "";
  document.querySelector("#max-price").value = "";
  document.querySelector("#available").checked = false;
  document.querySelector("#favorites-only").checked = false;
  document.querySelector("#sort").value = "default";
  renderCatalog();
}
function detailContent(p, modal = false) {
  const wrap = make("div", "detail-layout");
  const img = make("img");
  img.src = p.image;
  img.alt = p.title;
  const text = make("div", "detail-copy");
  const title = make(modal ? "h2" : "h1", "", p.title);
  if (modal) title.id = "quick-title";
  text.append(
    make("p", "eyebrow", categories[p.category]),
    title,
    make("p", "muted", p.description),
    make("p", "price", money(p.price)),
    make("p", "stock", p.isAvailable ? "В наличии" : "Пока нет в наличии"),
  );
  const specs = make("dl", "specs");
  Object.entries(p.specs).forEach(([k, v]) => {
    const row = make("div");
    row.append(make("dt", "", k), make("dd", "", v));
    specs.append(row);
  });
  text.append(specs);
  const add = make(
    "button",
    "button",
    p.isAvailable ? "Добавить в корзину" : "Нет в наличии",
  );
  add.type = "button";
  add.disabled = !p.isAvailable;
  add.addEventListener("click", () => addToCart(p.id));
  text.append(add);
  if (modal) {
    const link = make("a", "button secondary", "Подробнее о товаре");
    link.href = "product.html?id=" + p.id;
    text.append(link);
  }
  wrap.append(img, text);
  return wrap;
}
