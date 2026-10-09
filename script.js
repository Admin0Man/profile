/**
 * QA Portfolio - Foundation JavaScript
 * Plain vanilla JS for responsive navigation, interactions, and scrollspy.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initThemeLock();
  initMobileNav();
  initScrollSpy();
  initCurrentYear();
  initTypingAnimation();
  initScrollReveal();
  initCaseStudyModal();
  initQATabs();
  initContactForm();
  initCopyEmail();
  initBackToTop();
});

/* ==========================================================================
   1. Theme Enforcement (Fixed Dark Mode)
   ========================================================================== */
function initThemeLock() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('portfolio-theme', 'dark');
  } catch (e) {}
}

/* ==========================================================================
   2. Responsive Mobile Navigation (Hamburger Menu)
   ========================================================================== */
function initMobileNav() {
  const navToggleBtn = document.getElementById('nav-toggle');
  const navWrapper = document.querySelector('.nav-wrapper');
  const navLinks = document.querySelectorAll('[data-nav-link]');

  if (!navToggleBtn || !navWrapper) return;

  const openMenu = () => {
    navToggleBtn.setAttribute('aria-expanded', 'true');
    navWrapper.classList.add('is-open');
  };

  const closeMenu = () => {
    navToggleBtn.setAttribute('aria-expanded', 'false');
    navWrapper.classList.remove('is-open');
  };

  // Toggle on button click
  navToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navToggleBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking on any navigation link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu on click outside
  document.addEventListener('click', (e) => {
    if (navWrapper.classList.contains('is-open')) {
      if (!navWrapper.contains(e.target) && !navToggleBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // Close menu on ESC key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navWrapper.classList.contains('is-open')) {
      closeMenu();
      navToggleBtn.focus();
    }
  });
}

/* ==========================================================================
   3. ScrollSpy & Active Link Highlight on Scroll
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('[data-nav-link]');

  if (!sections.length || !navLinks.length) return;

  // Map section ids to link elements for O(1) fast lookup
  const linksMap = new Map();
  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href').replace('#', '');
    linksMap.set(targetId, link);
  });

  const updateActiveLink = (currentId) => {
    navLinks.forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const activeLink = linksMap.get(currentId);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }
  };

  // Use scroll position with requestAnimationFrame for smooth, responsive detection
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '70',
          10
        );
        const scrollPosition = window.scrollY + headerHeight + 100;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        // If scrolled to bottom of the page, activate the last section
        if (window.scrollY + windowHeight >= documentHeight - 50) {
          const lastSection = sections[sections.length - 1];
          if (lastSection) {
            updateActiveLink(lastSection.id);
          }
          ticking = false;
          return;
        }

        // Find which section is currently in view
        let currentSectionId = sections[0].id;
        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            currentSectionId = section.id;
          }
        });

        updateActiveLink(currentSectionId);
        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial run to set active link on page load
  onScroll();
}

/* ==========================================================================
   4. Dynamic Footer Current Year
   ========================================================================== */
function initCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   5. Hero Roles Typing & Erasing Animation
   ========================================================================== */
function initTypingAnimation() {
  const typedElement = document.getElementById('typed-text');
  if (!typedElement) return;

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typedElement.textContent = 'Manual, Automation & API Testing';
    const cursor = document.querySelector('.typed-cursor');
    if (cursor) cursor.style.display = 'none';
    return;
  }

  const roles = [
    'Manual Testing',
    'Functional & Regression',
    'API Testing',
    'Cross-Platform QA'
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let isDeleting = true;
  const typeSpeed = 85;
  const deleteSpeed = 45;
  const holdAfterType = 2200;
  const holdAfterDelete = 400;

  function typeTick() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      charIndex--;
      typedElement.textContent = currentRole.substring(0, charIndex);
    } else {
      charIndex++;
      typedElement.textContent = currentRole.substring(0, charIndex);
    }

    let nextDelay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      nextDelay = holdAfterType;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      nextDelay = holdAfterDelete;
    }

    setTimeout(typeTick, nextDelay);
  }

  // Start rotation after initial display pause
  setTimeout(typeTick, 1800);
}

