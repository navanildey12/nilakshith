/**
 * main.js — Nilakshith Enterprise Unified Script
 * Handles: preloader, scroll reveal animations, navbar scroll state,
 * mobile drawer menu with focus trap, counter animation, FAQ accordion,
 * active page highlights, and WhatsApp floating tooltip.
 */

'use strict';

// Helpers
const qs = (sel, root = document) => root.querySelector(sel);
const qsAll = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * 1. PRELOADER
 */
function initPreloader() {
  const loader = qs('.preloader');
  if (!loader) return;

  const done = () => loader.classList.add('loaded');

  if (document.readyState === 'complete') {
    setTimeout(done, 200);
  } else {
    window.addEventListener('load', () => setTimeout(done, 300));
  }
}

/**
 * 2. NAVBAR SCROLL CLASS
 */
function initNavScroll() {
  const nav = qs('.navbar');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Check immediately on load
}

/**
 * 3. MOBILE MENU DRAWER (with focus trap)
 */
function initMobileMenu() {
  const toggle = qs('.nav-toggle');
  const overlay = qs('.nav-overlay');
  const drawer = qs('.nav-drawer');
  if (!toggle || !overlay || !drawer) return;

  const focusableElements = drawer.querySelectorAll('a, button');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function openMenu() {
    toggle.classList.add('open');
    overlay.classList.add('open');
    drawer.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu() {
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Focus trap inside drawer
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          if (lastFocusable) lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          if (firstFocusable) firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

/**
 * 4. ACTIVE NAV LINK HIGHLIGHT
 */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const allLinks = qsAll('.nav-menu__link, .nav-drawer__link');
  allLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * 5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
 */
function initScrollAnimations() {
  const elements = qsAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach((el) => observer.observe(el));
}

/**
 * 6. NUMERICAL COUNTERS ANIMATION
 */
function initCounters() {
  const counters = qsAll('[data-count-up]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count-up'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const isFloat = String(target).includes('.');
    const duration = 2000;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const value = target * eased;
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

/**
 * 7. FAQ ACCORDION (Subpages)
 */
function initFAQ() {
  const items = qsAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = qs('.faq-item__question', item);
    const answer = qs('.faq-item__answer', item);
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other FAQs (accordion functionality)
      items.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherAnswer = qs('.faq-item__answer', otherItem);
          if (otherAnswer) otherAnswer.style.maxHeight = '';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 8. SCROLL TO TOP BUTTON
 */
function initScrollToTop() {
  const btn = qs('.scroll-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * 9. FLOATING WHATSAPP BUTTON ACCESSIBILITY
 */
function initFloatingWhatsApp() {
  const wrapper = qs('.wa-float-wrapper');
  const tooltip = qs('.wa-tooltip');
  if (!wrapper || !tooltip) return;

  const fab = qs('.wa-float', wrapper);
  if (fab) {
    fab.addEventListener('focus', () => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateX(0)';
    });
    fab.addEventListener('blur', () => {
      tooltip.style.opacity = '';
      tooltip.style.transform = '';
    });
  }
}

/**
 * 10. STEP DASHED LINE CONNECTOR ANIMATION
 */
function initStepConnectors() {
  const lines = qsAll('.step-connector__line');
  if (!lines.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('animated'), 300);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  lines.forEach((line) => observer.observe(line));
}


/**
 * 12. WHATSAPP CHOICE MODAL INJECTION & LOGIC
 */
function initWhatsAppModal() {
  const waFab = qs('.wa-float');
  if (!waFab) return;

  const wrapper = qs('.wa-float-wrapper');
  if (!wrapper) return;

  // Inject modal markup into DOM if not present
  let modalOverlay = qs('.wa-modal-overlay');
  if (!modalOverlay) {
    const modalHTML = `
      <div class="wa-modal-overlay" id="wa-choice-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title-id">
        <div class="wa-modal-card">
          <div class="wa-modal-header">
            <span class="wa-modal-title" id="wa-modal-title-id">How can we help you?</span>
            <button type="button" class="wa-modal-close" aria-label="Close modal">&times;</button>
          </div>
          <div class="wa-modal-body">
            <span class="wa-modal-subtitle">Select your enquiry type</span>
            <div class="wa-modal-options">
              <label class="wa-modal-option">
                <input type="radio" name="wa-enquiry-type" value="broadband" checked>
                <span class="wa-modal-option-card">
                  <span class="wa-modal-option-icon">🌐</span>
                  <span class="wa-modal-option-text">New Broadband Connection</span>
                </span>
              </label>
              <label class="wa-modal-option">
                <input type="radio" name="wa-enquiry-type" value="cctv">
                <span class="wa-modal-option-card">
                  <span class="wa-modal-option-icon">🎥</span>
                  <span class="wa-modal-option-text">CCTV Camera Installation</span>
                </span>
              </label>
              <label class="wa-modal-option">
                <input type="radio" name="wa-enquiry-type" value="amc">
                <span class="wa-modal-option-card">
                  <span class="wa-modal-option-icon">🛡️</span>
                  <span class="wa-modal-option-text">CCTV Annual Maintenance (AMC)</span>
                </span>
              </label>
              <label class="wa-modal-option">
                <input type="radio" name="wa-enquiry-type" value="networking">
                <span class="wa-modal-option-card">
                  <span class="wa-modal-option-icon">💻</span>
                  <span class="wa-modal-option-text">IT Networking &amp; Support</span>
                </span>
              </label>
              <label class="wa-modal-option">
                <input type="radio" name="wa-enquiry-type" value="general">
                <span class="wa-modal-option-card">
                  <span class="wa-modal-option-icon">❓</span>
                  <span class="wa-modal-option-text">General Enquiry</span>
                </span>
              </label>
            </div>
            
            <div class="wa-modal-text-group">
              <label for="wa-modal-custom-text" class="wa-modal-label">Additional details (Optional)</label>
              <textarea id="wa-modal-custom-text" class="wa-modal-textarea" placeholder="E.g., location, package name, or number of cameras..."></textarea>
            </div>
          </div>
          <div class="wa-modal-footer">
            <button type="button" class="btn btn--outline wa-modal-cancel">Cancel</button>
            <button type="button" class="btn btn--whatsapp-modal" id="wa-modal-submit-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.965L2 22l5.233-1.371a9.944 9.944 0 0 0 4.773 1.216h.004c5.506 0 9.989-4.478 9.99-9.984A9.995 9.995 0 0 0 12.012 2zm5.793 13.593c-.319.897-1.558 1.637-2.146 1.745-.589.108-1.168.162-3.834-.912-3.41-1.376-5.607-4.85-5.777-5.077-.17-.228-1.357-1.802-1.357-3.437 0-1.636.852-2.438 1.157-2.775.305-.336.666-.42.887-.42h.638c.204 0 .476.006.697.528.221.522.756 1.834.821 1.971.066.137.108.297.017.476-.09.18-.135.297-.272.456-.137.159-.289.356-.413.476-.137.137-.282.287-.121.562.161.275.717 1.183 1.536 1.91.543.484.992.836 1.357 1.019.365.183.578.115.756-.09.178-.205.757-.88 1.012-1.222.256-.341.512-.284.862-.153.35.13.222.102 2.222 1.102.13.065.215.297.16.592z"/></svg>
              Open WhatsApp Chat
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modalOverlay = qs('.wa-modal-overlay');
  }

  const closeBtn = qs('.wa-modal-close', modalOverlay);
  const cancelBtn = qs('.wa-modal-cancel', modalOverlay);
  const submitModalBtn = qs('#wa-modal-submit-btn', modalOverlay);
  const customTextarea = qs('#wa-modal-custom-text', modalOverlay);

  function openModal(e) {
    e.preventDefault();
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first active input
    const firstRadio = qs('input[name="wa-enquiry-type"]', modalOverlay);
    if (firstRadio) firstRadio.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    waFab.focus();
  }

  // Bind trigger click
  waFab.addEventListener('click', openModal);

  // Bind close buttons
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Keyboard support: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Handle submit action
  if (submitModalBtn) {
    submitModalBtn.addEventListener('click', () => {
      const type = qs('input[name="wa-enquiry-type"]:checked', modalOverlay)?.value || 'general';
      const details = customTextarea?.value.trim() || '';

      let baseMessage = 'Hi Nilakshith Enterprise, ';
      if (type === 'broadband') {
        baseMessage += 'I would like to enquire about getting a new broadband internet connection.';
      } else if (type === 'cctv') {
        baseMessage += 'I would like to get a quote for a professional CCTV surveillance camera installation.';
      } else if (type === 'amc') {
        baseMessage += 'I would like to enquire about your CCTV Annual Maintenance Contract (AMC) plans.';
      } else if (type === 'networking') {
        baseMessage += 'I would like to discuss an IT networking or business connectivity project.';
      } else {
        baseMessage += 'I have a general enquiry regarding your services.';
      }

      if (details) {
        baseMessage += ` Here are some details: ${details}`;
      }

      const waURL = `https://wa.me/919706817032?text=${encodeURIComponent(baseMessage)}`;
      
      closeModal();
      window.open(waURL, '_blank', 'noopener,noreferrer');
    });
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavScroll();
  initMobileMenu();
  initActiveNav();
  initScrollAnimations();
  initCounters();
  initFAQ();
  initScrollToTop();
  initFloatingWhatsApp();
  initStepConnectors();
  initWhatsAppModal();
});
