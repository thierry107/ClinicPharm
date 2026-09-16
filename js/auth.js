/**
 * ClinicPharm Enterprise SaaS - Authentication & Role Selector Module
 */

import { store } from './store.js';
import { navigateToApp, navigateToPublic } from './navigation.js';

export function initAuth() {
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');

  // Trigger buttons
  document.querySelectorAll('[data-action="open-login"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('login-modal');
    });
  });

  document.querySelectorAll('[data-action="open-register"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('register-modal');
    });
  });

  document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = document.getElementById('login-role-select').value;
      store.setCurrentRole(role);
      closeAllModals();
      navigateToApp();
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      navigateToPublic();
    });
  }
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

export function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}
