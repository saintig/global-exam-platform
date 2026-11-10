/* SAINTIG EXAMS - privacy-friendly visit counter
   Stores only a random visitor ID, the page, the referring site and the
   device type. No names, emails, IP addresses or other personal details. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://scuiswponnqyrbqjypkx.supabase.co";
  var SUPABASE_KEY = "sb_publishable_3fT0c2Ggy8sYKINoMkMpkA_Qlaj5oZq";

  try {

    if (window.__saintigTracked) return;
    window.__saintigTracked = true;

    // Respect the browser's "Do Not Track" setting
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

    var ua = navigator.userAgent || "";

    // Skip robots and automated browsers
    if (
      navigator.webdriver ||
      /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|pingdom|monitor|uptime/i.test(ua)
    ) return;

    if (document.visibilityState === "prerender") return;

    function newId() {
      try {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      } catch (e) {}

      var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      var id = "";

      for (var i = 0; i < 24; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return id;
    }

    var visitor = "";

    try {
      visitor = localStorage.getItem("saintig_vid") || "";

      if (!/^[A-Za-z0-9_-]{8,64}$/.test(visitor)) {
        visitor = newId();
        localStorage.setItem("saintig_vid", visitor);
      }
    } catch (e) {
      visitor = newId();
    }

    var device = "desktop";

    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
      device = "tablet";
    } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
      device = "mobile";
    }

    var referrer = "";

    try {
      if (document.referrer) {
        var host = new URL(document.referrer).hostname.toLowerCase();
        referrer = host === location.hostname.toLowerCase() ? "internal" : host;
      }
    } catch (e) {}

    fetch(SUPABASE_URL + "/rest/v1/rpc/record_page_view", {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        p_visitor: visitor,
        p_path: location.pathname || "/",
        p_referrer: referrer,
        p_device: device
      }),
      keepalive: true
    }).catch(function () {});

  } catch (e) {}
})();
