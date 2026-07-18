/* ==========================================================================
   SILICON MINDS — Assistant widget
   Lightweight, self-contained chat widget: canned FAQ responses + a
   persistent CTA that routes visitors to the contact form. No backend —
   pure client-side keyword matching, safe for a static site.
   ========================================================================== */
(function(){

  var CONTACT_URL = "/contact.html";
  var AUDIT_URL = "/audit.html";

  var QUICK_REPLIES = [
    { label: "What is the AI Reputation Audit™?", key: "audit" },
    { label: "How much does it cost?", key: "pricing" },
    { label: "How long does it take?", key: "timeline" },
    { label: "Talk to a human", key: "human" }
  ];

  var RESPONSES = [
    {
      key: "audit",
      test: /audit|reputation audit|what.*(do|offer)|assess/i,
      reply: "The AI Reputation Audit™ is our flagship engagement — a comprehensive, evidence-based assessment of how you or your organization are represented across search engines and AI platforms (ChatGPT, Gemini, Claude, Perplexity). It produces a weighted Digital Trust Score™ and a prioritized roadmap.",
      cta: { label: "Learn how the audit works", href: AUDIT_URL }
    },
    {
      key: "pricing",
      test: /price|pricing|cost|how much|fee|budget|invest/i,
      reply: "Every engagement is scoped to the entity and its complexity, so pricing isn't one-size-fits-all. The fastest way to get an accurate quote is to tell our team a bit about your situation.",
      cta: { label: "Request pricing", href: CONTACT_URL }
    },
    {
      key: "timeline",
      test: /long|time|timeline|duration|when|fast|quick|weeks/i,
      reply: "A typical AI Reputation Audit™ takes 2–3 weeks from kickoff to delivery of your Digital Trust Score™ and roadmap. Ongoing management is structured in quarterly cycles.",
      cta: { label: "Request Your Audit", href: AUDIT_URL }
    },
    {
      key: "framework",
      test: /framework|pillar|seven pillars|methodology/i,
      reply: "The Digital Trust Framework™ scores seven pillars — AI Visibility, Search Reputation, Executive Authority, Entity Authority, Media Presence, Digital Trust Signals and Risk Assessment — into a single, weighted score.",
      cta: { label: "Explore the framework", href: "/framework.html" }
    },
    {
      key: "human",
      test: /human|person|talk|call|speak|team|contact/i,
      reply: "Happy to connect you with our team directly.",
      cta: { label: "Talk to our team", href: CONTACT_URL }
    }
  ];

  var FALLBACK = {
    reply: "I don't have a canned answer for that yet, but our team can help directly.",
    cta: { label: "Go to contact form", href: CONTACT_URL }
  };

  var GREETING = "Hi, I'm the Silicon Minds assistant. Ask me about the AI Reputation Audit™, pricing, or timelines — or jump straight to the team.";

  function matchResponse(text){
    for (var i = 0; i < RESPONSES.length; i++){
      if (RESPONSES[i].test.test(text)) return RESPONSES[i];
    }
    return null;
  }

  function byKey(key){
    for (var i = 0; i < RESPONSES.length; i++){
      if (RESPONSES[i].key === key) return RESPONSES[i];
    }
    return null;
  }

  function init(){
    var root = document.createElement("div");
    root.className = "sm-chat";
    root.innerHTML =
      '<button class="sm-chat-fab" type="button" aria-label="Open chat assistant">' +
        '<svg class="sm-chat-fab-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.1 0-2.2-.2-3.1-.6L4 21l1.7-4.6C4.6 15 4 13.6 4 12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<svg class="sm-chat-fab-close" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="sm-chat-panel" role="dialog" aria-label="Silicon Minds assistant">' +
        '<div class="sm-chat-head">' +
          '<div><p class="sm-chat-title">Silicon Minds Assistant</p><p class="sm-chat-sub"><i></i>Auto-replies</p></div>' +
        '</div>' +
        '<div class="sm-chat-body" id="smChatBody"></div>' +
        '<div class="sm-chat-quick" id="smChatQuick"></div>' +
        '<form class="sm-chat-input-row" id="smChatForm">' +
          '<input class="sm-chat-input" id="smChatInput" type="text" placeholder="Type a question…" autocomplete="off">' +
          '<button class="sm-chat-send" type="submit" aria-label="Send">' +
            '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="currentColor"/></svg>' +
          '</button>' +
        '</form>' +
        '<div class="sm-chat-cta-row"><a href="' + CONTACT_URL + '" class="sm-chat-cta">Request Your AI Reputation Audit™ →</a></div>' +
      '</div>';
    document.body.appendChild(root);

    var fab = root.querySelector(".sm-chat-fab");
    var body = root.querySelector("#smChatBody");
    var quick = root.querySelector("#smChatQuick");
    var form = root.querySelector("#smChatForm");
    var input = root.querySelector("#smChatInput");

    function addMsg(text, from){
      var el = document.createElement("div");
      el.className = "sm-chat-msg " + (from === "user" ? "sm-chat-msg-user" : "sm-chat-msg-bot");
      el.textContent = text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }

    function addCta(cta){
      var el = document.createElement("a");
      el.className = "sm-chat-msg-cta";
      el.href = cta.href;
      el.textContent = cta.label + " →";
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }

    function renderQuick(){
      quick.innerHTML = "";
      QUICK_REPLIES.forEach(function(q){
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sm-chat-chip";
        btn.textContent = q.label;
        btn.addEventListener("click", function(){
          addMsg(q.label, "user");
          respond(byKey(q.key) || FALLBACK);
        });
        quick.appendChild(btn);
      });
    }

    function respond(match){
      window.setTimeout(function(){
        addMsg(match.reply, "bot");
        if (match.cta) addCta(match.cta);
      }, 380);
    }

    var greeted = false;
    function openPanel(){
      root.classList.add("sm-chat-open");
      fab.setAttribute("aria-expanded", "true");
      if (!greeted){
        greeted = true;
        addMsg(GREETING, "bot");
        renderQuick();
      }
      input.focus();
    }
    function closePanel(){
      root.classList.remove("sm-chat-open");
      fab.setAttribute("aria-expanded", "false");
    }

    fab.addEventListener("click", function(){
      if (root.classList.contains("sm-chat-open")) closePanel(); else openPanel();
    });

    form.addEventListener("submit", function(e){
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      addMsg(text, "user");
      input.value = "";
      respond(matchResponse(text) || FALLBACK);
    });
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
