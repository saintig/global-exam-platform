/* SAINTIG EXAMS brand block: "SAINTIG EXAMS" with "Saintigexams.com" below it, top-left, in colour.
   Add <script src="result-brand.js"></script> to any results page. It shows on screen and in print. */
(function () {
  var CSS =
    ".sg-brand{display:block;text-align:left;line-height:1.1;margin:0 0 12px;" +
    "-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    ".sg-brand b{display:block;font:800 24px Arial,Helvetica,sans-serif;letter-spacing:.6px;color:#14243a}" +
    ".sg-brand b span{color:#d5a83b}" +
    ".sg-brand i{display:inline-block;font:bold 12px Arial,Helvetica,sans-serif;font-style:normal;" +
    "letter-spacing:.8px;color:#168653;margin-top:4px;padding-top:3px;border-top:2px solid #d5a83b}";

  window.SAINTIG_BRAND_CSS = CSS;
  window.saintigBrandHTML = function () {
    return '<div class="sg-brand"><b>SAINTIG <span>EXAMS</span></b><i>Saintigexams.com</i></div>';
  };

  function inject() {
    if (document.querySelector(".sg-brand") || document.body.hasAttribute("data-no-brand")) return;
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    var host = document.querySelector("main") || document.querySelector(".container") ||
               document.querySelector(".wrap") || document.body;
    host.insertAdjacentHTML("afterbegin", window.saintigBrandHTML());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();
})();
