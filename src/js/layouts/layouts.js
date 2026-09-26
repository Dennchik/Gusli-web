//* ✅ - [ Hiding an element when scrolling ]
export function shadowScrollHeader() {
   const handleScroll = () => {
      const headerMain = document.querySelector('.page__header');
      const pageContainer = document.querySelector('.page__main-content');
      const pageContainerTop = pageContainer.getBoundingClientRect().top;

      if (headerMain) {
         if (pageContainerTop < -50) {
            headerMain.classList.add('with-shadow');
         } else if (pageContainerTop <= 0) {
            headerMain.classList.remove('with-shadow');
         }
      }
   };

   window.addEventListener('scroll', handleScroll);
   //🔹 Очистка слушателя событий при размонтировании компонента
   return () => {
      window.removeEventListener('scroll', handleScroll);
   };
}

//* ============================================================================
//* Общее состояние страницы: цены пакетов и текущая выбранная сборка.
//* Нужно и калькулятору, и квизу — квиз может переключить пакет по результату.
//* ============================================================================
const BASE_PRICES = { Лендинг: 59000, Сайт: 149000, Сервис: 290000 };
let currentPackage = 'Сайт';
let basePrice = BASE_PRICES['Сайт'];

//* Форматирование цены: разделители тысяч из NBSP меняем на обычный пробел
const formatPrice = (n) =>
   n.toLocaleString('ru-RU').replace(/\u00A0/g, ' ') + ' ₽';

//* Пересчёт итога калькулятора: базовая цена пакета + сумма отмеченных допов.
//* Элементы ищем на каждый вызов — работает и после перерисовки DOM
function recalcSummary() {
   const sumEl = document.getElementById('sum');
   if (!sumEl) return;

   let total = basePrice || 0;
   document.querySelectorAll('.addon input').forEach((box) => {
      if (box.checked) total += parseInt(box.dataset.price, 10);
   });

   sumEl.textContent = formatPrice(total);

   const baseNameEl = document.getElementById('baseName');
   const basePriceEl = document.getElementById('basePrice');
   if (baseNameEl) baseNameEl.textContent = currentPackage;
   if (basePriceEl) {
      basePriceEl.textContent = basePrice
         ? formatPrice(basePrice)
         : 'по смете';
   }
}

//* Выбор пакета: имя и цена берутся из карточки .tier (или из данных квиза),
//* карточка помечается классом selected, калькулятор пересчитывается
function selectTier(name, price) {
   currentPackage = name;
   if (price) basePrice = price;
   document.querySelectorAll('.section-bundle__tier').forEach((tier) => {
      const tierName = tier.querySelector('.tier__name')?.textContent.trim();
      tier.classList.toggle('selected', tierName === name);
   });
   recalcSummary();
}

//* Цена из текста карточки вида «59 000 ₽» → число 59000
const parsePrice = (text) => parseInt(String(text).replace(/\D/g, ''), 10);

//* ✅ - [ Калькулятор стоимости: чекбоксы допов и выбор пакета кнопкой «Выбрать …» ]
//* Делегирование: 'change' ловим на документе для .addon input, 'click' —
//* только для кнопок [data-pick] внутри карточек; клик по телу карточки
//* выделение не меняет
export function initCalculator() {
   if (!document.getElementById('sum')) return;

   document.addEventListener('change', (e) => {
      if (e.target.matches('.addon input')) recalcSummary();
   });

   document.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-pick]');
      if (!pick) return;

      const tier = pick.closest('.section-bundle__tier');
      // Имя и цена берутся из карточки, при отсутствии — из data-pick и прайса
      const name = tier
         ? tier.querySelector('.tier__name')?.textContent.trim()
         : pick.dataset.pick;
      const price = tier
         ? parsePrice(tier.querySelector('.tier__price b')?.textContent)
         : BASE_PRICES[pick.dataset.pick];
      if (!name || Number.isNaN(price)) return;

      selectTier(name, price);
   });

   recalcSummary();
}

//* ============================================================================
//* Данные квиза: описания пакетов для выдачи результата подбора
//* ============================================================================
const QUIZ_PLANS = {
   Лендинг: {
      track: 'ТРЕК A · ПАКЕТ',
      price: '59 000 ₽',
      term: '7–10 дней',
      desc: 'Одна страница: структура под оффер, быстрая вёрстка кодом, форма и аналитика.',
   },
   Сайт: {
      track: 'ТРЕК A · ПАКЕТ',
      price: '149 000 ₽',
      term: '3–4 недели',
      desc: 'До 10 страниц с админкой, дизайном под бренд и SEO-базой.',
   },
   Сервис: {
      track: 'ТРЕК A · ПАКЕТ',
      price: '290 000 ₽',
      term: '5–7 недель',
      desc: 'Каталог, оплата или запись, интеграция с CRM и базовый личный кабинет.',
   },
   Кастом: {
      track: 'ТРЕК B · КАСТОМ',
      price: 'от 450 000 ₽',
      term: 'от 10 недель',
      desc: 'Проект со сметой по этапам: аналитика, прототип, дизайн-система, разработка, поддержка.',
   },
};

