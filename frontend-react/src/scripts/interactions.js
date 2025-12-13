/**
 * Interacciones Avanzadas para PDF Analyzer Pro
 * Mejora la experiencia del usuario con animaciones y efectos dinámicos
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  initializeInteractions();
});

function initializeInteractions() {
  // Inicializar todas las interacciones
  initScrollEffects();
  initHoverEffects();
  initClickEffects();
  initFormEffects();
  initLoadingEffects();
  initNotificationEffects();
  initKeyboardShortcuts();
  initThemeToggle();
  initSearchFunctionality();
  initDropdownMenus();
  initMobileMenu();
  initProgressIndicator();
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
  const header = document.querySelector('.modern-header');
  const progressBar = document.querySelector('.progress-bar');
  
  if (header) {
    // Efecto de scroll en el header
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 20;
      header.classList.toggle('scrolled', scrolled);
    });
  }
  
  if (progressBar) {
    // Barra de progreso de página
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }
}

// ===== EFECTOS DE HOVER =====
function initHoverEffects() {
  // Efectos hover para tarjetas
  const cards = document.querySelectorAll('.card-moderno, .metric-card, .nav-item');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('animate-fade-in-up');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('animate-fade-in-up');
    });
  });
  
  // Efecto de partículas en botones principales
  const mainButtons = document.querySelectorAll('.btn-moderno, .fab');
  mainButtons.forEach(button => {
    button.addEventListener('mouseenter', createParticleEffect);
  });
}

// ===== EFECTOS DE CLICK =====
function initClickEffects() {
  // Efecto ripple en botones
  const buttons = document.querySelectorAll('.btn-moderno, .action-btn, .quick-action-btn');
  buttons.forEach(button => {
    button.addEventListener('click', createRippleEffect);
  });
  
  // Efecto de onda en elementos clickeables
  const clickables = document.querySelectorAll('.nav-item, .dropdown-item');
  clickables.forEach(element => {
    element.addEventListener('click', createWaveEffect);
  });
}

// ===== EFECTOS DE FORMULARIO =====
function initFormEffects() {
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    // Efecto de enfoque
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
    
    // Validación en tiempo real
    input.addEventListener('input', function() {
      validateField(this);
    });
  });
}

// ===== EFECTOS DE CARGA =====
function initLoadingEffects() {
  // Simular carga de contenido
  const loadingElements = document.querySelectorAll('.loading-skeleton');
  loadingElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('animate-fade-in');
    }, index * 100);
  });
}

// ===== EFECTOS DE NOTIFICACIÓN =====
function initNotificationEffects() {
  // Animación de entrada para notificaciones
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.classList && node.classList.contains('notification')) {
            node.classList.add('animate-slide-in-right');
          }
        });
      }
    });
  });
  
  const notificationContainer = document.querySelector('.notification-container');
  if (notificationContainer) {
    observer.observe(notificationContainer, { childList: true });
  }
}

// ===== ATAJOS DE TECLADO =====
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
    
    // Ctrl/Cmd + / para ayuda
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      window.location.href = '/help';
    }
    
    // Esc para cerrar modales
    if (e.key === 'Escape') {
      closeModals();
    }
    
    // Ctrl/Cmd + B para toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });
}

// ===== TOGGLE DE TEMA =====
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Detectar preferencia del sistema
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.setAttribute('data-theme', 'dark');
  }
}

// ===== FUNCIONALIDAD DE BÚSQUEDA =====
function initSearchFunctionality() {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300);
    });
    
    // Atajos de búsqueda
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.target.value = '';
        e.target.blur();
      }
    });
  }
}

// ===== MENÚS DESPLEGABLES =====
function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.user-dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (trigger && menu) {
      // Click fuera para cerrar
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          menu.style.opacity = '0';
          menu.style.visibility = 'hidden';
        }
      });
      
      // Prevenir cierre al hacer click dentro
      menu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  });
}

// ===== MENÚ MÓVIL =====
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.premium-sidebar');
  
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('open');
        mobileToggle.classList.remove('active');
      }
    });
  }
}

// ===== INDICADOR DE PROGRESO =====
function initProgressIndicator() {
  // Simular progreso de carga de página
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 500);
      }
      progressBar.style.width = progress + '%';
    }, 100);
  }
}

// ===== FUNCIONES AUXILIARES =====

function createParticleEffect(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * rect.width + 'px';
    particle.style.top = Math.random() * rect.height + 'px';
    particle.style.width = Math.random() * 4 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.animationDelay = Math.random() * 0.5 + 's';
    
    button.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 4000);
  }
}

function createRippleEffect(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function createWaveEffect(e) {
  const element = e.currentTarget;
  const rect = element.getBoundingClientRect();
  
  const wave = document.createElement('div');
  wave.className = 'wave-effect';
  wave.style.width = wave.style.height = '20px';
  wave.style.left = (e.clientX - rect.left - 10) + 'px';
  wave.style.top = (e.clientY - rect.top - 10) + 'px';
  
  element.appendChild(wave);
  
  setTimeout(() => {
    wave.remove();
  }, 1000);
}

function validateField(field) {
  const value = field.value.trim();
  const isValid = field.checkValidity() && value.length > 0;
  
  field.classList.toggle('valid', isValid);
  field.classList.toggle('error', !isValid);
  
  // Mostrar mensaje de error
  let errorMsg = field.parentElement.querySelector('.error-message');
  if (!isValid && !errorMsg) {
    errorMsg = document.createElement('span');
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Este campo es requerido';
    field.parentElement.appendChild(errorMsg);
  } else if (isValid && errorMsg) {
    errorMsg.remove();
  }
}

function focusSearch() {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}

function closeModals() {
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
}

function toggleSidebar() {
  const sidebar = document.querySelector('.modern-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

function performSearch(query) {
  // Implementar lógica de búsqueda
  console.log('Buscando:', query);
  
  // Filtrar elementos del sidebar
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const label = item.querySelector('.item-label')?.textContent.toLowerCase() || '';
    const description = item.querySelector('.item-description')?.textContent.toLowerCase() || '';
    
    const matches = label.includes(query.toLowerCase()) || 
                   description.includes(query.toLowerCase());
    
    item.style.display = matches ? 'flex' : 'none';
  });
}

// ===== OBSERVADORES DE INTERSECCIÓN =====
function initIntersectionObservers() {
  // Animación de elementos al entrar en viewport
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observar elementos para animar
  const animateElements = document.querySelectorAll('.card-moderno, .metric-card, .nav-section');
  animateElements.forEach(element => {
    observer.observe(element);
  });
}

// ===== INICIALIZAR CUANDO EL CONTENIDO ESTÉ CARGADO =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initIntersectionObservers, 100);
  });
} else {
  setTimeout(initIntersectionObservers, 100);
}

// ===== EXPORTAR FUNCIONES PARA USO EXTERNO =====
window.PDFAnalyzerInteractions = {
  createParticleEffect,
  createRippleEffect,
  createWaveEffect,
  toggleTheme,
  focusSearch,
  toggleSidebar
};
