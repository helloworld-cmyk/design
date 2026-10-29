(function () {
  "use strict";

  /* Một giao diện lỗi dùng chung cho 404 & 500 — chọn qua ?code=500 */
  const STATES = {
    "404": {
      doc: "Không tìm thấy trang — Vi Vu Việt",
      eyebrow: "Lỗi 404 — Không tìm thấy trang",
      title: 'Ôi! Trang này <span class="text-sky">lạc đường</span> rồi.',
      lead:
        "Đường dẫn có thể đã thay đổi hoặc trang đã được di chuyển. " +
        "Đừng lo, chuyến đi của bạn vẫn còn nguyên — thử một lối tắt bên dưới nhé.",
      ref: "404 — Not Found"
    },
    "500": {
      doc: "Lỗi hệ thống — Vi Vu Việt",
      eyebrow: "Lỗi 500 — Máy chủ gặp sự cố",
      title: 'Xe đang <span class="text-sky">nổ máy</span>, chờ chút nhé.',
      lead:
        "Hệ thống tạm thời gặp trục trặc. Chúng tôi đang khắc phục ngay — " +
        "bạn thử lại sau ít phút hoặc liên hệ hỗ trợ.",
      ref: "500 — Server Error"
    }
  };

  const params = new URLSearchParams(window.location.search);
  const code = STATES[params.get("code")] ? params.get("code") : "404";
  const state = STATES[code];

  const set = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  document.title = state.doc;
  set("errorCode", code);
  set("errorEyebrow", state.eyebrow);
  set("errorTitle", state.title);
  set("errorLead", state.lead);
  set("errorRef", state.ref);

  /* Lỗi 500 là tạm thời → ưu tiên "Thử lại", hạ "Về trang chủ" xuống phụ */
  if (code === "500") {
    const retry = document.getElementById("errorRetry");
    const home = document.getElementById("errorHome");
    const book = document.getElementById("errorBook");

    if (retry) {
      retry.hidden = false;
      retry.addEventListener("click", () => window.location.reload());
    }
    if (home) {
      home.classList.remove("btn-primary");
      home.classList.add("btn-ghost");
    }
    if (book) book.hidden = true;
  }
})();
