// biome-ignore-all lint: dependency-free browser file in the padi.js (ES5) style, shared by the lab and the site.
/* Mina: the Myna Health mascot (component <myna-buddy>). The "lengkung m" icon with eyes on its arches, and the
   logo's cyan dot as a small pill beak. The still icon stays the brand mark (lab/brand/README.md);
   Mina is only for "live" moments (see lab/myna-mascot.html).

   <script src="myna-buddy.js" defer></script>
   <myna-buddy state="idle" size="44"></myna-buddy>
   <myna-buddy intro size="96"></myna-buddy>   starts as the still icon, transforms when it scrolls into view

   state: idle (default) · mikir (thinking) · kerja (working / loading) · sukses (done) ·
          gagal (gentle error: "it's okay, try again") · semangat (welcome back)
   size:  px, default 44, minimum 24. Below that use the still icon. Under 64 px the m fills the box
          (tight viewBox, bigger eyes); above, the box leaves room for the leap and confetti.
   intro: play the icon → buddy transformation once, when ≥ 60% visible. el.transform() plays it on demand.
          intro="manual": stay the still icon until tapped or until el.transform() is called.
   poke:  tap or click and it reacts (boing, wiggle, spin, wow; five quick taps = dizzy), with a word
          bubble and a light vibration on phones. Add nopoke to turn it off.
   label: accessible name (default "Mina, <state>").
   Events: myna:transformed (after the intro lands), myna:poke (detail.reaction).
   Respects prefers-reduced-motion: still poses, no transformation; expressions still change.
   No dependencies. Colours: --myna-ink (arches, default navy) and --myna-face (eyes, default white);
   on dark grounds set --myna-ink:#fff; --myna-face:#032b84.

   Awaken: <script src="myna-buddy.js" data-awaken=".logo-mark" data-after="5" defer></script>
   After N seconds of visible time, each matching still icon (an <img> or <svg> of logo-mark.svg,
   viewBox "4.75 16.75 55.25 37.5") turns into the buddy in place. Skipped with ?render=1 or ?reel=1. */
