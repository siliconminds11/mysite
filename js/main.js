/* Silicon Minds — main.js
   Minimal vanilla JS. No frameworks, no build step. */

(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Mark active nav link based on current path
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Language switcher — EN is the only live language today; PT/ES are
  // announced but not yet translated, so clicking shows a short toast
  // instead of a broken link.
  var langSwitch = document.querySelector(".lang-switch");
  if (langSwitch) {
    var toast;
    langSwitch.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("active")) return;
        var name = btn.getAttribute("data-lang-name") || btn.textContent;
        if (toast) toast.remove();
        toast = document.createElement("div");
        toast.className = "lang-toast";
        toast.textContent = name + " version is coming soon.";
        document.body.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add("show"); });
        window.setTimeout(function () {
          if (!toast) return;
          toast.classList.remove("show");
          window.setTimeout(function () { if (toast) { toast.remove(); toast = null; } }, 300);
        }, 2400);
      });
    });
  }

  // Animated counters for the "Trusted Across Borders" stats
  var counters = document.querySelectorAll(".trust-num[data-count-to]");
  if (counters.length) {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var runCounter = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1600;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var counterIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { counterIo.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  // Simple reveal-on-scroll (progressive enhancement only)
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      io.observe(el);
    });
  }

  // Contact form — submits via AJAX to Netlify Forms (data-netlify="true" on the <form>).
  // Netlify detects the form at deploy time by scanning the built HTML; this fetch()
  // call submits it without a full page reload. On a host that isn't Netlify, or before
  // the site is deployed, the fetch will fail and the user is told to email directly.
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var data = new FormData(form);
      var encoded = [];
      data.forEach(function (value, key) {
        encoded.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
      });

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encoded.join("&"),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Submit failed");
          if (status) {
            status.style.color = "";
            status.textContent =
              "Thank you. Your message has been received — a member of the Silicon Minds team will respond within one business day.";
            status.hidden = false;
          }
          form.reset();
        })
        .catch(function () {
          if (status) {
            status.style.color = "#FF6A5C";
            status.textContent =
              "We couldn't submit the form automatically. Please email us directly at team@silicon-minds.com.";
            status.hidden = false;
          }
        });
    });
  }
})();