/* ==========================================================================
   6. Scroll-Triggered Reveal Animation (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-on-scroll, .reveal-card');
  if (!targets.length) return;

  // Immediately display all elements if reduced motion is requested or IntersectionObserver is unsupported
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   7. Case Study Modal Dialog & Data Store
   ========================================================================== */
function initCaseStudyModal() {
  const modal = document.getElementById('case-study-modal');
  const modalDomain = document.getElementById('modal-domain');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBody = document.getElementById('modal-content-body');
  const triggerButtons = document.querySelectorAll('[data-project-id]');
  const closeElements = document.querySelectorAll('[data-close-modal]');

  if (!modal || !modalBody || !triggerButtons.length) return;

  let lastFocusedElement = null;

  // Case studies data store (Realistic, production-quality, non-confidential)
  const caseStudiesData = {
    'pos-kds': {
      domain: 'POS & Retail Tech',
      title: 'Fast-Food Restaurant Chain (POS / KDS System)',
      subtitle: 'Multi-terminal point-of-sale and kitchen display system with real-time order orchestration.',
      overview:
        'Enterprise-grade Point-of-Sale (POS) and Kitchen Display System (KDS) deployed across high-volume fast-food restaurant branches. The ecosystem manages omnichannel customer orders (counter, drive-thru, self-service kiosks, online aggregators) with real-time routing to kitchen prep stations, split billing, modifier customization, and kitchen bump-bar fulfillment.',
      myRole:
        'Primary QA tester for POS-to-KDS order workflow validation, hardware peripheral integration, and multi-tender payment processing. Designed comprehensive test scenario matrices, coordinated sprint regression cycles with backend developers, and verified production candidate builds across hardware testbeds.',
      testingTypes: [
        'Functional Testing',
        'POS-to-KDS Workflow Verification',
        'End-to-End Regression',
        'Smoke & Sanity Testing',
        'Split Billing & Modifier Checks',
        'Offline-to-Online Data Sync',
        'Hardware Peripheral (Printers, Bump-bars)'
      ],
      challenges:
        'Simulating peak lunch rush concurrency where multiple cashiers and drive-thru operators fired large modified orders simultaneously under fluctuating local Wi-Fi connectivity. Addressed risks around orphaned kitchen tickets and desynchronized order states across cashier screens and kitchen displays.',
      outcome:
        'Executed 700+ rigorous test scenarios covering complex combo menus and discount matrices; achieved zero critical production defects post-rollout, slashed kitchen order display latency by 40%, and secured high store-manager satisfaction.'
    },

    'home-services': {
      domain: 'On-Demand Services',
      title: 'Home Service Request & Task Management System',
      subtitle: 'Customer booking workflows, automated task dispatch, and technician lifecycle management.',
      overview:
        'Dual-sided on-demand marketplace connecting homeowners with certified maintenance professionals (electrical, plumbing, HVAC, cleaning). The solution features a customer-facing booking app/web portal, an operations dispatcher dashboard for automated task assignment, and an on-field technician mobile app with live job status progression.',
      myRole:
        'End-to-end QA tester validating customer booking flows, service catalog variations, technician dispatch logic, and admin oversight features. Authored test plans, managed defect lifecycles in Jira, and coordinated directly with product managers for final User Acceptance Testing (UAT) sign-offs.',
      testingTypes: [
        'Functional Testing',
        'Regression Testing',
        'User Acceptance Testing (UAT)',
        'Cross-Browser Testing (Chrome, Safari, Firefox)',
        'Mobile App QA (Android & iOS)',
        'Push Notifications & In-App Alerts'
      ],
      challenges:
        'Handling state synchronization across customer, dispatcher, and technician interfaces when simultaneous booking modifications or cancellations took place while jobs were being accepted, and ensuring push notifications fired reliably across diverse OS power-saving modes.',
      outcome:
        'Maintained a 100% test case pass rate prior to each sprint release, validated over 30,000 monthly service requests with zero duplicate assignments, and successfully achieved early UAT stakeholder sign-off.'
    },

    'taxi-australia': {
      domain: 'Mobility & Transportation',
      title: 'Taxi Service, Australia (Rider & Driver App)',
      subtitle: 'Real-time trip dispatch, dynamic fare calculation, GPS tracking, and cross-device ride management.',
      overview:
        'A commercial Australian ride-hailing and dispatch platform consisting of cross-platform Rider and Driver applications. Features automated driver allocation based on proximity, live GPS turn-by-turn route tracking, surge fare calculation, and seamless in-app card payments conforming to local regulatory standards.',
      myRole:
        'QA Engineer responsible for validating trip lifecycle states (Booking Request → Driver Matching → Ride Started → Completed → Invoiced), simulated GPS location updates, driver acceptance timers, and cancellation fee calculation logic.',
      testingTypes: [
        'Functional Testing',
        'Cross-Device Compatibility Testing',
        'GPS & Geolocation Simulation',
        'Network Interruption & Recovery',
        'Regression Testing',
        'Payment Gateway & Fare Assertions'
      ],
      challenges:
        'Ensuring consistent trip status synchronization when mobile drivers transited through cellular dead zones (tunnels, underground parking), preventing fare miscalculations when GPS signals drifted, and ensuring UI accuracy across 12+ legacy and modern device resolutions.',
      outcome:
        'Discovered and resolved 80+ pre-release edge-case defects in ride dispatching and billing; ensured 99.7% crash-free sessions across both iOS and Android stores with flawless cross-device compatibility.'
    },

    'healthcare-app': {
      domain: 'Healthcare & IoT',
      title: 'Healthcare Monitoring App (React Native)',
      subtitle: 'Real-time biometric data streaming, BLE device integration, and live diagnostic charting.',
      overview:
        'A high-security React Native mobile health application enabling patients to pair certified Bluetooth Low Energy (BLE) medical sensors (heart rate monitors, pulse oximeters, blood pressure cuffs) for live telemetry streaming, diagnostic graphs, and automated alerts to healthcare providers.',
      myRole:
        'Lead QA Engineer for BLE communication protocols, data visualization reliability, role-based authorization (Patients, Doctors, Admins), and device performance profiling during long-duration live monitoring sessions.',
      testingTypes: [
        'Functional Testing',
        'BLE Pairing, Reconnection & Boundary Checks',
        'Real-Time Chart Performance (Skia, Victory Native)',
        'Role-Based Access Control (RBAC)',
        'Memory Leak & Battery Consumption Profiling',
        'Security & Data Validation'
      ],
      challenges:
        'Preventing mobile UI thread stutter and memory leaks when rendering high-frequency vital statistics on canvas charts (Skia / Victory Native) at 60fps, and ensuring instantaneous automated data resynchronization when a BLE wearable disconnected and re-entered range.',
      outcome:
        'Eliminated memory leaks to sustain continuous 60fps chart rendering during 8-hour testing runs; caught 5 critical BLE packet loss bugs prior to submission, achieving 100% adherence to role-based access security constraints.'
    }
  };

  // Helper to render the 5 required sections
  const renderModalContent = (project) => {
    modalDomain.textContent = project.domain;
    modalTitle.textContent = project.title;
    modalSubtitle.textContent = project.subtitle;

    const chipsHTML = project.testingTypes
      .map((type) => `<span class="block-chip">${type}</span>`)
      .join('');

    modalBody.innerHTML = `
      <!-- 1. Overview -->
      <div class="case-study-block">
        <div class="block-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <h4 class="block-title">1. Project Overview</h4>
        </div>
        <p class="block-text">${project.overview}</p>
      </div>

      <!-- 2. My Role -->
      <div class="case-study-block">
        <div class="block-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="16 11 18 13 22 9"/>
          </svg>
          <h4 class="block-title">2. My Role &amp; Responsibilities</h4>
        </div>
        <p class="block-text">${project.myRole}</p>
      </div>

      <!-- 3. Testing Types -->
      <div class="case-study-block">
        <div class="block-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <h4 class="block-title">3. Testing Types &amp; Focus Areas</h4>
        </div>
        <div class="block-chips">
          ${chipsHTML}
        </div>
      </div>

      <!-- 4. Challenges -->
      <div class="case-study-block">
        <div class="block-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h4 class="block-title">4. Key Challenges &amp; Edge Cases Handled</h4>
        </div>
        <p class="block-text">${project.challenges}</p>
      </div>

      <!-- 5. Outcome -->
      <div class="case-study-block">
        <div class="block-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34c3.48-.68 6-3.72 6-7.32V4H4v5.34c0 3.6 2.52 6.64 6 7.32Z"/>
          </svg>
          <h4 class="block-title">5. Outcome &amp; Measurable Impact</h4>
        </div>
        <p class="block-text">${project.outcome}</p>
      </div>
    `;
  };

  const openModal = (projectId) => {
    const project = caseStudiesData[projectId];
    if (!project) return;

    lastFocusedElement = document.activeElement;
    renderModalContent(project);

    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus on close button inside modal for keyboard accessibility
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  };

  const closeModal = () => {
    if (!modal.classList.contains('is-active')) return;

    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  // Open modal click handler on trigger buttons
  triggerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project-id');
      openModal(projectId);
    });
  });

  // Close handlers on close buttons & backdrop
  closeElements.forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Accessible Focus Trap: Keep keyboard focus trapped within modal when active
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && modal.classList.contains('is-active')) {
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/* ==========================================================================
   8. QA Work Artifacts Tab Switching
   ========================================================================== */
function initQATabs() {
  const tabButtons = document.querySelectorAll('[data-qa-tab]');
  const tabPanels = document.querySelectorAll('.qa-tab-panel');

  if (!tabButtons.length || !tabPanels.length) return;

  const switchTab = (targetTabId) => {
    tabButtons.forEach((btn) => {
      const isCurrent = btn.getAttribute('data-qa-tab') === targetTabId;
      btn.classList.toggle('active', isCurrent);
      btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    tabPanels.forEach((panel) => {
      const isMatch = panel.id === `panel-${targetTabId}`;
      panel.classList.toggle('active', isMatch);
    });
  };

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-qa-tab');
      switchTab(tabId);
    });

    // Keyboard navigation (ArrowLeft / ArrowRight / Home / End)
    btn.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        const targetBtn = tabButtons[targetIndex];
        targetBtn.focus();
        switchTab(targetBtn.getAttribute('data-qa-tab'));
      }
    });
  });
}

