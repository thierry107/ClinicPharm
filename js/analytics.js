/**
 * Curis Health - Financial & Operational Analytics Module
 */

import { store } from './store.js';

export function renderAnalyticsView(container, role) {
  const sales = store.getSales();
  const medicines = store.getMedicines();
  const patients = store.getPatients();
  const appointments = store.getAppointments();

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  container.innerHTML = `
    <div class="view-header-bar">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Operational Analytics & Financial Ledger</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Overview of clinic patient metrics, chemist sales, and inventory performance in Kenyan Shillings (KSh).</p>
      </div>
    </div>

    <!-- Overview Stat Cards -->
    <div class="dashboard-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Total Gross Revenue</div>
          <div class="kpi-value" style="color:var(--emerald);">KSh ${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="kpi-icon" style="background:var(--emerald-glow); color:var(--emerald);"><i class="fa-solid fa-chart-line"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Total Completed Sales</div>
          <div class="kpi-value">${sales.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--cyan-glow); color:var(--cyan);"><i class="fa-solid fa-receipt"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Registered Patients</div>
          <div class="kpi-value">${patients.length}</div>
        </div>
        <div class="kpi-icon" style="background:rgba(99,102,241,0.15); color:var(--indigo);"><i class="fa-solid fa-users"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Active Medicines</div>
          <div class="kpi-value">${medicines.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--amber-glow); color:var(--amber);"><i class="fa-solid fa-pills"></i></div>
      </div>
    </div>

    <!-- Sales Transaction Ledger Table -->
    <div class="table-card">
      <div class="table-header">
        <h3 style="font-size: 1rem; font-weight: 700;"><i class="fa-solid fa-book" style="color:var(--cyan);"></i> Sales Transaction Ledger</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Date & Time</th>
            <th>Customer / Patient</th>
            <th>Items Count</th>
            <th>Payment Method</th>
            <th>Total Charged</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${sales.length === 0 ? `
            <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No transaction ledger records.</td></tr>
          ` : sales.map(s => `
            <tr>
              <td style="font-weight: 700; color: var(--cyan);">${s.receiptNo}</td>
              <td style="font-size: 0.85rem; color: var(--text-secondary);">${s.date} ${s.time}</td>
              <td style="font-weight: 600;">${s.patientName}</td>
              <td>${s.items.length} items</td>
              <td><span class="status-badge active">${s.paymentMethod}</span></td>
              <td style="font-weight: 700; color: var(--emerald);">KSh ${s.totalAmount.toFixed(2)}</td>
              <td><span class="status-badge paid">${s.paymentStatus}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
