/* ================================================================
   UPRI MANZIL — Animation & Interaction Engine v2.0
   Three.js · GSAP · Vanilla JS
   ================================================================ */

(function () {
  'use strict';

  // ----------------------------------------------------------------
  // THREE.JS STARFIELD
  // ----------------------------------------------------------------
  function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 60;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particle system
    const count = 280;
    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArr[i3]     = (Math.random() - 0.5) * 260;
      posArr[i3 + 1] = (Math.random() - 0.5) * 260;
      posArr[i3 + 2] = (Math.random() - 0.5) * 120;

      const isGold = Math.random() > 0.55;
      if (isGold) {
        colArr[i3] = 0.957; colArr[i3+1] = 0.686; colArr[i3+2] = 0.38; // amber
      } else {
        const v = 0.7 + Math.random() * 0.3;
        colArr[i3] = v; colArr[i3+1] = v; colArr[i3+2] = v; // star white
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.55,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Mouse tracking
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let rafId;
    let paused = false;
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
      if (!paused) loop();
    });

    let t = 0;
    function loop() {
      if (paused) return;
      rafId = requestAnimationFrame(loop);
      t += 0.001;

      // Lerp mouse
      tmx += (mx - tmx) * 0.03;
      tmy += (my - tmy) * 0.03;

      points.rotation.y = t * 0.03 + tmx * 0.06;
      points.rotation.x = tmy * 0.04;
      points.position.x = tmx * 8;
      points.position.y = -tmy * 6;

      // Breathing scale
      points.scale.setScalar(1 + Math.sin(t * 0.5) * 0.015);

      renderer.render(scene, camera);
    }
    loop();

    window.addEventListener('resize', () => {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });
  }

  // ----------------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------------
  function initNav() {
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.nav__burger');
    const mobileMenu = document.querySelector('.nav__mobile');
    const mobileLinks = document.querySelectorAll('.nav__mobile a');

    if (!nav) return;

    // Scroll shrink
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
      mobileLinks.forEach(l => {
        l.addEventListener('click', () => {
          burger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__links a');
    if (sections.length && navLinks.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
            if (active) active.classList.add('active');
          }
        });
      }, { threshold: 0.35 });
      sections.forEach(s => io.observe(s));
    }
  }

  // ----------------------------------------------------------------
  // GSAP ANIMATIONS
  // ----------------------------------------------------------------
  function initGSAP() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        gsap.to(window, {
          duration: 1.2,
          scrollTo: { y: target, offsetY: 80 },
          ease: 'power3.inOut',
        });
      });
    });

    // ---- HERO REVEAL ----
    const heroWords = document.querySelectorAll('.hero__h1 .word');
    if (heroWords.length) {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.to(heroWords, {
        y: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: 'expo.out',
      })
      .to('.hero__label', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')
      .to('.hero__sub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .to('.hero__ctas', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .to('.hero__card', { opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .to('.hero__scroll', { opacity: 1, duration: 0.6 }, '-=0.2');
    }

    // Hero bg parallax
    const heroBgImg = document.querySelector('.hero__bg img');
    if (heroBgImg) {
      gsap.to(heroBgImg, {
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
        y: '25%',
        scale: 1.0,
        ease: 'none',
      });
    }

    // ---- SECTION REVEALS ----
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        onEnter: () => el.classList.add('revealed'),
        once: true,
      });
    });

    // ---- ABOUT STATS COUNTER ----
    document.querySelectorAll('.about__stat-val[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.floor(this.targets()[0].val) + (el.dataset.suffix || '');
            },
          });
        },
      });
    });

    // ---- MOMENT PANELS ----
    gsap.utils.toArray('.moment-panel').forEach((panel, i) => {
      gsap.from(panel, {
        scrollTrigger: { trigger: panel, start: 'top 80%', once: true },
        opacity: 0,
        y: 50,
        duration: 0.9,
        delay: i * 0.14,
        ease: 'power3.out',
      });
    });

    // ---- GALLERY MOSAIC ----
    gsap.utils.toArray('.gallery-mosaic__item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        opacity: 0,
        scale: 0.94,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'back.out(1.2)',
      });
    });

    // ---- GALLERY MASONRY ----
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        opacity: 0,
        scale: 0.92,
        y: 30,
        duration: 0.7,
        delay: i * 0.06,
        ease: 'power3.out',
      });
    });

    // ---- MENU CARDS ----
    gsap.utils.toArray('.menu-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
      });
    });

    // ---- SIG ITEMS ----
    gsap.utils.toArray('.sig-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 82%', once: true },
        opacity: 0,
        x: 30,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'power3.out',
      });
    });

    // ---- LOC ITEMS ----
    gsap.utils.toArray('.loc-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        opacity: 0,
        x: 30,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
      });
    });

    // ---- ORNAMENTAL SVG DRAW ----
    document.querySelectorAll('.ornament__line').forEach(line => {
      gsap.from(line, {
        scrollTrigger: { trigger: line, start: 'top 85%', once: true },
        scaleX: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
  }

  // ----------------------------------------------------------------
  // MARQUEE
  // ----------------------------------------------------------------
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    // Clone content for seamless loop
    track.innerHTML += track.innerHTML;
  }

  // ----------------------------------------------------------------
  // MAGNETIC BUTTONS
  // ----------------------------------------------------------------
  function initMagnetic() {
    document.querySelectorAll('.btn--magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ----------------------------------------------------------------
  // MENU FILTERING
  // ----------------------------------------------------------------
  function initMenuFilters() {
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.menu-card');
    const searchInput = document.querySelector('.menu-search input');
    if (!pills.length) return;

    let currentFilter = 'all';
    let currentSearch = '';

    function applyFilters() {
      cards.forEach(card => {
        const cat = card.dataset.category || '';
        const name = (card.querySelector('.menu-card__name')?.textContent || '').toLowerCase();
        const matchFilter = currentFilter === 'all' || cat === currentFilter;
        const matchSearch = !currentSearch || name.includes(currentSearch);
        const show = matchFilter && matchSearch;

        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            opacity: show ? 1 : 0.2,
            scale: show ? 1 : 0.96,
            duration: 0.4,
            ease: 'power2.out',
            pointerEvents: show ? 'auto' : 'none',
          });
        } else {
          card.style.opacity = show ? '1' : '0.2';
        }
      });
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter || 'all';
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase().trim();
        applyFilters();
      });
    }
  }

  // ----------------------------------------------------------------
  // GALLERY FILTERS
  // ----------------------------------------------------------------
  function initGalleryFilters() {
    const pills = document.querySelectorAll('.gallery-filters .filter-pill');
    const items = document.querySelectorAll('.gallery-item');
    if (!pills.length) return;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter || 'all';
        items.forEach(item => {
          const cat = item.dataset.cat || '';
          const show = filter === 'all' || cat === filter;
          if (typeof gsap !== 'undefined') {
            gsap.to(item, { opacity: show ? 1 : 0.15, scale: show ? 1 : 0.95, duration: 0.4, ease: 'power2.out' });
          }
        });
      });
    });
  }

  // ----------------------------------------------------------------
  // MENU PREVIEW — CATEGORY HOVER IMAGE SWAP
  // ----------------------------------------------------------------
  function initMenuCatSwap() {
    const lines = document.querySelectorAll('.menu-cat-line');
    const dishName = document.querySelector('.menu-prev__dish-name');
    const dishPrice = document.querySelector('.menu-prev__dish-price');
    const dishImg = document.querySelector('.menu-prev__dish img');
    if (!lines.length || !dishImg) return;

    const data = {
      cocktails:     { name: 'Golden Hour Martini',    price: '₹750',  emoji: '🍸' },
      'small-plates':{ name: 'Saffron Paneer Bites',   price: '₹450',  emoji: '🥢' },
      'wood-fired':  { name: 'Tandoori Lamb Chops',    price: '₹980',  emoji: '🔥' },
      mains:         { name: 'Pan-Seared Wagyu',       price: '₹1,500',emoji: '🥩' },
      chinese:       { name: 'Dragon Roll Special',    price: '₹680',  emoji: '🥡' },
      italian:       { name: 'Black Truffle Risotto',  price: '₹920',  emoji: '🍝' },
      desserts:      { name: 'Saffron Panna Cotta',    price: '₹380',  emoji: '🍮' },
      beverages:     { name: 'Single Origin Pour-Over',price: '₹280',  emoji: '☕' },
    };

    lines.forEach(line => {
      line.addEventListener('mouseenter', () => {
        const key = line.dataset.cat;
        if (!key || !data[key]) return;
        const d = data[key];
        if (dishName) dishName.textContent = d.name;
        if (dishPrice) dishPrice.textContent = d.price;
        // Swap emoji placeholder if no real img
        if (dishImg.dataset.placeholder !== 'false') {
          dishImg.closest('.menu-prev__dish').querySelector('.menu-prev__emoji') &&
            (dishImg.closest('.menu-prev__dish').querySelector('.menu-prev__emoji').textContent = d.emoji);
        }
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(dishImg, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        }
      });
    });
  }

  // ----------------------------------------------------------------
  // TESTIMONIAL SLIDER
  // ----------------------------------------------------------------
  function initTestimonials() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testi-dot');
    if (!slides.length) return;

    let current = 0;
    let timer;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
    }

    function autoPlay() {
      timer = setInterval(() => goTo(current + 1), 5000);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { clearInterval(timer); goTo(i); autoPlay(); });
    });

    goTo(0);
    autoPlay();
  }

  // ----------------------------------------------------------------
  // LIGHTBOX
  // ----------------------------------------------------------------
  function initLightbox() {
    const lb = document.querySelector('.lightbox');
    const lbImg = lb?.querySelector('.lightbox__img');
    const lbClose = lb?.querySelector('.lightbox__close');
    const lbPrev = lb?.querySelector('.lightbox__prev');
    const lbNext = lb?.querySelector('.lightbox__next');
    const items = document.querySelectorAll('.gallery-item[data-img]');

    if (!lb || !items.length) return;

    const imgs = Array.from(items).map(i => i.dataset.img);
    let cur = 0;

    function open(idx) {
      cur = idx;
      if (lbImg) lbImg.src = imgs[cur];
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    function prev() { cur = (cur - 1 + imgs.length) % imgs.length; if (lbImg) lbImg.src = imgs[cur]; }
    function next() { cur = (cur + 1) % imgs.length; if (lbImg) lbImg.src = imgs[cur]; }

    items.forEach((item, i) => item.addEventListener('click', () => open(i)));
    lbClose?.addEventListener('click', close);
    lbPrev?.addEventListener('click', prev);
    lbNext?.addEventListener('click', next);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') close();
    });
  }

  // ----------------------------------------------------------------
  // FAQ ACCORDION
  // ----------------------------------------------------------------
  function initFAQ() {
    document.querySelectorAll('.faq-item__q').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ----------------------------------------------------------------
  // FORM
  // ----------------------------------------------------------------
  function initForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    // Set min date to today
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      this.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = 'var(--crimson-glow)';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });

      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        valid = false;
        emailInput.style.borderColor = 'var(--crimson-glow)';
      }

      if (!valid) return;

      const btn = this.querySelector('.form-submit');
      const orig = btn.textContent;
      btn.textContent = '✓ Reservation Confirmed!';
      btn.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
      btn.disabled = true;

      // Build WhatsApp message from form
      const name = this.querySelector('#name')?.value || '';
      const phone = this.querySelector('#phone')?.value || '';
      const guests = this.querySelector('#guests')?.value || '';
      const date = this.querySelector('#date')?.value || '';
      const time = this.querySelector('#time')?.value || '';
      const occasion = this.querySelector('#occasion')?.value || '';
      const notes = this.querySelector('#notes')?.value || '';

      const msg = encodeURIComponent(
        `Hello UPRI MANZIL! 🌅\n\n` +
        `Name: ${name}\nPhone: ${phone}\nGuests: ${guests}\n` +
        `Date: ${date}\nTime: ${time}\nOccasion: ${occasion}\n` +
        (notes ? `Notes: ${notes}` : '')
      );

      setTimeout(() => {
        window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 3000);
      }, 800);
    });
  }

  // ----------------------------------------------------------------
  // LAZY LOADING
  // ----------------------------------------------------------------
  function initLazyLoad() {
    if (!('IntersectionObserver' in window)) return;
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });
    imgs.forEach(img => io.observe(img));
  }

  // ----------------------------------------------------------------
  // SCROLL REVEAL (IntersectionObserver fallback)
  // ----------------------------------------------------------------
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }

  // ----------------------------------------------------------------
  // HEART TOGGLE
  // ----------------------------------------------------------------
  function initHearts() {
    document.querySelectorAll('.menu-card__heart').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('loved');
        btn.textContent = btn.classList.contains('loved') ? '♥' : '♡';
      });
    });
  }

  // ----------------------------------------------------------------
  // WHATSAPP FLOAT BUTTON PULSE
  // ----------------------------------------------------------------
  function initWAFloat() {
    const wa = document.querySelector('.wa-float');
    if (!wa) return;
    // Pulse every 4s
    setInterval(() => {
      wa.style.transform = 'scale(1.15)';
      setTimeout(() => { wa.style.transform = ''; }, 300);
    }, 4000);
  }

  // ----------------------------------------------------------------
  // INIT ALL
  // ----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initNav();
    initMarquee();
    initMagnetic();
    initTestimonials();
    initLightbox();
    initFAQ();
    initForm();
    initMenuFilters();
    initGalleryFilters();
    initMenuCatSwap();
    initHearts();
    initLazyLoad();
    initScrollReveal();

    // GSAP after a tick
    requestAnimationFrame(() => {
      initGSAP();
    });

    initWAFloat();
  });

  // Expose for page-specific use
  window.UM = { initGSAP, initStarfield };

})();
