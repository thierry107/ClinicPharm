/**
 * Curis Health - Prescription & Chemist Dispensing Queue Module
 */

import { store } from './store.js';

export function renderPrescriptionsView(container, role) {
  const prescriptions = store.getPrescriptions();

  container.innerHTML = `
    <div class="view-header-bar">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Prescription Dispensing & Clinic Bridge</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Connected workflow connecting doctor prescriptions to chemist stock dispensing.</p>
      </div>
      ${role === 'doctor' || role === 'admin' ? `
        <button class="btn btn-primary" id="btn-create-rx"><i class="fa-solid fa-file-circle-plus"></i> + Issue New Prescription</button>
      ` : ''}
    </div>

    <!-- Active Prescription Queue -->
    <div class="table-card">
      <div class="table-header">
        <h3 style="font-size: 1rem; font-weight: 700;"><i class="fa-solid fa-boxes-packing" style="color:var(--emerald);"></i> Live Chemist Dispensing Queue</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Rx ID</th>
            <th>Patient Name</th>
            <th>Prescribing Doctor</th>
            <th>Prescribed Items</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="rx-table-body">
          ${renderRxRows(prescriptions, role)}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-create-rx')?.addEventListener('click', () => {
    openCreateRxModal();
  });

  bindRxActionListeners();
}

function renderRxRows(prescriptions, role) {
  if (prescriptions.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No prescriptions issued yet.</td></tr>`;
  }

  return prescriptions.map(rx => `
    <tr>
      <td style="font-weight: 700; color: var(--cyan);">${rx.id}</td>
      <td style="font-weight: 600;">${rx.patientName}</td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">${rx.doctorName}</td>
      <td>
        <ul style="list-style: none; padding: 0; font-size: 0.85rem;">
          ${rx.items.map(i => `
            <li><i class="fa-solid fa-pills" style="color:var(--emerald); font-size:0.75rem;"></i> <strong>${i.medicineName}</strong> (Qty: ${i.quantity}) - <span style="color:var(--text-muted);">${i.frequency}</span></li>
          `).join('')}
        </ul>
      </td>
      <td style="font-size: 0.825rem; color: var(--text-muted);">${rx.date}</td>
      <td>
        <span class="status-badge ${rx.status === 'Dispensed' ? 'dispensed' : 'pending'}">${rx.status}</span>
      </td>
      <td>
        ${rx.status === 'Pending Dispense' && (role === 'admin' || role === 'chemist') ? `
          <button class="btn btn-sm btn-primary dispense-rx-btn" data-rx-id="${rx.id}">
            <i class="fa-solid fa-cart-shopping"></i> Dispense & Update Stock
          </button>
        ` : `
          <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-circle-check" style="color:var(--emerald);"></i> Completed</span>
        `}
      </td>
    </tr>
  `).join('');
}

function bindRxActionListeners() {
  document.querySelectorAll('.dispense-rx-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rxId = e.currentTarget.getAttribute('data-rx-id');
      window.dispenseRxDirect(rxId);
    });
  });
}

// Global dispense trigger
window.dispenseRxDirect = (rxId) => {
  const result = store.dispensePrescription(rxId, 'Cash');
  if (result.success) {
    alert(`✅ SUCCESS:\n${result.message}\nReceipt No: ${result.sale.receiptNo}\nTotal Charged: KSh ${result.sale.totalAmount.toFixed(2)}`);
    window.location.hash = ''; // Trigger re-render
    store.notify();
  } else {
    alert(`❌ ERROR: ${result.message}`);
  }
};

function openCreateRxModal() {
  const modal = document.getElementById('create-rx-modal');
  const patientSelect = document.getElementById('rx-patient-select');
  const medSelect = document.getElementById('rx-medicine-select');

  if (patientSelect) {
    patientSelect.innerHTML = store.getPatients().map(p => `<option value="${p.id}" data-name="${p.name}">${p.name}</option>`).join('');
  }
  if (medSelect) {
    medSelect.innerHTML = store.getMedicines().map(m => `<option value="${m.id}" data-name="${m.name}" data-price="${m.unitPrice}">${m.name} (Stock: ${m.stock}, KSh ${m.unitPrice.toFixed(2)})</option>`).join('');
  }

  if (modal) modal.classList.add('active');
}
