/**
 * Riha Mirror Magic - Luxury Beauty Website
 * Client-side script for responsive navigation, active states, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Drawer Elements
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Toggle Drawer
  function openMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.add('open');
      mobileBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileBackdrop) {
      mobileDrawer.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileMenu);
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }

  // Close drawer on clicking any navigation link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Active navigation indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        desktopNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });

        mobileNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Synchronize cart badge across pages
  try {
    const rawCart = localStorage.getItem('riha_mirror_magic_cart');
    if (rawCart) {
      const items = JSON.parse(rawCart);
      const totalCount = items.reduce((acc, it) => acc + (it.count || 1), 0);
      document.querySelectorAll('.bag-badge').forEach(b => {
        b.textContent = totalCount;
      });
    }
  } catch (e) {
    // Ignore if localStorage is inaccessible
  }

  // Handle Customer Account icon navigation across all pages
  const accountButtons = document.querySelectorAll('.util-btn[aria-label="Customer Account icon"]');
  accountButtons.forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const session = localStorage.getItem('riha_active_customer_session');
        if (session) {
          window.location.href = 'account.html';
        } else {
          window.location.href = 'login.html';
        }
      } catch (err) {
        window.location.href = 'login.html';
      }
    });
  });

  window.addEventListener('scroll', updateActiveNav, { passive: true });
});
