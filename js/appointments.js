/**
 * ClinicPharm Enterprise SaaS - Appointments & Consultations Module
 */

import { store } from './store.js';

export function renderAppointmentsView(container, role) {
  const appointments = store.getAppointments();
  const doctors = store.getStaff().filter(s => s.role === 'doctor');
  const patients = store.getPatients();

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 1.75rem; font-weight: 800;">Appointments & Doctor Consultations</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Schedule visits, manage clinical queues, and conduct consultations.</p>
      </div>
      <button class="btn btn-primary" id="btn-book-appointment"><i class="fa-solid fa-calendar-plus"></i> + Book Appointment</button>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Patient</th>
            <th>Assigned Doctor</th>
            <th>Date & Time</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="appointments-table-body">
          ${renderAppointmentRows(appointments, role)}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-book-appointment')?.addEventListener('click', () => {
    openBookAppointmentModal(patients, doctors);
  });

  bindAppointmentListeners();
}

function renderAppointmentRows(appointments, role) {
  if (appointments.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No appointments scheduled.</td></tr>`;
  }

  return appointments.map(apt => `
    <tr>
      <td style="font-weight: 700; color: var(--cyan);">${apt.id}</td>
      <td style="font-weight: 600;">${apt.patientName}</td>
      <td>${apt.doctorName}</td>
      <td>${apt.date} • <span style="color:var(--text-secondary);">${apt.time}</span></td>
      <td><span class="status-badge active">${apt.type}</span></td>
      <td><span class="status-badge ${apt.status === 'Completed' ? 'completed' : (apt.status === 'In Consultation' ? 'in-consultation' : 'scheduled')}">${apt.status}</span></td>
      <td>
        ${apt.status !== 'Completed' && (role === 'doctor' || role === 'admin') ? `
          <button class="btn btn-sm btn-cyan start-consultation-btn" data-apt-id="${apt.id}"><i class="fa-solid fa-stethoscope"></i> Start Consultation</button>
        ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Viewed</span>`}
      </td>
    </tr>
  `).join('');
}

function bindAppointmentListeners() {
  document.querySelectorAll('.start-consultation-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const aptId = e.currentTarget.getAttribute('data-apt-id');
      openConsultationModal(aptId);
    });
  });
}

function openBookAppointmentModal(patients, doctors) {
  const modal = document.getElementById('book-appointment-modal');
  const patientSelect = document.getElementById('apt-patient-select');
  const doctorSelect = document.getElementById('apt-doctor-select');

  if (patientSelect) {
    patientSelect.innerHTML = patients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('');
  }
  if (doctorSelect) {
    doctorSelect.innerHTML = doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('');
  }

  if (modal) modal.classList.add('active');
}

function openConsultationModal(aptId) {
  const apt = store.getAppointments().find(a => a.id === aptId);
  if (!apt) return;

  const modal = document.getElementById('consultation-modal');
  const body = document.getElementById('consultation-modal-body');

  body.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--cyan);">Clinical Consultation: ${apt.patientName}</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary);">Doctor: ${apt.doctorName} • Date: ${apt.date}</p>
    </div>

    <form id="consultation-record-form">
      <input type="hidden" id="con-apt-id" value="${apt.id}">
      <input type="hidden" id="con-pat-id" value="${apt.patientId}">
      <input type="hidden" id="con-pat-name" value="${apt.patientName}">

      <div class="form-group">
        <label>Chief Complaint / Symptoms</label>
        <textarea id="con-symptoms" rows="2" placeholder="e.g. Fever, persistent cough for 3 days..." required></textarea>
      </div>

      <div class="form-group">
        <label>Doctor's Diagnosis</label>
        <input type="text" id="con-diagnosis" placeholder="e.g. Acute Bronchitis" required>
      </div>

      <div class="form-group">
        <label>Clinical & Dietary Advice</label>
        <textarea id="con-notes" rows="2" placeholder="e.g. Rest, increase fluid intake..."></textarea>
      </div>

      <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 1rem; border-radius: var(--radius-md); margin-top: 1rem;">
        <div style="font-weight: 700; color: var(--emerald); font-size: 0.9rem; margin-bottom: 0.25rem;">
          <i class="fa-solid fa-arrow-right-arrow-left"></i> Connected Clinic-to-Chemist Bridge
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">
          Saving this consultation will immediately allow you to write and send a prescription directly to the Chemist Dispensing Queue!
        </div>
      </div>
    </form>
  `;

  modal.classList.add('active');
}
