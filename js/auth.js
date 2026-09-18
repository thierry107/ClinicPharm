/**
 * ClinicPharm Enterprise SaaS - Authentication Module
 * Real Supabase Auth (signUp, signInWithPassword, signOut, profiles)
 */

import { store } from './store.js';
import { navigateToApp, navigateToPublic } from './navigation.js';
import { supabase, isSupabaseReady } from './supabase-client.js';

/**
 * 1. REAL REGISTRATION
 * Registers a new user with Supabase Auth.
 * Default role is assigned server-side via the database trigger (handle_new_user -> patient).
 * Passes full_name in user metadata for the trigger.
 *
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {Promise<{success: boolean, user?: object, session?: object, error?: string}>}
 */
export async function registerUser(fullName, email, password, confirmPassword) {
  const nameStr = (fullName || '').trim();
  const emailStr = (email || '').trim();
  const pwdStr = password || '';
  const confirmPwdStr = confirmPassword || '';

  // Input Validation
  if (!nameStr) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!emailStr) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!pwdStr) {
    return { success: false, error: 'Password is required.' };
  }
  if (pwdStr.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (pwdStr !== confirmPwdStr) {
    return { success: false, error: 'Passwords do not match.' };
  }

  if (!isSupabaseReady() || !supabase) {
    return { success: false, error: 'Supabase authentication service is not available.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: emailStr,
      password: pwdStr,
      options: {
        data: {
          full_name: nameStr
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (err) {
    console.error('[Auth] Registration error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during registration.'
    };
  }
}

/**
 * 2. REAL LOGIN
 * Authenticates user credentials against Supabase Auth.
 * Fetches authoritative database profile and updates app store.
 * Does NOT fall back to demo mode or use demo role selection.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, profile?: object, session?: object, error?: string}>}
 */
export async function loginUser(email, password) {
  const emailStr = (email || '').trim();
  const pwdStr = password || '';

  if (!emailStr) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!pwdStr) {
    return { success: false, error: 'Password is required.' };
  }

  if (!isSupabaseReady() || !supabase) {
    return { success: false, error: 'Supabase authentication service is not available.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailStr,
      password: pwdStr
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;
    if (!user) {
      return { success: false, error: 'No user returned from authentication server.' };
    }

    // Fetch authoritative user profile from database
    let profile = await fetchUserProfile(user.id);
    if (!profile) {
      profile = {
        id: user.id,
        role: user.user_metadata?.role || 'patient',
        full_name: user.user_metadata?.full_name || user.email || 'Curis User',
        email: user.email
      };
    }

    // Store in application state architecture
    handleAuthenticatedUser(user, profile);

    return {
      success: true,
      user,
      profile,
      session: data.session
    };
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected authentication error occurred.'
    };
  }
}

/**
 * 3. PROFILE FETCHING
 * Queries public.profiles table for specified user ID.
 * Selects only: id, role, full_name, email.
 *
 * @param {string} userId
 * @returns {Promise<{id: string, role: string, full_name: string, email: string} | null>}
 */
export async function fetchUserProfile(userId) {
  if (!userId) return null;
  if (!isSupabaseReady() || !supabase) {
    console.warn('[Auth] Cannot fetch profile: Supabase client is not ready.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Auth] Error fetching profile for user', userId, ':', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Auth] Unexpected error fetching user profile:', err);
    return null;
  }
}

/**
 * 4. REAL LOGOUT
 * Signs out of Supabase Auth and resets application store state.
 */
export async function logoutUser() {
  try {
    if (isSupabaseReady() && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('[Auth] Supabase signOut warning:', error.message);
      }
    }
  } catch (err) {
    console.error('[Auth] Unexpected error during logout:', err);
  } finally {
    store.clearAuthenticatedUser();
    navigateToPublic();
  }
}

/**
 * 5. AUTHENTICATED USER HANDLING
 * Takes Supabase user + database profile and persists in existing Store architecture.
 *
 * @param {object} user - Supabase Auth User
 * @param {object} [profile] - DB Profile from public.profiles
 */
export function handleAuthenticatedUser(user, profile) {
  if (!user) return;

  const role = (profile?.role || user.user_metadata?.role || 'patient').toLowerCase();
  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || 'Curis User';
  const email = profile?.email || user.email || '';

  const userData = {
    id: user.id,
    name: fullName,
    full_name: fullName,
    email: email,
    role: role,
    avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null
  };

  store.setAuthenticatedUser(userData);
}

/**
 * Initialize Modal & Auth Triggers & Form Event Handlers
 */
export function initAuth() {
  // Trigger buttons
  document.querySelectorAll('[data-action="open-login"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuthAlerts();
      openModal('login-modal');
    });
  });

  document.querySelectorAll('[data-action="open-register"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clearAuthAlerts();
      openModal('register-modal');
    });
  });

  document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Auth Mode Tabs in Login Modal (Real Account vs Demo Mode)
  document.querySelectorAll('[data-auth-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      const mode = e.currentTarget.getAttribute('data-auth-tab');
      const realForm = document.getElementById('login-form');
      const demoForm = document.getElementById('demo-login-form');

      document.querySelectorAll('[data-auth-tab]').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');

      if (mode === 'real') {
        if (realForm) realForm.style.display = 'block';
        if (demoForm) demoForm.style.display = 'none';
      } else {
        if (realForm) realForm.style.display = 'none';
        if (demoForm) demoForm.style.display = 'block';
      }
    });
  });

  // 1. Real Login Form Submission Handler (#login-form)
  const realLoginForm = document.getElementById('login-form');
  if (realLoginForm) {
    realLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthAlerts();

      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const submitBtn = document.getElementById('btn-submit-login');
      const errorDiv = document.getElementById('login-auth-error');

      const email = emailInput ? emailInput.value : '';
      const password = passwordInput ? passwordInput.value : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';
      }

      const result = await loginUser(email, password);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
      }

      if (result.success) {
        if (realLoginForm) realLoginForm.reset();
        closeAllModals();
        navigateToApp();
      } else {
        if (errorDiv) {
          errorDiv.className = 'auth-alert error';
          errorDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${result.error || 'Authentication failed.'}`;
          errorDiv.style.display = 'flex';
        }
      }
    });
  }

  // 2. Demo Mode Login Form Handler (#demo-login-form)
  const demoLoginForm = document.getElementById('demo-login-form');
  if (demoLoginForm) {
    demoLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // If real auth is active, do not allow demo switcher to override
      if (store.isRealAuth()) return;
      const roleSelect = document.getElementById('login-role-select');
      if (roleSelect) {
        const role = roleSelect.value;
        store.setCurrentRole(role);
      }
      closeAllModals();
      navigateToApp();
    });
  }

  // 3. Registration Form Handler (#register-form)
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAuthAlerts();

      const fullName = document.getElementById('reg-fullname')?.value || '';
      const email = document.getElementById('reg-email')?.value || '';
      const password = document.getElementById('reg-password')?.value || '';
      const confirmPassword = document.getElementById('reg-confirm-password')?.value || '';
      const submitBtn = document.getElementById('btn-submit-register');
      const msgDiv = document.getElementById('reg-auth-msg');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
      }

      const result = await registerUser(fullName, email, password, confirmPassword);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
      }

      if (result.success) {
        if (msgDiv) {
          msgDiv.className = 'auth-alert success';
          msgDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> Registration successful! You can now sign in with your credentials. (Note: Check your email for confirmation if required by your Supabase project settings).`;
          msgDiv.style.display = 'flex';
        }
        if (registerForm) registerForm.reset();
      } else {
        if (msgDiv) {
          msgDiv.className = 'auth-alert error';
          msgDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${result.error || 'Registration failed.'}`;
          msgDiv.style.display = 'flex';
        }
      }
    });
  }

  // Logout Button Handler
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
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

function clearAuthAlerts() {
  document.querySelectorAll('.auth-alert').forEach(el => {
    if (el.classList.contains('error') || el.classList.contains('success')) {
      el.style.display = 'none';
      el.textContent = '';
    }
  });
}


