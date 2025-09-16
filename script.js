/*
 * Main JavaScript for the graduation mini‑site
 *
 * This file provides interactive behaviour such as the live countdown
 * timer, copy‑to‑clipboard functionality, scroll animations, a simple
 * image lightbox, confetti effects, and toast notifications.  All
 * functions are written in vanilla JavaScript without external
 * dependencies to keep the page lightweight and accessible.  Where
 * appropriate, animations respect the user’s `prefers-reduced-motion`
 * setting.
 */

// Immediately invoked function to avoid polluting the global scope
(function () {
  /**
   * Countdown timer
   * Calculates the difference between now and the event date/time and
   * updates the DOM every second.  Once the event has passed, the
   * countdown element is replaced with a friendly message.
   */
  function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    // Parse date and time from data attributes
    const eventDate = countdownEl.getAttribute('data-date');
    const eventTime = countdownEl.getAttribute('data-time');
    const target = new Date(`${eventDate}T${eventTime}:00+07:00`); // Asia/Hanoi timezone offset +07:00
    function update() {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        countdownEl.innerHTML = '<p>Hẹn gặp lại ở album ảnh!</p>';
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      countdownEl.innerHTML = `
        <div class="time-box"><span class="number">${String(days).padStart(2, '0')}</span><span class="label">Ngày</span></div>
        <div class="time-box"><span class="number">${String(hours).padStart(2, '0')}</span><span class="label">Giờ</span></div>
        <div class="time-box"><span class="number">${String(minutes).padStart(2, '0')}</span><span class="label">Phút</span></div>
        <div class="time-box"><span class="number">${String(seconds).padStart(2, '0')}</span><span class="label">Giây</span></div>
      `;
    }
    update();
    const timer = setInterval(update, 1000);
  }

  /**
   * Copy the venue address to the clipboard and notify the user.
   */
  window.copyAddress = function copyAddress() {
    const address = document.getElementById('venue-address').innerText;
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = address;
      textarea.style.position = 'fixed';
      textarea.style.top = '-999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(address).catch((err) => {
        console.error('Clipboard write failed:', err);
      });
    }
    showToast('Đã sao chép địa chỉ!');
  };

  /**
   * Open the RSVP form in a new tab and display confetti and toast.
   */
  window.openRSVP = function openRSVP(event) {
    event.preventDefault();
    const link = event.currentTarget.getAttribute('data-href');
    if (link) {
      window.open(link, '_blank');
    }
    showToast('Đã nhận RSVP! ❤️');
    triggerConfetti();
  };

  /**
   * Show a toast message in the bottom corner of the screen.
   * @param {string} msg
   */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Create a simple confetti burst animation.
   * This function generates a handful of coloured squares that fall
   * from the top of the viewport.  When `prefers-reduced-motion` is
   * enabled, the confetti will not animate.
   */
  function triggerConfetti() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const colours = ['#f7b2d9', '#c5a3e8', '#ffd59e', '#a3d9c9', '#fddde6'];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      const size = Math.random() * 8 + 4;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = colours[Math.floor(Math.random() * colours.length)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `${-10 - Math.random() * 20}px`;
      confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(confetti);
      // Remove after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 6000);
    }
  }

  /**
   * Initialize scroll reveal animations using Intersection Observer.
   * Elements with the class `.animate` will fade/slide into view as
   * they enter the viewport.  If the user prefers reduced motion,
   * animations are skipped and elements are shown immediately.
   */
  function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedElements = document.querySelectorAll('.animate');
    if (prefersReducedMotion) {
      animatedElements.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );
    animatedElements.forEach((el) => observer.observe(el));
  }

  /**
   * Simple lightbox for gallery images
   */
  function initGalleryLightbox() {
    const images = document.querySelectorAll('.gallery img');
    if (!images.length) return;
    const lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100vw';
    lightbox.style.height = '100vh';
    lightbox.style.background = 'rgba(0,0,0,0.8)';
    lightbox.style.display = 'none';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.zIndex = '1000';
    lightbox.style.cursor = 'zoom-out';
    const imgEl = document.createElement('img');
    imgEl.style.maxWidth = '90%';
    imgEl.style.maxHeight = '90%';
    imgEl.style.borderRadius = '12px';
    imgEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    lightbox.appendChild(imgEl);
    lightbox.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });
    document.body.appendChild(lightbox);
    images.forEach((img) => {
      img.addEventListener('click', () => {
        imgEl.src = img.src;
        lightbox.style.display = 'flex';
      });
    });
  }

  // Initialise all functionality on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initScrollAnimations();
    initGalleryLightbox();
  });
})();