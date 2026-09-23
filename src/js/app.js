/* ---- появление блоков и счётчики ---- */
var reduce =
   window.matchMedia &&
   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el) {
   var txt = el.textContent,
      m = txt.match(/^(\d+)/);
   if (!m) return;
   var target = parseInt(m[1], 10),
      rest = txt.slice(m[1].length),
      start = 0,
      dur = 900;
   if (target === 0) return;
   requestAnimationFrame(function tick(now) {
      if (!start) start = now;
      var p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + rest;
      if (p < 1) requestAnimationFrame(tick);
   });
}

if (!reduce && 'IntersectionObserver' in window) {
   var targets = Array.prototype.slice.call(
      document.querySelectorAll(
         '.sec-head,.scheme,.fork,.pains,.tiers,.addons,.custom-grid,.quiz,.steps,.youneed,.cases,.cross,.tablewrap,.faq,.chan,#briefForm'
      )
   );
   document.body.classList.add('reveal');
   targets.forEach(function (el) {
      el.setAttribute('data-rv', '');
   });
   var io = new IntersectionObserver(
      function (entries) {
         entries.forEach(function (e) {
            if (e.isIntersecting) {
               e.target.classList.add('in');
               io.unobserve(e.target);
            }
         });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
   );
   targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight)
         el.classList.add('in');
      else io.observe(el);
   });

   var so = new IntersectionObserver(
      function (entries) {
         entries.forEach(function (e) {
            if (e.isIntersecting) {
               countUp(e.target);
               so.unobserve(e.target);
            }
         });
      },
      { threshold: 0.6 }
   );
   document.querySelectorAll('.stat b').forEach(function (el) {
      so.observe(el);
   });
}
