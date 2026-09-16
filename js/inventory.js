/**
 * ClinicPharm Enterprise SaaS - Pharmacy Inventory & Medicines Module
 */

import { store } from './store.js';

export function renderInventoryView(container, role) {
  const medicines = store.getMedicines();
  const suppliers = store.getSuppliers();

  const lowStockCount = medicines.filter(m => m.stock <= m.minReorderLevel).length;

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Chemist Inventory & Stock Catalog</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Track drug stock levels, batch numbers, expiry dates, and supplier re-orders.</p>
      </div>
      ${role === 'admin' || role === 'chemist' ? `
        <button class="btn btn-primary" id="btn-add-medicine"><i class="fa-solid fa-plus-circle"></i> + Add New Medicine</button>
      ` : ''}
    </div>

    <!-- Alert Banner if Low Stock -->
    ${lowStockCount > 0 ? `
      <div style="background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.3); padding: 1rem 1.25rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--rose);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem;"></i>
          <div>
            <strong style="font-size: 0.95rem;">${lowStockCount} Medicine(s) Below Minimum Re-order Level!</strong>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Restock requested to prevent inventory stockouts.</div>
          </div>
        </div>
        <button class="btn btn-sm btn-secondary" style="border-color: var(--rose); color: var(--rose);" onclick="document.getElementById('inventory-search-input').value='Low Stock'; document.getElementById('inventory-search-input').dispatchEvent(new Event('input'));">
          Filter Low Stock
        </button>
      </div>
    ` : ''}

    <div style="margin-bottom: 1.25rem; display: flex; gap: 1rem;">
      <div class="topbar-search" style="width: 100%; max-width: 400px;">
        <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
        <input type="text" id="inventory-search-input" placeholder="Search medicine by name, category, SKU or batch...">
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU & Name</th>
            <th>Category</th>
            <th>Stock Count</th>
            <th>Unit Price</th>
            <th>Batch & Expiry</th>
            <th>Supplier</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="inventory-table-body">
          ${renderInventoryRows(medicines, role)}
        </tbody>
      </table>
    </div>

    <!-- Suppliers Table Section -->
    <div style="margin-top: 3rem;">
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--cyan);"><i class="fa-solid fa-truck-field"></i> Pharmaceutical Suppliers</h3>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Lead Time</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map(s => `
              <tr>
                <td style="font-weight: 700;">${s.name}</td>
                <td>${s.contactPerson}</td>
                <td>${s.phone}</td>
                <td style="color:var(--cyan);">${s.email}</td>
                <td>${s.leadTimeDays} days</td>
                <td><span class="status-badge active"><i class="fa-solid fa-star" style="color:var(--amber);"></i> ${s.rating}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search listener
  const searchInput = document.getElementById('inventory-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = store.getMedicines().filter(m => {
        if (q === 'low stock') return m.stock <= m.minReorderLevel;
        return m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q);
      });
      document.getElementById('inventory-table-body').innerHTML = renderInventoryRows(filtered, role);
    });
  }

  document.getElementById('btn-add-medicine')?.addEventListener('click', () => {
    const modal = document.getElementById('add-medicine-modal');
    if (modal) modal.classList.add('active');
  });
}

function renderInventoryRows(medicines, role) {
  if (medicines.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No medicines found.</td></tr>`;
  }

  return medicines.map(m => {
    const isLow = m.stock <= m.minReorderLevel;
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${m.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${m.sku} • Batch: ${m.batchNo}</div>
        </td>
        <td><span class="status-badge active">${m.category}</span></td>
        <td>
          <span style="font-size: 1.05rem; font-weight: 700; color: ${isLow ? 'var(--rose)' : 'var(--emerald)'};">
            ${m.stock} units
          </span>
          ${isLow ? `<span class="status-badge low-stock" style="margin-left:0.4rem;">Low Stock</span>` : ''}
        </td>
        <td style="font-weight: 700; color: var(--emerald);">$${m.unitPrice.toFixed(2)}</td>
        <td style="font-size: 0.825rem; color: var(--text-secondary);">${m.expiryDate}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${m.supplier}</td>
        <td>
          ${role === 'admin' || role === 'chemist' ? `
            <button class="btn btn-sm btn-secondary" onclick="window.quickRestock('${m.id}')"><i class="fa-solid fa-boxes-packing"></i> Restock +50</button>
          ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Available</span>`}
        </td>
      </tr>
    `;
  }).join('');
}

window.quickRestock = (medId) => {
  store.updateStock(medId, 50);
  alert('✅ Restocked 50 units successfully!');
};
