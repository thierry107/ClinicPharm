/**
 * Curis Health - Point of Sale (POS), Billing & Receipt Generator
 */

import { store } from './store.js';

let currentCart = [];
let selectedPatientName = 'Walk-in Customer';

export function renderPosView(container, role) {
  const medicines = store.getMedicines();
  const patients = store.getPatients();

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Chemist Point of Sale (POS) & Billing</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Fast dispensing checkout, prescription auto-fill, and printable receipts in KSh.</p>
      </div>
      <button class="btn btn-secondary" id="btn-clear-cart"><i class="fa-solid fa-rotate-left"></i> Reset Cart</button>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 420px; gap: 1.5rem;">
      
      <!-- Left Column: Medicine Catalog Selection -->
      <div>
        <div style="margin-bottom: 1rem; display: flex; gap: 0.75rem;">
          <div class="topbar-search" style="width: 100%;">
            <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
            <input type="text" id="pos-search-input" placeholder="Search medicine to add to cart...">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;" id="pos-medicine-grid">
          ${renderPosMedCards(medicines)}
        </div>
      </div>

      <!-- Right Column: Active Cart & Billing Summary -->
      <div class="hero-preview-card" style="padding: 1.5rem; border-color: var(--border-glow);">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--emerald); display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-cart-shopping"></i> Dispensing Cart</span>
          <span class="status-badge active" id="cart-item-count">0 items</span>
        </h3>

        <!-- Patient Selection Dropdown -->
        <div class="form-group">
          <label>Select Patient / Customer</label>
          <select id="pos-patient-select">
            <option value="Walk-in Customer">Walk-in Customer</option>
            ${patients.map(p => `<option value="${p.name}">${p.name} (ID: ${p.id})</option>`).join('')}
          </select>
        </div>

        <!-- Cart Items Table -->
        <div style="min-height: 180px; max-height: 250px; overflow-y: auto; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;" id="pos-cart-table">
            <thead>
              <tr style="color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border-color);">
                <th style="padding-bottom: 0.5rem;">Medicine</th>
                <th style="padding-bottom: 0.5rem; text-align: center;">Qty</th>
                <th style="padding-bottom: 0.5rem; text-align: right;">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="pos-cart-body">
              <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">Cart is empty. Click medicines on the left to add.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Financial Summary Breakdown -->
        <div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span>Subtotal:</span>
            <span id="pos-subtotal">KSh 0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
            <span>Tax (8%):</span>
            <span id="pos-tax">KSh 0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.25rem; color: var(--emerald); border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
            <span>Total Amount:</span>
            <span id="pos-total">KSh 0.00</span>
          </div>
        </div>

        <!-- Payment Method Simulator -->
        <div class="form-group">
          <label>Payment Method</label>
          <select id="pos-payment-method">
            <option value="Mobile Money (MPesa)">Mobile Money (MPesa Simulator)</option>
            <option value="Cash">Cash Payment</option>
            <option value="Insurance Claim">Insurance Claim</option>
            <option value="Credit / Debit Card">Credit / Debit Card</option>
          </select>
        </div>

        <button class="btn btn-primary" style="width: 100%; padding: 0.875rem;" id="btn-complete-pos">
          <i class="fa-solid fa-print"></i> Complete Sale & Generate Receipt
        </button>
      </div>

    </div>
  `;

  // Search listener
  document.getElementById('pos-search-input')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = store.getMedicines().filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    document.getElementById('pos-medicine-grid').innerHTML = renderPosMedCards(filtered);
    bindMedCardListeners();
  });

  document.getElementById('pos-patient-select')?.addEventListener('change', (e) => {
    selectedPatientName = e.target.value;
  });

  document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
    currentCart = [];
    updateCartUI();
  });

  document.getElementById('btn-complete-pos')?.addEventListener('click', () => {
    if (currentCart.length === 0) {
      alert('⚠️ Cart is empty! Add items first.');
      return;
    }

    const subtotal = currentCart.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;
    const paymentMethod = document.getElementById('pos-payment-method').value;

    const sale = store.addDirectSale({
      patientName: selectedPatientName,
      items: currentCart,
      subtotal: subtotal,
      discount: 0.00,
      tax: tax,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod
    });

    openReceiptModal(sale);
    currentCart = [];
    updateCartUI();
  });

  bindMedCardListeners();
  updateCartUI();
}

function renderPosMedCards(medicines) {
  return medicines.map(m => `
    <div class="feature-card pos-med-card" data-med-id="${m.id}" style="padding: 1.25rem; cursor: pointer;">
      <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">${m.name}</div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">${m.category} • Stock: <strong>${m.stock}</strong></div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; color: var(--emerald); font-size: 1.1rem;">KSh ${m.unitPrice.toFixed(2)}</span>
        <button class="btn btn-sm btn-cyan"><i class="fa-solid fa-plus"></i> Add</button>
      </div>
    </div>
  `).join('');
}

function bindMedCardListeners() {
  document.querySelectorAll('.pos-med-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const medId = e.currentTarget.getAttribute('data-med-id');
      const med = store.getMedicines().find(m => m.id === medId);
      if (!med) return;

      if (med.stock <= 0) {
        alert(`❌ ${med.name} is out of stock!`);
        return;
      }

      const existing = currentCart.find(i => i.medicineId === med.id);
      if (existing) {
        if (existing.qty < med.stock) {
          existing.qty += 1;
          existing.total = existing.qty * existing.price;
        } else {
          alert(`⚠️ Cannot add more than available stock (${med.stock}).`);
        }
      } else {
        currentCart.push({
          medicineId: med.id,
          medicineName: med.name,
          qty: 1,
          price: med.unitPrice,
          total: med.unitPrice
        });
      }

      updateCartUI();
    });
  });
}

function updateCartUI() {
  const cartBody = document.getElementById('pos-cart-body');
  const itemCountEl = document.getElementById('cart-item-count');
  const subtotalEl = document.getElementById('pos-subtotal');
  const taxEl = document.getElementById('pos-tax');
  const totalEl = document.getElementById('pos-total');

  if (!cartBody) return;

  if (currentCart.length === 0) {
    cartBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">Cart is empty. Click medicines on the left to add.</td></tr>`;
    if (itemCountEl) itemCountEl.textContent = '0 items';
    if (subtotalEl) subtotalEl.textContent = 'KSh 0.00';
    if (taxEl) taxEl.textContent = 'KSh 0.00';
    if (totalEl) totalEl.textContent = 'KSh 0.00';
    return;
  }

  cartBody.innerHTML = currentCart.map((item, index) => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: 0.5rem 0; font-weight: 600;">${item.medicineName}</td>
      <td style="padding: 0.5rem 0; text-align: center;">${item.qty}</td>
      <td style="padding: 0.5rem 0; text-align: right; color: var(--emerald); font-weight: 700;">KSh ${item.total.toFixed(2)}</td>
      <td style="padding: 0.5rem 0; text-align: right;">
        <button style="background:none; border:none; color:var(--rose); cursor:pointer;" onclick="window.removeCartItem(${index})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  const subtotal = currentCart.reduce((sum, i) => sum + i.total, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  if (itemCountEl) itemCountEl.textContent = `${currentCart.reduce((s, i) => s + i.qty, 0)} items`;
  if (subtotalEl) subtotalEl.textContent = `KSh ${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `KSh ${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `KSh ${total.toFixed(2)}`;
}

window.removeCartItem = (index) => {
  currentCart.splice(index, 1);
  updateCartUI();
};

function openReceiptModal(sale) {
  const modal = document.getElementById('receipt-modal');
  const area = document.getElementById('printable-receipt-area');

  area.innerHTML = `
    <div style="text-align: center; border-bottom: 2px dashed #333; padding-bottom: 1rem; margin-bottom: 1rem;">
      <h2 style="font-weight: 800; font-size: 1.4rem;">CURIS HEALTH KENYA</h2>
      <p style="font-size: 0.85rem;">Integrated Clinic & Chemist Platform</p>
      <div style="font-size: 0.8rem; margin-top: 0.5rem;">Receipt No: <strong>${sale.receiptNo}</strong></div>
      <div style="font-size: 0.8rem;">Date: ${sale.date} • Time: ${sale.time}</div>
    </div>

    <div style="font-size: 0.85rem; margin-bottom: 1rem;">
      <div>Customer / Patient: <strong>${sale.patientName}</strong></div>
      <div>Payment Method: <strong>${sale.paymentMethod}</strong></div>
      <div>Processed By: ${sale.processedBy}</div>
    </div>

    <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse; margin-bottom: 1rem;">
      <thead>
        <tr style="border-bottom: 1px solid #333; text-align: left;">
          <th style="padding: 0.3rem 0;">Item</th>
          <th style="padding: 0.3rem 0; text-align: center;">Qty</th>
          <th style="padding: 0.3rem 0; text-align: right;">Price (KSh)</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items.map(item => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 0.4rem 0;">${item.medicineName}</td>
            <td style="padding: 0.4rem 0; text-align: center;">${item.qty}</td>
            <td style="padding: 0.4rem 0; text-align: right;">KSh ${item.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="font-size: 0.9rem; border-top: 2px dashed #333; padding-top: 0.75rem;">
      <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>KSh ${sale.subtotal.toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Tax (8%):</span><span>KSh ${sale.tax.toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; margin-top: 0.5rem;">
        <span>TOTAL PAID:</span><span>KSh ${sale.totalAmount.toFixed(2)}</span>
      </div>
    </div>

    <div style="text-align: center; font-size: 0.8rem; margin-top: 1.5rem; color: #555;">
      Thank you for choosing Curis Health!
    </div>
  `;

  modal.classList.add('active');
}
