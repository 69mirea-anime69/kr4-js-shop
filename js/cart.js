// localStorage хранит только id, количество и избранное. Данные формы не сохраняются.
function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
const savedCart = readStorage("sborka-cart", []);
let cart = Array.isArray(savedCart)
  ? savedCart.filter(
      (item) =>
        item &&
        products.some((p) => p.id === item.id && p.isAvailable) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99,
    )
  : [];
// Объединяем повторные id и ограничиваем количество даже при ручном изменении хранилища.
cart = cart.reduce((result, item) => {
  const old = result.find((x) => x.id === item.id);
  if (old) old.quantity = Math.min(99, old.quantity + item.quantity);
  else result.push({ ...item });
  return result;
}, []);
const savedFavorites = readStorage("sborka-favorites", []);
let favorites = Array.isArray(savedFavorites)
  ? [
      ...new Set(
        savedFavorites.filter((id) => products.some((p) => p.id === id)),
      ),
    ]
  : [];
let promoActive = readStorage("sborka-promo", false) === true;
function saveState() {
  try {
    localStorage.setItem("sborka-cart", JSON.stringify(cart));
    localStorage.setItem("sborka-favorites", JSON.stringify(favorites));
    localStorage.setItem("sborka-promo", JSON.stringify(promoActive));
  } catch {
    notify(
      "Не удалось сохранить выбор в браузере. Корзина работает до закрытия страницы.",
    );
  }
  updateCounters();
}
function money(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}
function totals() {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + products.find((p) => p.id === item.id).price * item.quantity,
    0,
  );
  const discount = promoActive ? Math.round(subtotal * 0.1) : 0;
  return { subtotal, discount, total: subtotal - discount };
}
function updateCounters() {
  document
    .querySelectorAll(".cart-count")
    .forEach(
      (el) =>
        (el.textContent = cart.reduce((sum, item) => sum + item.quantity, 0)),
    );
}
let toastTimer;
function notify(text) {
  const el = document.querySelector("#toast");
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 3500);
}
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product || !product.isAvailable) return;
  const item = cart.find((x) => x.id === id);
  if (item && item.quantity >= 99) {
    notify("В корзине уже 99 штук этого товара.");
    return;
  }
  if (item) item.quantity++;
  else cart.push({ id, quantity: 1 });
  saveState();
  notify("Добавлено в корзину: " + product.title);
}
function renderCart() {
  const box = document.querySelector("#cart-items");
  if (!box) return;
  box.replaceChildren();
  document.querySelector("#cart-summary").hidden = cart.length === 0;
  if (!cart.length) {
    box.append(
      emptyBlock(
        "Здесь пока пусто",
        "Начните с того, что пригодится каждый день.",
        "Выбрать технику",
        "catalog.html",
      ),
    );
    return;
  }
  cart.forEach((item) => {
    const p = products.find((p) => p.id === item.id);
    const row = make("article", "cart-row");
    const img = make("img");
    img.src = p.image;
    img.alt = p.title;
    const info = make("div", "cart-info");
    const title = make("h2");
    const link = make("a", "", p.title);
    link.href = "product.html?id=" + p.id;
    title.append(link);
    const qty = make("div", "quantity");
    const minus = make("button", "", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", "Уменьшить количество: " + p.title);
    minus.disabled = item.quantity === 1;
    const plus = make("button", "", "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "Увеличить количество: " + p.title);
    plus.disabled = item.quantity === 99;
    minus.addEventListener("click", () => changeQuantity(p.id, -1));
    plus.addEventListener("click", () => changeQuantity(p.id, 1));
    qty.append(minus, make("span", "", String(item.quantity)), plus);
    info.append(
      title,
      make("p", "muted small", money(p.price) + " за штуку"),
      qty,
    );
    const end = make("div");
    const remove = make("button", "remove", "Удалить");
    remove.type = "button";
    remove.setAttribute("aria-label", "Удалить: " + p.title);
    remove.addEventListener("click", () => {
      cart = cart.filter((x) => x.id !== p.id);
      saveState();
      renderCart();
    });
    end.append(make("p", "", money(p.price * item.quantity)), remove);
    row.append(img, info, end);
    box.append(row);
  });
  const t = totals();
  document.querySelector("#subtotal").textContent = money(t.subtotal);
  document.querySelector("#discount").textContent = money(t.discount);
  document.querySelector("#cart-total").textContent = money(t.total);
  document.querySelector("#promo").value = promoActive ? "START10" : "";
}
function changeQuantity(id, delta) {
  const item = cart.find((x) => x.id === id);
  if (!item) return;
  item.quantity = Math.max(1, Math.min(99, item.quantity + delta));
  saveState();
  renderCart();
}
function renderOrderSummary() {
  const box = document.querySelector("#order-items");
  if (!box) return;
  box.replaceChildren();
  cart.forEach((item) => {
    const p = products.find((p) => p.id === item.id);
    box.append(
      make(
        "p",
        "summary-line",
        p.title +
          " × " +
          item.quantity +
          " · " +
          money(p.price * item.quantity),
      ),
    );
  });
  if (!cart.length)
    box.append(
      make("p", "notice", "Корзина пуста. Сначала выберите товары в каталоге."),
    );
  const t = totals();
  const courier = document.querySelector("#delivery").value === "courier";
  const shipping = cart.length && courier && t.total < 10000 ? 490 : 0;
  document.querySelector("#order-discount").textContent = money(t.discount);
  document.querySelector("#shipping").textContent = money(shipping);
  document.querySelector("#order-total").textContent = money(
    t.total + shipping,
  );
}