//* ✅ - [ Квиз подбора: шаги, баллы ответов и выдача результата ]
//* Делегирование: один 'click' на документе обрабатывает варианты (.opt),
//* кнопку «Назад» (#qBack) и сброс (#qReset) — работает для любых копий квиза
export function initQuiz() {
   const qBody = document.getElementById('quizBody');
   if (!qBody) return;

   const qResult = document.getElementById('qResult');
   const qLabel = document.getElementById('qLabel');
   const qHint = document.getElementById('qHint');
   const qBack = document.getElementById('qBack');
   const pips = document.querySelectorAll('.quiz__steps i');

   const answers = { task: null, budget: null, term: null };
   const scores = { task: 0, budget: 0, term: 0 };
   let step = 1;

   //* Показать шаг n: переключает активный вопрос, пипсы прогресса и подпись
   const setStep = (n) => {
      step = n;
      document.querySelectorAll('.qstep').forEach((s) => {
         s.classList.toggle('on', +s.dataset.step === n);
      });
      pips.forEach((p, i) => {
         p.classList.toggle('on', i < n);
      });
      qLabel.textContent = 'Шаг ' + n + ' из 3';
      qBack.disabled = n === 1;
      const key = ['task', 'budget', 'term'][n - 1];
      qHint.textContent = answers[key]
         ? 'Выбрано: ' + answers[key]
         : 'Выберите вариант';
   };

   //* Подставить ответ квиза в select брифа; если такого option нет — добавить
   const setSelect = (sel, value) => {
      const found = Array.from(sel.options).some(
         (o) => o.value === value || o.text === value,
      );
      if (!found) {
         sel.add(new Option(value, value, true, true));
      } else {
         sel.value = value;
      }
   };

   //* Итог подбора: сумма баллов решает пакет; пишет результат в панель,
   //* переключает калькулятор на выбранный пакет и переносит ответы в бриф
   const decide = () => {
      const total = scores.task + scores.budget + scores.term;
      let name;
      if (scores.task >= 6 || scores.budget >= 6) name = 'Кастом';
      else if (total <= 4) name = 'Лендинг';
      else if (total <= 7) name = 'Сайт';
      else if (total <= 11) name = 'Сервис';
      else name = 'Кастом';

      const p = QUIZ_PLANS[name];
      document.getElementById('rTrack').textContent = p.track;
      document.getElementById('rName').textContent = name;
      document.getElementById('rDesc').textContent = p.desc;
      document.getElementById('rPrice').textContent = p.price;
      document.getElementById('rTerm').textContent = p.term;

      const why = document.getElementById('rWhy');
      why.innerHTML = '';
      [
         ['Задача', answers.task],
         ['Бюджет', answers.budget],
         ['Срок', answers.term],
      ].forEach((pair) => {
         const li = document.createElement('li');
         li.textContent = pair[0] + ': ' + pair[1];
         why.appendChild(li);
      });
      const note = document.createElement('li');
      note.textContent =
         name === 'Кастом'
            ? 'Под такую задачу пакет не подойдёт — начнём с бесплатной диагностики и сметы по этапам.'
            : 'Задача попадает в готовый пакет: цена и срок фиксируются в договоре до старта.';
      why.appendChild(note);

      qBody.style.display = 'none';
      qResult.classList.add('on');
      qLabel.textContent = 'Результат подбора';
      pips.forEach((p) => {
         p.classList.add('on');
      });

      if (BASE_PRICES[name]) {
         selectTier(name, BASE_PRICES[name]);
      }

      const f = document.getElementById('briefForm');
      if (answers.task) setSelect(f.task, answers.task);
      if (answers.budget) setSelect(f.budget, answers.budget);
      if (answers.term) setSelect(f.term, answers.term);
   };

   document.addEventListener('click', (e) => {
      //* Вариант ответа: снимаем выделение с кнопок того же вопроса,
      //* запоминаем ответ/баллы и через паузу идём к следующему шагу
      const opt = e.target.closest('.opt');
      if (opt) {
         const q = opt.dataset.q;
         document.querySelectorAll('.opt[data-q="' + q + '"]').forEach((b) => {
            b.setAttribute('aria-pressed', 'false');
         });
         opt.setAttribute('aria-pressed', 'true');
         answers[q] = opt.dataset.v;
         scores[q] = parseInt(opt.dataset.score, 10);
         qHint.textContent = 'Выбрано: ' + answers[q];
         setTimeout(() => {
            if (step < 3) setStep(step + 1);
            else decide();
         }, 180);
         return;
      }

      if (e.target.closest('#qBack')) {
         if (step > 1) setStep(step - 1);
         return;
      }

      if (e.target.closest('#qReset')) {
         Object.assign(answers, { task: null, budget: null, term: null });
         Object.assign(scores, { task: 0, budget: 0, term: 0 });
         document.querySelectorAll('.opt').forEach((b) => {
            b.setAttribute('aria-pressed', 'false');
         });
         qResult.classList.remove('on');
         qBody.style.display = '';
         pips.forEach((p) => {
            p.classList.remove('on');
         });
         setStep(1);
      }
   });

   setStep(1);
}