(function () {
  "use strict";
  if (window.customElements && customElements.get("myna-buddy")) return;
  var NS = "http://www.w3.org/2000/svg";
  var STATES = {
    idle: "siap",
    mikir: "sedang berpikir",
    kerja: "sedang menyiapkan",
    sukses: "berhasil",
    gagal: "ada kendala",
    semangat: "selamat datang lagi",
  };
  var CYAN = "#24dde2",
    BRAND = ["#032b84", "#113bfe", "#24dde2", "#5a9bff", "#dae7fc"];
  var INTRO_MS = 1500;
  // The icon on its 64-unit grid (same numbers as lab/build-brand.mjs).
  var M = "M9 50V30A9 9 0 0 1 27 30V50M27 30A9 9 0 0 1 45 30V50";
  var DOT = { x: 49, y: 40, w: 11, h: 11, rx: 5.5 }; // the logo dot (cx 54.5, cy 45.5, r 5.5) as a rect
  var BEAK = { x: 47.2, y: 20.4, w: 9.2, h: 5.4, rx: 2.7 }; // where the dot lands: a pill beak at eye height
  // The buddy's viewBox (square). Roomy at normal sizes for the leap, ring and confetti; tighter under
  // 40 px so the m fills the box and the face survives (moods may draw outside: overflow is visible).
  var VB = { x: -8, y: -8, w: 80, h: 80 },
    VB_SMALL = { x: 2, y: 5.5, w: 60, h: 60 };
  var SMALL = 64; // below this size: tight viewBox and bigger eyes
  function vbFor(size) {
    return size < SMALL ? VB_SMALL : VB;
  }
  var STYLE = [
    ":host{display:inline-block;position:relative;flex:none;width:var(--myna-size,44px);height:var(--myna-size,44px);vertical-align:middle;-webkit-tap-highlight-color:transparent}",
    ":host(:not([nopoke])){cursor:pointer}",
    "svg{width:100%;height:100%;overflow:visible;display:block}",
    ".m{stroke:var(--myna-ink,#032b84)}",
    "*{transform-box:fill-box}",
    // idle life
    ".bob{animation:bob 3.2s ease-in-out infinite}",
    "@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.4px)}}",
    ".eye{transform-origin:center;animation:blink 4.2s infinite}",
    "@keyframes blink{0%,86%,94%,100%{transform:scaleY(1)}90%{transform:scaleY(.12)}}",
    ".look{animation:look 7s ease-in-out infinite}",
    "@keyframes look{0%,30%,100%{transform:translate(0,0)}38%,55%{transform:translate(-1.2px,0)}62%,80%{transform:translate(1.1px,0)}}",
    ".up{transform:translate(.9px,-1.4px)}",
    // signature motion "Ngoceh": the beak opens for a moment. idle every 5 s, kerja continuously, sukses sings.
    ".bk-open{opacity:0}",
    ".chirp .bk-shut{animation:shut var(--chirp,5s) infinite}.chirp .bk-open{animation:open var(--chirp,5s) infinite}",
    "@keyframes shut{0%,7%,15%,100%{opacity:1}8%,14%{opacity:0}}",
    "@keyframes open{0%,7%,15%,100%{opacity:0}8%,14%{opacity:1}}",
    ".sing .bk-shut{opacity:0}.sing .bk-open{opacity:1}",
    ".dot{animation:dot 1.4s ease-in-out infinite;transform-origin:center}",
    ".dot:nth-child(2){animation-delay:.18s}.dot:nth-child(3){animation-delay:.36s}",
    "@keyframes dot{0%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}",
    ".jump{transform-origin:50% 100%;animation:jump 2.4s cubic-bezier(.3,.7,.4,1) infinite}",
    "@keyframes jump{0%,55%,100%{transform:translateY(0) scale(1,1)}8%{transform:translateY(0) scale(1.05,.93)}24%{transform:translateY(-5px) scale(.97,1.04)}40%{transform:translateY(0) scale(1.04,.95)}48%{transform:translateY(0) scale(1,1)}}",
    ".spark{transform-origin:center;animation:spark 2.4s ease-out infinite}",
    ".spark:nth-of-type(2){animation-delay:.12s}.spark:nth-of-type(3){animation-delay:.24s}",
    "@keyframes spark{0%,18%{transform:scale(0) rotate(0);opacity:0}30%{transform:scale(1.1) rotate(20deg);opacity:1}55%,100%{transform:scale(0) rotate(45deg);opacity:0}}",
    ".tilt{transform-origin:50% 100%;animation:tilt 5s ease-in-out infinite}",
    "@keyframes tilt{0%,100%{transform:rotate(-5deg) translateY(.6px)}50%{transform:rotate(-3deg) translateY(.6px)}}",
    ".lean{transform-origin:50% 100%;animation:lean 1.6s cubic-bezier(.3,.7,.4,1) infinite}",
    "@keyframes lean{0%,100%{transform:rotate(-4deg)}40%{transform:rotate(-7deg) translateY(-2px)}}",
    ".dash{animation:dash 1.6s ease-in-out infinite}",
    "@keyframes dash{0%,100%{opacity:.2;transform:translateX(0)}40%{opacity:1;transform:translateX(-2px)}}",
    // the transformation: icon (still) → squash → leap with a flash, a ring and confetti → the dot flies up and becomes the beak → eyes pop → lands
    ".ring,.burst>*{opacity:0}",
    ".i-wrap{transform-origin:50% 100%}.i-eyes,.ring{transform-origin:center}",
    ".intro:not(.go) .i-eyes,.intro:not(.go) .i-beak{opacity:0}",
    ".intro:not(.go) .bob,.intro:not(.go) .chirp *{animation:none}",
    ".intro:not(.go) .mood,.intro:not(.go) .burst,.intro:not(.go) .ring{opacity:0}",
    ".intro .i-dot{opacity:1}.intro:not(.go) .i-eyes{transform:scale(0)}",
    ".i-dot{opacity:0}",
    ".go .i-wrap{animation:leap 1.15s cubic-bezier(.3,.6,.35,1) both}",
    "@keyframes leap{0%{transform:translateY(0) scale(1,1)}14%{transform:translateY(0) scale(1.1,.86)}38%{transform:translateY(-8px) scale(.92,1.1)}58%{transform:translateY(0) scale(1.08,.92)}74%{transform:translateY(-1.4px) scale(.98,1.02)}88%,100%{transform:translateY(0) scale(1,1)}}",
    ".go .m{animation:flash .7s .38s ease-out}", // no fill: no filter at all outside the flash, so frame 0 rasterises exactly like the icon
    "@keyframes flash{0%{filter:brightness(1)}30%{filter:brightness(2.1) saturate(1.3)}100%{filter:brightness(1)}}",
    ".go .ring{animation:ring .9s .4s cubic-bezier(.2,.7,.3,1) forwards}",
    "@keyframes ring{0%{transform:scale(1);opacity:.75;stroke-width:2}100%{transform:scale(1.9);opacity:0;stroke-width:.3}}",
    ".go .burst>*{animation:burst 1s .42s cubic-bezier(.15,.75,.3,1) forwards}",
    "@keyframes burst{0%{transform:translate(0,0) scale(.4);opacity:0}14%{transform:translate(calc(var(--dx)*.62),calc(var(--dy)*.62)) scale(1.25);opacity:0}20%{transform:translate(calc(var(--dx)*.7),calc(var(--dy)*.7)) scale(1.2);opacity:1}65%{transform:translate(calc(var(--dx)*.92),calc(var(--dy)*.92)) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}", // invisible until it has cleared the mark, so nothing shows through the arch windows
    ".go .i-dot{animation:hide .08s .96s both}",
    "@keyframes hide{to{opacity:0}}",
    ".go .i-beak{animation:show .01s .96s both}",
    ".go .i-eyes{animation:pop .45s .68s cubic-bezier(.3,1.9,.5,1) both}",
    "@keyframes pop{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:1}}",
    "@keyframes show{from{opacity:0}to{opacity:1}}",
    ".go .mood{animation:show .3s 1.2s both}",
    // poke
    ".p-wrap{transform-origin:50% 100%}",
    ".pf{opacity:0}",
    ".s-idle:hover .face{opacity:0}.s-idle:hover .pf-happy{opacity:1}",
    ".r-boing .p-wrap{animation:boing .7s cubic-bezier(.3,.7,.4,1)}",
    "@keyframes boing{0%,100%{transform:none}15%{transform:scale(1.12,.86)}40%{transform:translateY(-6px) scale(.92,1.1)}65%{transform:translateY(0) scale(1.06,.94)}82%{transform:scale(.98,1.02)}}",
    ".r-wiggle .p-wrap{animation:wiggle .8s ease-in-out}",
    "@keyframes wiggle{0%,100%{transform:none}15%{transform:rotate(-12deg)}35%{transform:rotate(10deg)}55%{transform:rotate(-7deg)}75%{transform:rotate(4deg)}}",
    ".r-spin .p-wrap{transform-origin:50% 50%;animation:spin .85s cubic-bezier(.5,0,.2,1)}",
    "@keyframes spin{0%{transform:none}45%{transform:translateY(-6px) rotate(200deg)}100%{transform:translateY(0) rotate(360deg)}}",
    ".r-wow .p-wrap{transform-origin:50% 50%;animation:wow .7s cubic-bezier(.3,.7,.4,1)}",
    "@keyframes wow{0%,100%{transform:none}20%{transform:scale(1.18)}45%{transform:scale(.94)}70%{transform:scale(1.04)}}",
    ".r-boing .face,.r-spin .face,.r-wiggle .face,.r-wow .face,.r-dizzy .face{opacity:0}",
    ".r-boing .pf-happy,.r-spin .pf-happy{opacity:1}.r-wiggle .pf-wink{opacity:1}.r-wow .pf-wow{opacity:1}.r-dizzy .pf-dizzy{opacity:1}",
    ".r-boing .bk-shut,.r-wow .bk-shut,.r-spin .bk-shut{opacity:0}.r-boing .bk-open,.r-wow .bk-open,.r-spin .bk-open{opacity:1}",
    ".r-dizzy .p-wrap{transform-origin:50% 50%;animation:spin .6s linear 2}",
    ".pop>*{opacity:0}",
    ".r-pop .pop>*{animation:popout .75s cubic-bezier(.15,.75,.3,1) forwards}",
    "@keyframes popout{0%{transform:translate(0,0) scale(.4);opacity:0}15%{transform:translate(calc(var(--dx)*.3),calc(var(--dy)*.3)) scale(1.2);opacity:1}70%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}",
    ".bubble{position:absolute;left:50%;top:0;transform:translate(-50%,-100%) scale(.6);opacity:0;pointer-events:none;padding:5px 10px;border-radius:999px;background:#fff;color:#032b84;border:1px solid rgba(3,43,132,.14);font:600 12px/1.2 Montserrat,system-ui,-apple-system,'Segoe UI',sans-serif;white-space:nowrap;box-shadow:0 6px 18px rgba(3,43,132,.22);transition:opacity .15s,transform .3s cubic-bezier(.3,1.7,.5,1);z-index:5}",
    ".bubble.show{opacity:1;transform:translate(-50%,-100%) scale(1)}",
    ".bubble.below{top:auto;bottom:0;transform:translate(-50%,100%) scale(.6)}.bubble.below.show{transform:translate(-50%,100%) scale(1)}",
    "@media (prefers-reduced-motion:reduce){.bob,.eye,.look,.dot,.jump,.spark,.tilt,.lean,.dash,.p-wrap,.pop>*,.chirp *{animation:none!important}.spark{opacity:0}}",
  ].join("");

  var SHEET = null;
  try {
    if ("adoptedStyleSheets" in ShadowRoot.prototype) {
      SHEET = new CSSStyleSheet();
      SHEET.replaceSync(STYLE);
    }
  } catch (e) {
    SHEET = null;
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  var uid = 0;

  // Eye geometry on the arch tops. Bigger eyes when the buddy is small (the arch is 8.5 thick, so 5.6
  // still leaves a navy rim), so the face survives at 24 px.
  function eyes(small) {
    return small ? { w: 5.6, h: 7, y: 17.5, l: 15.7, r: 33.7 } : { w: 4.4, h: 6.6, y: 17.7, l: 16.3, r: 34.3 };
  }

  function draw(state, intro, small) {
    var id = "mb" + ++uid;
    var E = eyes(small),
      cx = function (x) {
        return x + E.w / 2;
      },
      V = small ? VB_SMALL : VB;
    var svg = el("svg", {
      viewBox: V.x + " " + V.y + " " + V.w + " " + V.h,
      "aria-hidden": "true",
      class: "s-" + state + (intro ? " intro" : ""),
    });
    if (intro)
      el("circle", { class: "ring", cx: 31, cy: 35, r: 24, fill: "none", stroke: CYAN, "stroke-width": 2 }, svg);
    var burst = intro ? el("g", { class: "burst" }, svg) : null; // behind the icon: confetti flies out from behind it
    var wrap = el("g", { class: "i-wrap" }, svg);
    var pwrap = el("g", { class: "p-wrap" }, wrap);
    var bodyCls = { idle: "bob", mikir: "bob", kerja: "bob", sukses: "jump", gagal: "tilt", semangat: "lean" }[state];
    var body = el("g", { class: bodyCls }, pwrap);
    el(
      "path",
      { class: "m", d: M, fill: "none", "stroke-width": 8.5, "stroke-linecap": "round", "stroke-linejoin": "round" },
      body,
    );

    // beak: the logo's dot, landed at eye height. Closed pill + open pair; "Ngoceh" swaps them.
    var chirp = { idle: "5s", mikir: "9s", kerja: ".7s", sukses: null, gagal: null, semangat: "1.6s" }[state];
    var beak = el("g", { class: "i-beak " + (state === "sukses" ? "sing" : chirp ? "chirp" : "") }, body);
    if (chirp) beak.style.setProperty("--chirp", chirp);
    el(
      "rect",
      { class: "bk-shut", x: BEAK.x, y: BEAK.y, width: BEAK.w, height: BEAK.h, rx: BEAK.rx, fill: CYAN },
      beak,
    );
    var open = el("g", { class: "bk-open", fill: CYAN }, beak);
    el("rect", { x: 47.2, y: 19, width: 9, height: 3.6, rx: 1.8 }, open);
    el("rect", { x: 47.2, y: 24.4, width: 7.2, height: 3.2, rx: 1.6 }, open);

    // face on the arch tops
    var eyeG = el("g", { class: "i-eyes" }, body);
    var face = el("g", { class: "face " + (state === "idle" ? "look" : state === "mikir" ? "up" : "") }, eyeG);
    var F = "var(--myna-face,#fff)";
    var arc = function (x, w) {
      return (
        "M" +
        (x - 0.4) +
        " " +
        (E.y + 4.6) +
        " Q" +
        (x + w / 2) +
        " " +
        (E.y + 0.4) +
        " " +
        (x + w + 0.4) +
        " " +
        (E.y + 4.6)
      );
    };
    if (state === "sukses") {
      el(
        "path",
        {
          d: arc(E.l, E.w) + " " + arc(E.r, E.w),
          stroke: F,
          "stroke-width": 2,
          fill: "none",
          "stroke-linecap": "round",
        },
        face,
      );
    } else if (state === "kerja") {
      // focused: narrowed eyes
      el("rect", { x: E.l, y: E.y + 1.8, width: E.w, height: E.h - 2.6, rx: E.w / 2, fill: F }, face);
      el("rect", { x: E.r, y: E.y + 1.8, width: E.w, height: E.h - 2.6, rx: E.w / 2, fill: F }, face);
    } else if (state === "gagal") {
      // gentle: calm, softly lowered eyes. Not sad, not ashamed.
      el(
        "path",
        {
          d:
            "M" +
            E.l +
            " " +
            (E.y + 3.4) +
            " Q" +
            cx(E.l) +
            " " +
            (E.y + 5.6) +
            " " +
            (E.l + E.w) +
            " " +
            (E.y + 3.4) +
            " M" +
            E.r +
            " " +
            (E.y + 3.4) +
            " Q" +
            cx(E.r) +
            " " +
            (E.y + 5.6) +
            " " +
            (E.r + E.w) +
            " " +
            (E.y + 3.4),
          stroke: F,
          "stroke-width": 1.9,
          fill: "none",
          "stroke-linecap": "round",
        },
        face,
      );
    } else {
      el("rect", { class: "eye", x: E.l, y: E.y, width: E.w, height: E.h, rx: E.w / 2, fill: F }, face);
      el("rect", { class: "eye", x: E.r, y: E.y, width: E.w, height: E.h, rx: E.w / 2, fill: F }, face);
    }
    // poke faces: happy, wink, surprised, dizzy
    el(
      "path",
      {
        class: "pf pf-happy",
        d: arc(E.l, E.w) + " " + arc(E.r, E.w),
        stroke: F,
        "stroke-width": 2,
        fill: "none",
        "stroke-linecap": "round",
      },
      eyeG,
    );
    var wink = el("g", { class: "pf pf-wink" }, eyeG);
    el("path", { d: arc(E.l, E.w), stroke: F, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, wink);
    el("rect", { x: E.r, y: E.y, width: E.w, height: E.h, rx: E.w / 2, fill: F }, wink);
    var wow = el("g", { class: "pf pf-wow", fill: F }, eyeG);
    el("circle", { cx: cx(E.l), cy: E.y + E.h / 2, r: E.w * 0.72 }, wow);
    el("circle", { cx: cx(E.r), cy: E.y + E.h / 2, r: E.w * 0.72 }, wow);
    var dz = function (x) {
      var a = x + 0.1,
        b = x + E.w - 0.1,
        t = E.y + 1,
        u = E.y + E.h - 1;
      return "M" + a + " " + t + " L" + b + " " + u + " M" + b + " " + t + " L" + a + " " + u;
    };
    el(
      "path",
      { class: "pf pf-dizzy", d: dz(E.l) + " " + dz(E.r), stroke: F, "stroke-width": 1.7, "stroke-linecap": "round" },
      eyeG,
    );

    // the flying dot: frame 0 sits exactly on the logo's dot; during the intro SMIL morphs it into the beak.
    var dot = el(
      "rect",
      { class: "i-dot", x: DOT.x, y: DOT.y, width: DOT.w, height: DOT.h, rx: DOT.rx, fill: CYAN },
      svg,
    );
    var shots = [];
    if (intro) {
      var spline = {
        calcMode: "spline",
        keyTimes: "0;1",
        keySplines: ".3 .7 .3 1",
        dur: ".42s",
        begin: "indefinite",
        fill: "freeze",
      };
      [
        ["x", DOT.x, BEAK.x],
        ["y", DOT.y, BEAK.y],
        ["width", DOT.w, BEAK.w],
        ["height", DOT.h, BEAK.h],
        ["rx", DOT.rx, BEAK.rx],
      ].forEach(function (a) {
        shots.push(el("animate", Object.assign({ attributeName: a[0], values: a[1] + ";" + a[2] }, spline), dot));
      });
      // an arc on the way up: a short hop above the beak's line before it settles
      shots.push(
        el(
          "animateTransform",
          {
            attributeName: "transform",
            type: "translate",
            values: "0 0;1.5 -7;0 0",
            keyTimes: "0;.55;1",
            calcMode: "spline",
            keySplines: ".3 .7 .3 1;.4 0 .3 1",
            dur: ".42s",
            begin: "indefinite",
            fill: "freeze",
          },
          dot,
        ),
      );
    }

    // moods
    if (state === "mikir") {
      var dots = el("g", { class: "mood", fill: "var(--myna-ink,#032b84)" }, svg);
      [
        [58, 10, 1.4],
        [63, 5.5, 1.8],
        [68.5, 0.5, 2.2],
      ].forEach(function (d) {
        el("circle", { class: "dot", cx: d[0], cy: d[1], r: d[2] }, dots);
      });
    }
    if (state === "sukses" || state === "semangat") {
      var sp = el("g", { class: "mood", fill: CYAN }, svg);
      (state === "sukses"
        ? [
            [58, 8, 1],
            [4, 6, 0.8],
            [64, 30, 0.7],
          ]
        : [[60, 9, 0.8]]
      ).forEach(function (s) {
        var x = s[0],
          y = s[1],
          r = 3.2 * s[2],
          w = r * 0.28;
        el(
          "path",
          {
            class: "spark",
            d:
              "M" +
              x +
              " " +
              (y - r) +
              " L" +
              (x + w) +
              " " +
              (y - w) +
              " L" +
              (x + r) +
              " " +
              y +
              " L" +
              (x + w) +
              " " +
              (y + w) +
              " L" +
              x +
              " " +
              (y + r) +
              " L" +
              (x - w) +
              " " +
              (y + w) +
              " L" +
              (x - r) +
              " " +
              y +
              " L" +
              (x - w) +
              " " +
              (y - w) +
              "Z",
          },
          sp,
        );
      });
    }
    if (state === "semangat") {
      // two little speed lines behind: ready to go again
      var ln = el("g", { class: "mood", stroke: CYAN, "stroke-width": 2, "stroke-linecap": "round" }, svg);
      el("path", { class: "dash", d: "M-4 30 H2" }, ln);
      el("path", { class: "dash", d: "M-6 38 H1" }, ln).style.animationDelay = ".2s"; // CSSOM, not a style attribute (CSP)
    }

    if (burst) {
      // confetti in brand colours: dots and little pills, like the beak
      for (var i = 0; i < 16; i++) {
        var a = (i / 16) * Math.PI * 2 + (i % 2 ? 0.18 : 0),
          d = 32 + (i % 3) * 7;
        var c =
          i % 4 === 0
            ? el("rect", { x: 28, y: 33, width: 6, height: 3, rx: 1.5, fill: CYAN }, burst)
            : el("circle", { cx: 31, cy: 34.5, r: 1.7 + (i % 3) * 0.6, fill: BRAND[i % BRAND.length] }, burst);
        c.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px");
        c.style.setProperty("--dy", (Math.sin(a) * d).toFixed(1) + "px");
        c.style.animationDelay = 0.42 + (i % 3) * 0.04 + "s";
      }
    }
    var pop = el("g", { class: "pop" }, svg);
    for (var j = 0; j < 8; j++) {
      var b = (j / 8) * Math.PI * 2 - Math.PI / 2 + 0.2,
        r2 = 30 + (j % 2) * 5;
      var q = el("circle", { cx: 31, cy: 32, r: 1.4 + (j % 3) * 0.45, fill: BRAND[(j + 1) % BRAND.length] }, pop);
      q.style.setProperty("--dx", (Math.cos(b) * r2).toFixed(1) + "px");
      q.style.setProperty("--dy", (Math.sin(b) * r2).toFixed(1) + "px");
    }
    svg._shots = shots;
    svg._id = id;
    return svg;
  }

  var WORDS = {
    id: { boing: "Hehe, hai!", wiggle: "Geli, ah!", spin: "Wiii!", wow: "Eh, halo!", dizzy: "Pusing… pelan-pelan, ya" },
    en: { boing: "Hehe, hi!", wiggle: "That tickles!", spin: "Wheee!", wow: "Oh, hello!", dizzy: "So dizzy… easy now" },
  };

  class MynaBuddy extends HTMLElement {
    static get observedAttributes() {
      return ["state", "size", "label"];
    }
    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
      // A constructed stylesheet is CSSOM, not an inline <style>, so a strict CSP (style-src without
      // 'unsafe-inline', as on mynahealth.id) still applies it. <style> is only the fallback.
      if (SHEET) this._root.adoptedStyleSheets = [SHEET];
      else {
        var st = document.createElement("style");
        st.textContent = STYLE;
        this._root.appendChild(st);
      }
      this._played = false;
    }
    connectedCallback() {
      this._render();
      var self = this;
      if (this.hasAttribute("intro") && this.getAttribute("intro") !== "manual" && !this._still()) {
        if ("IntersectionObserver" in window) {
          this._io = new IntersectionObserver(
            function (es) {
              es.forEach(function (e) {
                if (e.isIntersecting && !self._played) {
                  self._io.disconnect();
                  setTimeout(function () {
                    self.transform();
                  }, 180);
                }
              });
            },
            { threshold: 0.6 },
          );
          this._io.observe(this);
        } else this.transform();
      }
      if (!this._wired) {
        this._wired = true;
        this.addEventListener("click", function (e) {
          if (self.hasAttribute("nopoke")) return;
          if (self.closest("a")) {
            e.preventDefault();
            e.stopPropagation();
          } // poking the buddy in a nav logo link must not navigate
          if (self.hasAttribute("intro") && !self._played) self.transform();
          else self.poke(e);
        });
      }
    }
    disconnectedCallback() {
      if (this._io) this._io.disconnect();
    }
    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }
    _still() {
      return matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    _state() {
      var s = this.getAttribute("state") || "idle";
      return STATES[s] ? s : "idle";
    }
    _size() {
      return Math.max(24, parseFloat(this.getAttribute("size")) || 44);
    }
    /** Play the icon → buddy transformation (again). Dispatches "myna:transformed" when it lands. */
    transform() {
      if (this._still()) return;
      this._played = true;
      var svg = draw(this._state(), true, this._size() < SMALL);
      this._swap(svg);
      void svg.getBoundingClientRect(); // first painted frame = the still icon
      svg.classList.add("go");
      // SMIL starts relative to the svg's own clock, so a recorder can seek it (setCurrentTime).
      var t0 = svg.getCurrentTime ? svg.getCurrentTime() : 0;
      svg._t0 = t0;
      (svg._shots || []).forEach(function (a) {
        try {
          a.beginElementAt(0.52);
        } catch (e) {}
      });
      var self = this;
      clearTimeout(this._t);
      this._t = setTimeout(function () {
        self.dispatchEvent(new CustomEvent("myna:transformed", { bubbles: true }));
      }, INTRO_MS);
    }
    /** React to a tap: boing, wiggle, spin, wow in turn; five quick taps make it dizzy. Dispatches "myna:poke". */
    poke(e) {
      var svg = this._root.querySelector("svg");
      if (!svg) return;
      var now = Date.now();
      this._recent = (this._recent || [])
        .filter(function (t) {
          return now - t < 2500;
        })
        .concat(now);
      this._n = (this._n || 0) + 1;
      var R = ["boing", "wiggle", "spin", "wow"],
        r = this._recent.length >= 5 ? "dizzy" : R[(this._n - 1) % R.length];
      if (r === "dizzy") this._recent = [];
      var still = this._still();
      svg.classList.remove("r-boing", "r-wiggle", "r-spin", "r-wow", "r-dizzy", "r-pop");
      void svg.getBoundingClientRect(); // restart even on rapid taps
      svg.classList.add("r-" + r);
      if (!still) svg.classList.add("r-pop");
      clearTimeout(this._pt);
      this._pt = setTimeout(
        function () {
          svg.classList.remove("r-" + r, "r-pop");
        },
        r === "dizzy" ? 1400 : 950,
      );
      var lang = /^id/i.test(document.documentElement.lang || "id") ? "id" : "en";
      var bub = this._root.querySelector(".bubble");
      if (!bub) {
        bub = document.createElement("div");
        bub.className = "bubble";
        bub.setAttribute("aria-live", "polite");
        this._root.appendChild(bub);
      }
      bub.textContent = WORDS[lang][r];
      bub.classList.toggle("below", this.getBoundingClientRect().top < 48); // near the top (nav logo): show it underneath
      bub.classList.remove("show");
      void bub.offsetWidth;
      bub.classList.add("show");
      clearTimeout(this._bt);
      this._bt = setTimeout(function () {
        bub.classList.remove("show");
      }, 1200);
      if (e && e.pointerType === "touch" && navigator.vibrate) navigator.vibrate(12);
      this.dispatchEvent(new CustomEvent("myna:poke", { bubbles: true, detail: { reaction: r } }));
    }
    _swap(svg) {
      var old = this._root.querySelector("svg");
      if (old) this._root.replaceChild(svg, old);
      else this._root.insertBefore(svg, this._root.querySelector(".bubble"));
      if (this._still()) svg.pauseAnimations();
    }
    _render() {
      var state = this._state(),
        size = this._size();
      this.style.setProperty("--myna-size", size + "px");
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.getAttribute("label") || "Mina, " + STATES[state]);
      var pending = this.hasAttribute("intro") && !this._played && !this._still();
      var svg = draw(state, pending, size < SMALL);
      this._swap(svg);
      if (pending) svg.pauseAnimations(); // the icon is still until it transforms
    }
  }
  customElements.define("myna-buddy", MynaBuddy);

  // Awaken: after N seconds of visible time, a still icon turns into the buddy, landing exactly on it.
  function awaken(mark, after) {
    if (!mark || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var seen = 0,
      last = performance.now();
    var tick = setInterval(function () {
      var now = performance.now();
      if (document.visibilityState === "visible") seen += now - last;
      last = now;
      if (seen < after * 1000) return;
      clearInterval(tick);
      var host = mark.parentNode;
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      var b = document.createElement("myna-buddy");
      b.setAttribute("aria-hidden", "true");
      b.setAttribute("intro", "");
      b.style.position = "absolute";
      function place() {
        // the icon's box (x 4.75, y 16.75, 55.25 × 37.5) inside the buddy's viewBox
        var m = mark.getBoundingClientRect(),
          h = host.getBoundingClientRect();
        var V = vbFor((m.width * VB.w) / 55.25),
          size = (m.width * V.w) / 55.25;
        if (vbFor(size) !== V) {
          V = vbFor(size);
          size = (m.width * V.w) / 55.25;
        }
        b.setAttribute("size", size.toFixed(2));
        b.style.left = (m.left - h.left - ((4.75 - V.x) * size) / V.w).toFixed(2) + "px";
        b.style.top = (m.top - h.top - ((16.75 - V.y) * size) / V.w).toFixed(2) + "px";
      }
      place();
      b._played = false;
      host.insertBefore(b, mark.nextSibling);
      b._io && b._io.disconnect();
      b.transform(); // first painted frame = the still icon, so the swap is invisible
      mark.style.visibility = "hidden";
      addEventListener("resize", place);
    }, 250);
  }
  var me = document.currentScript;
  var recording = /[?&](render|reel)=1\b/.test(location.search);
  if (me && me.dataset.awaken && !recording) {
    var start = function () {
      document.querySelectorAll(me.dataset.awaken).forEach(function (m) {
        awaken(m, +me.dataset.after || 5);
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})();
