const orderForm = document.querySelector("#order-form");
if (orderForm) {
  const delivery = document.querySelector("#delivery");
  delivery.addEventListener("change", () => {
    document.querySelector("#address-field").hidden =
      delivery.value !== "courier";
    document.querySelector("#address").required = delivery.value === "courier";
    renderOrderSummary();
    document.querySelector("#form-message").replaceChildren();
  });
  function fieldError(id, message) {
    document.querySelector("#" + id + "-error").textContent = message;
    document
      .querySelector("#" + id)
      .setAttribute("aria-invalid", String(Boolean(message)));
    return Boolean(message);
  }
  orderForm.addEventListener("input", (event) => {
    const id = event.target.id;
    if (document.querySelector("#" + id + "-error")) fieldError(id, "");
    document.querySelector("#form-message").replaceChildren();
  });
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let invalid = false;
    invalid =
      fieldError(
        "name",
        document.querySelector("#name").value.trim().length < 2
          ? "Введите имя — хотя бы два символа."
          : "",
      ) || invalid;
    const email = document.querySelector("#email");
    invalid =
      fieldError(
        "email",
        !email.value.trim() || !email.validity.valid
          ? "Проверьте адрес почты, например name@example.com."
          : "",
      ) || invalid;
    const phone = document.querySelector("#phone").value.trim();
    const digits = phone.replace(/\D/g, "");
    invalid =
      fieldError(
        "phone",
        !/^[+\d\s()\-]+$/.test(phone) ||
          !(/^[78]\d{10}$/.test(digits) || /^\d{10}$/.test(digits))
          ? "Введите российский номер: 10 цифр или 11 с 7/8."
          : "",
      ) || invalid;
    invalid =
      fieldError(
        "consent",
        !document.querySelector("#consent").checked
          ? "Нужно согласие на обработку данных."
          : "",
      ) || invalid;
    invalid =
      fieldError(
        "address",
        delivery.value === "courier" &&
          document.querySelector("#address").value.trim().length < 10
          ? "Укажите город, улицу и дом."
          : "",
      ) || invalid;
    const message = document.querySelector("#form-message");
    message.replaceChildren();
    if (invalid) {
      orderForm.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    if (!cart.length) {
      message.append(
        make("p", "notice", "Добавьте хотя бы один товар в корзину."),
      );
      message.focus();
      return;
    }
    const button = orderForm.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = "Подготавливаем…";
    setTimeout(() => {
      const text = make(
        "p",
        "success",
        document.querySelector("#name").value.trim() +
          ", заявка подготовлена! Сумма: " +
          document.querySelector("#order-total").textContent +
          ". Это демонстрация: заявка не отправлена, деньги не списываются.",
      );
      message.append(text);
      button.disabled = false;
      button.textContent = "Подготовить заявку ↗";
      message.focus();
    }, 600);
  });
}