//* ✅ - [ Бриф-форма: валидация, сборка текста заявки, копирование и сброс ]
//* Делегирование: 'submit' ловим на документе и проверяем id формы,
//* клики по #copyBtn и #againBtn обрабатываем тем же способом
export function initBriefForm() {
   const form = document.getElementById('briefForm');
   if (!form) return;

   const sentBox = document.getElementById('sentBox');
   const sentText = document.getElementById('sentText');
   const formErr = document.getElementById('formErr');

   //* Валидация: имя, контакт и согласие обязательны. При успехе собираем
   //* читаемый текст заявки (с результатом квиза и суммой) и показываем sentBox
   document.addEventListener('submit', (e) => {
      if (e.target !== form) return;
      e.preventDefault();

      const d = new FormData(form);
      if (
         !String(d.get('name') || '').trim() ||
         !String(d.get('contact') || '').trim() ||
         !d.get('ok')
      ) {
         formErr.style.display = 'block';
         return;
      }
      formErr.style.display = 'none';

      sentText.textContent = [
         'ЗАЯВКА — GUSLI WEB',
         '—————————————',
         'Имя:      ' + d.get('name'),
         'Контакт:  ' + d.get('contact'),
         'Задача:   ' + d.get('task'),
         'Бюджет:   ' + d.get('budget'),
         'Срок:     ' + d.get('term'),
         'Подбор:   ' + (document.getElementById('rName').textContent || '—'),
         'Сборка:   ' + document.getElementById('sum').textContent,
         '',
         'О проекте:',
         String(d.get('about') || '—'),
      ].join('\n');

      form.style.display = 'none';
      sentBox.classList.add('on');
      sentBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
   });

   document.addEventListener('click', (e) => {
      //* Копирование собранного брифа в буфер обмена
      const copyBtn = e.target.closest('#copyBtn');
      if (copyBtn) {
         navigator.clipboard.writeText(sentText.textContent).then(
            () => {
               copyBtn.textContent = 'Скопировано';
               setTimeout(() => {
                  copyBtn.textContent = 'Скопировать бриф';
               }, 1800);
            },
            () => {
               copyBtn.textContent = 'Выделите текст вручную';
            },
         );
         return;
      }

      //* «Изменить» — спрятать отправленный бриф и вернуть форму
      if (e.target.closest('#againBtn')) {
         sentBox.classList.remove('on');
         form.style.display = '';
      }
   });
}

//* ✅ - [ Появление блоков при скролле и анимация счётчиков ]
//* IntersectionObserver: блоки из списка получают data-rv и класс in, когда
//* оказываются во вьюпорте; цифры .stat b анимируются countUp-ом.
//* Уважает prefers-reduced-motion и молча выходит, если блоков нет на странице
export function initRevealAnimations() {
   const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (reduce || !('IntersectionObserver' in window)) return;

   //* Плавный счётчик: анимирует ведущее число в тексте элемента за 900мс
   function countUp(el) {
      const txt = el.textContent;
      const m = txt.match(/^(\d+)/);
      if (!m) return;
      const target = parseInt(m[1], 10);
      const rest = txt.slice(m[1].length);
      if (target === 0) return;
      let start = 0;
      const dur = 900;
      requestAnimationFrame(function tick(now) {
         if (!start) start = now;
         const p = Math.min(1, (now - start) / dur);
         el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + rest;
         if (p < 1) requestAnimationFrame(tick);
      });
   }

   const targets = Array.from(
      document.querySelectorAll(
         '.sec-head,.scheme,.fork,.pains,.tiers,.addons,.custom-grid,.quiz,.steps,.you-need,.cases,.cross,.tablewrap,.faq,.chan,#briefForm',
      ),
   );
   document.body.classList.add('reveal');
   targets.forEach((el) => {
      el.setAttribute('data-rv', '');
   });

   const io = new IntersectionObserver(
      (entries) => {
         entries.forEach((e) => {
            if (e.isIntersecting) {
               e.target.classList.add('in');
               io.unobserve(e.target);
            }
         });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
   );
   targets.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight)
         el.classList.add('in');
      else io.observe(el);
   });

   const so = new IntersectionObserver(
      (entries) => {
         entries.forEach((e) => {
            if (e.isIntersecting) {
               countUp(e.target);
               so.unobserve(e.target);
            }
         });
      },
      { threshold: 0.6 },
   );
   document.querySelectorAll('.stat b').forEach((el) => {
      so.observe(el);
   });
}
