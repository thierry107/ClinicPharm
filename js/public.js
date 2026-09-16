/**
 * Curis Health - Public Landing Page Logic
 */

import { store } from './store.js';

export function initPublicPage() {
  renderPublicMedicines();
}

export function renderPublicMedicines() {
  const container = document.getElementById('public-medicines-grid');
  if (!container) return;

  const medicines = store.getMedicines().slice(0, 6); // Top 6 for public view

  container.innerHTML = medicines.map(med => `
    <div class="feature-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <span class="status-badge active">${med.category}</span>
        <span style="font-weight: 700; color: var(--emerald); font-size: 1.1rem;">KSh ${med.unitPrice.toFixed(2)}</span>
      </div>
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">${med.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${med.description}</p>
      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;">
        <span>SKU: ${med.sku}</span>
        <span>${med.stock > 0 ? `<i class="fa-solid fa-check-circle" style="color:var(--emerald);"></i> In Stock` : `<i class="fa-solid fa-times-circle" style="color:var(--rose);"></i> Out of Stock`}</span>
      </div>
    </div>
  `).join('');
}
