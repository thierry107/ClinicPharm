/**
 * ClinicPharm Enterprise SaaS - Navigation & SPA View Router
 */

import { store } from './store.js';
import { renderPatientsView } from './patients.js';
import { renderAppointmentsView } from './appointments.js';
import { renderPrescriptionsView } from './prescriptions.js';
import { renderInventoryView } from './inventory.js';
import { renderPosView } from './pos.js';
import { renderAnalyticsView } from './analytics.js';

let activeTab = 'dashboard';

// Role-based Navigation Item Definitions
const ROLE_MENUS = {
  patient: [
    { id: 'dashboard', label: 'My Dashboard', icon: 'fa-chart-pie' },
    { id: 'appointments', label: 'My Appointments', icon: 'fa-calendar-check' },
    { id: 'prescriptions', label: 'My Prescriptions', icon: 'fa-file-prescription' },
    { id: 'inventory', label: 'Medicine Orders', icon: 'fa-pills' },
    { id: 'patients', label: 'Medical History', icon: 'fa-notes-medical' }
  ],
  doctor: [
    { id: 'dashboard', label: 'Doctor Dashboard', icon: 'fa-chart-pie' },
    { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-days' },
    { id: 'patients', label: 'Patient Directory', icon: 'fa-users-medical' },
    { id: 'prescriptions', label: 'Issue Prescriptions', icon: 'fa-file-prescription' },
    { id: 'inventory', label: 'Medicine Information', icon: 'fa-pills' }
  ],
  admin: [
    { id: 'dashboard', label: 'Executive Dashboard', icon: 'fa-chart-pie' },
    { id: 'patients', label: 'Patient Directory', icon: 'fa-users-medical' },
    { id: 'appointments', label: 'Appointments & Queue', icon: 'fa-calendar-days' },
    { id: 'prescriptions', label: 'Prescription Queue', icon: 'fa-file-prescription' },
    { id: 'inventory', label: 'Chemist Inventory', icon: 'fa-boxes-stacked' },
    { id: 'pos', label: 'POS & Dispensing', icon: 'fa-cash-register' },
    { id: 'analytics', label: 'Financial Analytics', icon: 'fa-chart-line' }
  ]
};

export function initNavigation() {
  // Bind Demo Role Switcher Bar buttons
  document.querySelectorAll('[data-role-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role-switch');
      store.setCurrentRole(role);
      updateRoleUI();
      renderActiveTab();
    });
  });
}

export function navigateToPublic() {
  document.getElementById('public-website-view').style.display = 'block';
  document.getElementById('saas-app-view').style.display = 'none';
}

export function navigateToApp() {
  document.getElementById('public-website-view').style.display = 'none';
  document.getElementById('saas-app-view').style.display = 'flex';
  updateRoleUI();
  setActiveTab('dashboard');
}

export function updateRoleUI() {
  const user = store.getCurrentUser();
  const role = user.role;

  // Update topbar user details
  const nameEl = document.getElementById('topbar-user-name');
  const roleEl = document.getElementById('topbar-user-role');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.title || role.toUpperCase();

  // Update Role Pills
  document.querySelectorAll('[data-role-switch]').forEach(pill => {
    if (pill.getAttribute('data-role-switch') === role) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Render Sidebar Menu according to role
  const sidebarContainer = document.getElementById('sidebar-menu-list');
  if (!sidebarContainer) return;

  const menuItems = ROLE_MENUS[role] || ROLE_MENUS.admin;

  sidebarContainer.innerHTML = menuItems.map(item => `
    <li class="sidebar-link ${item.id === activeTab ? 'active' : ''}" data-tab="${item.id}">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
    </li>
  `).join('');

  // Bind click listeners on sidebar items
  sidebarContainer.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      setActiveTab(tab);
    });
  });
}

export function setActiveTab(tabId) {
  activeTab = tabId;
  updateRoleUI();
  renderActiveTab();
}

export function renderActiveTab() {
  const contentContainer = document.getElementById('saas-tab-content');
  if (!contentContainer) return;

  const role = store.getCurrentUser().role;

  switch (activeTab) {
    case 'patients':
      renderPatientsView(contentContainer, role);
      break;
    case 'appointments':
      renderAppointmentsView(contentContainer, role);
      break;
    case 'prescriptions':
      renderPrescriptionsView(contentContainer, role);
      break;
    case 'inventory':
      renderInventoryView(contentContainer, role);
      break;
    case 'pos':
      renderPosView(contentContainer, role);
      break;
    case 'analytics':
      renderAnalyticsView(contentContainer, role);
      break;
    case 'dashboard':
    default:
      renderDashboardView(contentContainer, role);
      break;
  }
}