/* ==========================================================================
   9. Contact Form Validation & Submission (Formspree & Mailto support)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusAlert = document.getElementById('form-status-alert');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const statusIcon = document.getElementById('status-icon');
  const statusCloseBtn = document.getElementById('status-alert-close');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Helper to show field error
  const setFieldError = (input, errorEl, message) => {
    input.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  };

  // Helper to clear field error
  const clearFieldError = (input, errorEl) => {
    input.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  // Live validation on input
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 2) {
        clearFieldError(nameInput, nameError);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (emailRegex.test(emailInput.value.trim())) {
        clearFieldError(emailInput, emailError);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length >= 10) {
        clearFieldError(messageInput, messageError);
      }
    });
  }

  // Dismiss status alert
  if (statusCloseBtn && statusAlert) {
    statusCloseBtn.addEventListener('click', () => {
      statusAlert.style.display = 'none';
    });
  }

  // Helper to display alert
  const showAlert = (isSuccess, title, message) => {
    if (!statusAlert) return;
    statusAlert.classList.toggle('is-error', !isSuccess);
    if (statusTitle) statusTitle.textContent = title;
    if (statusDesc) statusDesc.textContent = message;

    if (statusIcon) {
      if (isSuccess) {
        statusIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        `;
      } else {
        statusIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        `;
      }
    }

    statusAlert.style.display = 'flex';
    statusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidInput = null;

    // Validate Name
    const nameVal = nameInput ? nameInput.value.trim() : '';
    if (nameVal.length < 2) {
      setFieldError(nameInput, nameError, 'Please enter your name (at least 2 characters).');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = nameInput;
    } else {
      clearFieldError(nameInput, nameError);
    }

    // Validate Email
    const emailVal = emailInput ? emailInput.value.trim() : '';
    if (!emailRegex.test(emailVal)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = emailInput;
    } else {
      clearFieldError(emailInput, emailError);
    }

    // Validate Message
    const messageVal = messageInput ? messageInput.value.trim() : '';
    if (messageVal.length < 10) {
      setFieldError(messageInput, messageError, 'Please enter a message (at least 10 characters).');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = messageInput;
    } else {
      clearFieldError(messageInput, messageError);
    }

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // Set Loading State
    const submitLabel = submitBtn ? submitBtn.querySelector('.submit-btn-label') : null;
    const originalLabel = submitLabel ? submitLabel.textContent : 'Send Message';
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Sending...';
    }

    const actionUrl = form.getAttribute('action') || '';
    const isCustomFormspree = actionUrl.includes('formspree.io/f/') && !actionUrl.includes('your-formspree-id');

    if (isCustomFormspree) {
      try {
        const formData = new FormData(form);
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json'
          }
        });

        if (response.ok) {
          showAlert(
            true,
            'Message Sent Successfully!',
            `Thank you, ${nameVal}! Your message has been sent. I'll get back to you shortly at ${emailVal}.`
          );
          form.reset();
        } else {
          throw new Error('Form submission failed.');
        }
      } catch (err) {
        // Fallback to mailto on network or endpoint error
        triggerMailto(nameVal, emailVal, subjectInput ? subjectInput.value.trim() : '', messageVal);
      }
    } else {
      // Default: mailto trigger + immediate rich on-page confirmation
      triggerMailto(nameVal, emailVal, subjectInput ? subjectInput.value.trim() : '', messageVal);
    }

    // Restore Button State
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
      }
    }, 600);
  });

  // Mailto helper function
  function triggerMailto(name, email, subject, message) {
    const emailRecipient = 'abhaayk30@gmail.com';
    const emailSubject = subject || `QA Engineering Inquiry from ${name}`;
    const emailBody = `Hi Abhay,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Website`;
    const mailtoUrl = `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open mail client
    window.location.href = mailtoUrl;

    showAlert(
      true,
      'Message Prepared & Ready!',
      `Thank you, ${name}! Your email client has been opened with your message addressed to abhaayk30@gmail.com. Looking forward to connecting!`
    );
    form.reset();
  }
}

/* ==========================================================================
   10. Copy Email to Clipboard Feature
   ========================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  const EMAIL = 'abhaayk30@gmail.com';
  const copyText = copyBtn.querySelector('.copy-text');

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      copyBtn.classList.add('copied');
      if (copyText) copyText.textContent = 'Copied!';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (copyText) copyText.textContent = 'Copy';
      }, 2500);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      copyBtn.classList.add('copied');
      if (copyText) copyText.textContent = 'Copied!';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (copyText) copyText.textContent = 'Copy';
      }, 2500);
    }
  });
}

/* ==========================================================================
   11. Smooth Back to Top Navigation
   ========================================================================== */
function initBackToTop() {
  const backToTopBtns = document.querySelectorAll('.back-to-top, #back-to-top-btn');
  backToTopBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      if (history.pushState) {
        history.pushState(null, null, '#home');
      }
    });
  });
}




