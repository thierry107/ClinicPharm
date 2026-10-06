/**
 * Curis Health - Shared UI helpers
 *  - escapeHtml / esc : make user-entered text safe before it goes into innerHTML
 *  - showToast        : non-blocking replacement for alert()
 */

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escape text for safe use inside HTML content AND quoted attribute values.
 * null / undefined become an empty string. Numbers are converted to strings.
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

// Short alias used inside template literals: ${esc(patient.name)}
export const esc = escapeHtml;

const TOAST_ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info'
};

function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification (plain text only, so it is safe by construction).
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [durationMs=4500]
 */
export function showToast(message, type = 'info', durationMs = 4500) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = document.createElement('i');
  icon.className = `fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.info}`;
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = message; // textContent, never innerHTML

  toast.append(icon, text);
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  };
  toast.addEventListener('click', remove);
  setTimeout(remove, durationMs);
}
