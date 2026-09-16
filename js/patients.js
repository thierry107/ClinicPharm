/**
 * ClinicPharm Enterprise SaaS - Patient & Medical Records Module
 */

import { store } from './store.js';

export function renderPatientsView(container, role) {
  const patients = store.getPatients();

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Patient Directory & Medical Records</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Manage patient profiles, vital signs, allergies, and clinical histories.</p>
      </div>
      ${role !== 'patient' ? `
        <button class="btn btn-primary" id="btn-add-patient"><i class="fa-solid fa-user-plus"></i> + Add New Patient</button>
      ` : ''}
    </div>

    <div style="margin-bottom: 1.25rem; display: flex; gap: 1rem;">
      <div class="topbar-search" style="width: 100%; max-width: 400px;">
        <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
        <input type="text" id="patient-search-input" placeholder="Search patient by name, phone, or ID...">
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Name & Details</th>
            <th>Blood Group</th>
            <th>Allergies</th>
            <th>Medical History</th>
            <th>Recent Vitals</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="patients-table-body">
          ${renderPatientRows(patients, role)}
        </tbody>
      </table>
    </div>
  `;

  // Search listener
  const searchInput = document.getElementById('patient-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = store.getPatients().filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.id.toLowerCase().includes(query) ||
        p.phone.includes(query)
      );
      document.getElementById('patients-table-body').innerHTML = renderPatientRows(filtered, role);
      bindPatientActionListeners();
    });
  }

  // Add Patient button
  const addBtn = document.getElementById('btn-add-patient');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openAddPatientModal();
    });
  }

  bindPatientActionListeners();
}

function renderPatientRows(patients, role) {
  if (patients.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No patient records found.</td></tr>`;
  }

  return patients.map(p => `
    <tr>
      <td style="font-weight: 700; color: var(--cyan);">${p.id}</td>
      <td>
        <div style="font-weight: 600;">${p.name}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${p.gender}, ${p.age} yrs • ${p.phone}</div>
      </td>
      <td><span class="status-badge active">${p.bloodGroup}</span></td>
      <td><span style="color: var(--rose); font-size: 0.825rem; font-weight: 600;">${p.allergies.join(', ')}</span></td>
      <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem;">${p.medicalHistory}</td>
      <td>
        <div style="font-size: 0.8rem; font-weight: 600; color: var(--emerald);">BP: ${p.vitals?.bp || 'N/A'}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">HR: ${p.vitals?.pulse || 'N/A'} bpm</div>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary view-medical-record-btn" data-patient-id="${p.id}"><i class="fa-solid fa-notes-medical"></i> View Record</button>
      </td>
    </tr>
  `).join('');
}

function bindPatientActionListeners() {
  document.querySelectorAll('.view-medical-record-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-patient-id');
      openMedicalRecordModal(id);
    });
  });
}

function openMedicalRecordModal(patientId) {
  const patient = store.getPatientById(patientId);
  if (!patient) return;

  const modal = document.getElementById('medical-record-modal');
  const body = document.getElementById('medical-record-modal-body');

  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
      <div>
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--emerald);">${patient.name}</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">ID: ${patient.id} • ${patient.gender}, ${patient.age} years • Blood Group: <strong>${patient.bloodGroup}</strong></p>
      </div>
      <span class="status-badge active">${patient.status}</span>
    </div>

    <!-- Vital Signs Card Grid -->
    <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--cyan);"><i class="fa-solid fa-heart-pulse"></i> Vital Signs Snapshot</h4>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
      <div style="background: rgba(15,23,42,0.6); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">Blood Pressure</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${patient.vitals?.bp}</div>
      </div>
      <div style="background: rgba(15,23,42,0.6); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">Pulse Rate</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--emerald);">${patient.vitals?.pulse} bpm</div>
      </div>
      <div style="background: rgba(15,23,42,0.6); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">Temperature</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--amber);">${patient.vitals?.temp}</div>
      </div>
      <div style="background: rgba(15,23,42,0.6); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-muted);">Weight</div>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--indigo);">${patient.vitals?.weight}</div>
      </div>
    </div>

    <!-- Medical History & Allergies -->
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;"><i class="fa-solid fa-file-medical"></i> Medical History</h4>
      <p style="background: var(--bg-main); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.9rem;">${patient.medicalHistory}</p>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--rose);"><i class="fa-solid fa-allergies"></i> Allergies & Contraindications</h4>
      <p style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.9rem; color: var(--rose); font-weight: 600;">
        ${patient.allergies.join(', ')}
      </p>
    </div>
  `;

  modal.classList.add('active');
}

function openAddPatientModal() {
  const modal = document.getElementById('add-patient-modal');
  if (modal) modal.classList.add('active');
}
