document.addEventListener('DOMContentLoaded', () => {

  // ==================== SCROLL-DRIVEN VIDEO ====================
  const video = document.querySelector('.bg-video');
  const progressBar = document.querySelector('.scroll-progress');
  let videoReady = false;
  let ticking = false;

  function initVideo() {
    if (video.readyState >= 2) {
      video.pause();
      videoReady = true;
      updateVideoFromScroll();
    } else {
      video.addEventListener('canplay', () => {
        video.pause();
        videoReady = true;
        updateVideoFromScroll();
      }, { once: true });
      video.load();
    }
  }

  video.play().then(() => {
    initVideo();
  }).catch(() => {
    initVideo();
  });

  function updateVideoFromScroll() {
    if (!videoReady) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
    const targetTime = progress * video.duration;

    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      video.currentTime = targetTime;
    }

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }
  }

  // ==================== SECTION REVEAL ANIMATIONS ====================
  function updateSectionAnimations() {
    const viewH = window.innerHeight;
    const sections = document.querySelectorAll('.section');
    const scrollY = window.scrollY;

    sections.forEach((section, index) => {
      const inner = section.querySelector('.section-inner');
      if (!inner) return;

      const sectionStart = index * viewH;
      let progress = (scrollY - sectionStart) / viewH;
      progress = Math.max(0, Math.min(1, progress));

      if (index >= sections.length - 1) {
        inner.style.opacity = 1;
        inner.style.transform = '';
        return;
      }

      const opacity = 1 - Math.pow(progress, 2);
      const translateY = -progress * 60;

      inner.style.opacity = opacity;
      inner.style.transform = `translateY(${translateY}px)`;
    });
  }

  // ==================== SCROLL HANDLER ====================
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateVideoFromScroll();
        updateSectionAnimations();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateVideoFromScroll, { passive: true });

  // Initial state
  setTimeout(() => {
    updateVideoFromScroll();
    updateSectionAnimations();
  }, 500);

  // ==================== BOOKING FORM ====================
  const form = document.getElementById('booking-form');
  const formStatus = document.getElementById('form-status');

  const TELEGRAM_BOT_TOKEN = '';
  const TELEGRAM_CHAT_ID = '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !phone) {
      formStatus.textContent = 'Пожалуйста, заполните имя и телефон';
      formStatus.className = 'form-status error';
      return;
    }

    formStatus.textContent = 'Отправка...';
    formStatus.className = 'form-status';

    const text = `Новая заявка с Край Земли!\nИмя: ${name}\nТелефон: ${phone}\nКомментарий: ${message || '—'}`;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
        });
        if (!response.ok) throw new Error('Send failed');
        formStatus.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
        formStatus.className = 'form-status success';
        form.reset();
      } catch {
        window.location.href = `mailto:info@krai-zemli.ru?subject=Заявка с сайта&body=${encodeURIComponent(text)}`;
        formStatus.textContent = 'Перенаправление на email...';
        formStatus.className = 'form-status success';
      }
    } else {
      formStatus.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
      formStatus.className = 'form-status success';
      form.reset();
    }
  });

  // ==================== MOBILE FALLBACK ====================
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9998;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #fff; font-size: 1.2rem;
    `;
    overlay.textContent = 'Нажмите, чтобы начать';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      video.play().then(() => video.pause()).catch(() => {});
      overlay.remove();
    });
  }
});