// Render Main Dashboard KPI & Overview according to Role
function renderDashboardView(container, role) {
  const patients = store.getPatients();
  const appointments = store.getAppointments();
  const prescriptions = store.getPrescriptions();
  const medicines = store.getMedicines();
  const sales = store.getSales();

  const lowStockCount = medicines.filter(m => m.stock <= m.minReorderLevel).length;
  const todayRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  let kpiCardsHTML = '';

  if (role === 'patient') {
    kpiCardsHTML = `
      <div class="kpi-card">
        <div>
          <div class="kpi-title">My Appointments</div>
          <div class="kpi-value">${appointments.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--cyan-glow); color:var(--cyan);"><i class="fa-solid fa-calendar-check"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Active Prescriptions</div>
          <div class="kpi-value">${prescriptions.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--emerald-glow); color:var(--emerald);"><i class="fa-solid fa-file-prescription"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Completed Visits</div>
          <div class="kpi-value">2</div>
        </div>
        <div class="kpi-icon" style="background:rgba(99,102,241,0.15); color:var(--indigo);"><i class="fa-solid fa-stethoscope"></i></div>
      </div>
    `;
  } else if (role === 'doctor') {
    kpiCardsHTML = `
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Today's Appointments</div>
          <div class="kpi-value">${appointments.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--cyan-glow); color:var(--cyan);"><i class="fa-solid fa-user-clock"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Total Patients</div>
          <div class="kpi-value">${patients.length}</div>
        </div>
        <div class="kpi-icon" style="background:rgba(99,102,241,0.15); color:var(--indigo);"><i class="fa-solid fa-users-medical"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Issued Prescriptions</div>
          <div class="kpi-value">${prescriptions.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--emerald-glow); color:var(--emerald);"><i class="fa-solid fa-prescription-bottle-medical"></i></div>
      </div>
    `;
  } else {
    // Admin View
    kpiCardsHTML = `
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Total Patients</div>
          <div class="kpi-value">${patients.length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--cyan-glow); color:var(--cyan);"><i class="fa-solid fa-hospital-user"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Chemist Daily Sales</div>
          <div class="kpi-value" style="color:var(--emerald);">$${todayRevenue.toFixed(2)}</div>
        </div>
        <div class="kpi-icon" style="background:var(--emerald-glow); color:var(--emerald);"><i class="fa-solid fa-dollar-sign"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Pending Dispense</div>
          <div class="kpi-value">${prescriptions.filter(p => p.status === 'Pending Dispense').length}</div>
        </div>
        <div class="kpi-icon" style="background:var(--amber-glow); color:var(--amber);"><i class="fa-solid fa-clock"></i></div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-title">Low Stock Alerts</div>
          <div class="kpi-value" style="color:var(--rose);">${lowStockCount}</div>
        </div>
        <div class="kpi-icon" style="background:var(--rose-glow); color:var(--rose);"><i class="fa-solid fa-triangle-exclamation"></i></div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Welcome back, ${store.getCurrentUser().name}</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Here is your live Clinic & Chemist operational summary.</p>
      </div>
      ${role === 'admin' ? `
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="window.navigateToTab('pos')"><i class="fa-solid fa-cash-register"></i> Open POS Checkout</button>
          <button class="btn btn-cyan" onclick="window.navigateToTab('prescriptions')"><i class="fa-solid fa-prescription"></i> Prescription Queue</button>
        </div>
      ` : ''}
    </div>

    <!-- KPI Grid -->
    <div class="dashboard-grid">
      ${kpiCardsHTML}
    </div>

    <!-- Active Connected Workflow Bar -->
    <div class="hero-preview-card" style="margin-bottom: 2rem;">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--emerald);">
        <i class="fa-solid fa-diagram-project"></i> Connected Clinic-to-Chemist Live Workflow Status
      </h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
        <div class="preview-workflow-step">
          <div class="workflow-step-num">1</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">Appointments</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${appointments.filter(a => a.status === 'Scheduled').length} Scheduled</div>
          </div>
        </div>
        <div class="preview-workflow-step">
          <div class="workflow-step-num" style="background: var(--cyan);">2</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">Consultations</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${appointments.filter(a => a.status === 'In Consultation').length} In Progress</div>
          </div>
        </div>
        <div class="preview-workflow-step">
          <div class="workflow-step-num" style="background: var(--amber);">3</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">Prescriptions</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${prescriptions.filter(p => p.status === 'Pending Dispense').length} Pending Chemist</div>
          </div>
        </div>
        <div class="preview-workflow-step">
          <div class="workflow-step-num" style="background: var(--indigo); color: #fff;">4</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">Dispensed & POS</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${sales.length} Sales Completed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Prescriptions & Patients Tables -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <div class="table-card">
        <div class="table-header">
          <h3 style="font-size: 1rem; font-weight: 700;">Prescription Dispensing Queue</h3>
          <button class="btn btn-sm btn-secondary" onclick="window.navigateToTab('prescriptions')">View All</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Rx ID</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptions.slice(0, 4).map(rx => `
              <tr>
                <td style="font-weight: 700; color: var(--cyan);">${rx.id}</td>
                <td>${rx.patientName}</td>
                <td><span class="status-badge ${rx.status === 'Dispensed' ? 'dispensed' : 'pending'}">${rx.status}</span></td>
                <td>
                  ${rx.status === 'Pending Dispense' && (role === 'admin' || role === 'chemist') ? `
                    <button class="btn btn-sm btn-primary" onclick="window.dispenseRxDirect('${rx.id}')"><i class="fa-solid fa-box-open"></i> Dispense</button>
                  ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Filled</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3 style="font-size: 1rem; font-weight: 700;">Recent Patient Register</h3>
          <button class="btn btn-sm btn-secondary" onclick="window.navigateToTab('patients')">Manage</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Key Allergies</th>
              <th>Vitals (BP)</th>
            </tr>
          </thead>
          <tbody>
            ${patients.slice(0, 4).map(pat => `
              <tr>
                <td style="font-weight: 600;">${pat.name}</td>
                <td><span class="status-badge active">${pat.bloodGroup}</span></td>
                <td style="font-size: 0.8rem; color: var(--rose);">${pat.allergies.join(', ')}</td>
                <td style="font-weight: 600; font-size: 0.8rem; color: var(--cyan);">${pat.vitals?.bp || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Global helper for inline onclick events
window.navigateToTab = (tabId) => {
  setActiveTab(tabId);
};
