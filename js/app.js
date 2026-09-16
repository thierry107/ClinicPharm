/**
 * ClinicPharm Enterprise SaaS - Application Entry Point & Global Event Bindings
 */

import { store } from './store.js';
import { initPublicPage } from './public.js';
import { initAuth, closeAllModals } from './auth.js';
import { initNavigation, renderActiveTab } from './navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Subsystems
  initPublicPage();
  initAuth();
  initNavigation();

  // Subscribe Store to re-render active SPA tab when state changes
  store.subscribe(() => {
    renderActiveTab();
  });

  // Bind Form Submissions for Modals
  bindModalForms();
});

function bindModalForms() {
  // 1. Add Patient Form
  const addPatientForm = document.getElementById('form-add-patient');
  if (addPatientForm) {
    addPatientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPatient = store.addPatient({
        name: document.getElementById('pat-name').value,
        age: parseInt(document.getElementById('pat-age').value) || 30,
        gender: document.getElementById('pat-gender').value,
        phone: document.getElementById('pat-phone').value,
        email: document.getElementById('pat-email').value,
        bloodGroup: document.getElementById('pat-blood').value,
        allergies: document.getElementById('pat-allergies').value.split(',').map(s => s.trim()),
        medicalHistory: document.getElementById('pat-history').value || "None recorded",
        vitals: {
          bp: document.getElementById('pat-bp').value || "120/80",
          pulse: parseInt(document.getElementById('pat-pulse').value) || 72,
          temp: document.getElementById('pat-temp').value || "36.6°C",
          weight: document.getElementById('pat-weight').value || "70 kg"
        }
      });

      alert(`✅ Patient ${newPatient.name} registered successfully with ID ${newPatient.id}!`);
      closeAllModals();
      addPatientForm.reset();
    });
  }

  // 2. Book Appointment Form
  const bookAptForm = document.getElementById('form-book-appointment');
  if (bookAptForm) {
    bookAptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patSelect = document.getElementById('apt-patient-select');
      const docSelect = document.getElementById('apt-doctor-select');

      const patObj = store.getPatientById(patSelect.value);
      const docObj = store.getStaff().find(s => s.id === docSelect.value);

      const newApt = store.addAppointment({
        patientId: patSelect.value,
        patientName: patObj ? patObj.name : 'Unknown Patient',
        doctorId: docSelect.value,
        doctorName: docObj ? docObj.name : 'Dr. Sarah Jenkins',
        date: document.getElementById('apt-date').value,
        time: document.getElementById('apt-time').value,
        type: document.getElementById('apt-type').value,
        notes: document.getElementById('apt-notes').value || "Routine appointment"
      });

      alert(`✅ Appointment ${newApt.id} scheduled for ${newApt.patientName}!`);
      closeAllModals();
      bookAptForm.reset();
    });
  }

  // 3. Consultation Form Submission (inside Consultation Modal)
  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'consultation-record-form') {
      e.preventDefault();
      const aptId = document.getElementById('con-apt-id').value;
      const patId = document.getElementById('con-pat-id').value;
      const patName = document.getElementById('con-pat-name').value;

      const con = store.addConsultation({
        appointmentId: aptId,
        patientId: patId,
        patientName: patName,
        doctorId: store.getCurrentUser().id,
        doctorName: store.getCurrentUser().name,
        symptoms: document.getElementById('con-symptoms').value,
        diagnosis: document.getElementById('con-diagnosis').value,
        notes: document.getElementById('con-notes').value
      });

      alert(`✅ Consultation record ${con.id} saved!\nRedirecting to Prescription Queue to issue medicines...`);
      closeAllModals();
      window.navigateToTab('prescriptions');
    }
  });

  // 4. Create Prescription Form
  const createRxForm = document.getElementById('form-create-rx');
  if (createRxForm) {
    createRxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patSelect = document.getElementById('rx-patient-select');
      const medSelect = document.getElementById('rx-medicine-select');

      const patName = patSelect.options[patSelect.selectedIndex].getAttribute('data-name');
      const medName = medSelect.options[medSelect.selectedIndex].getAttribute('data-name');
      const medPrice = parseFloat(medSelect.options[medSelect.selectedIndex].getAttribute('data-price')) || 1.0;

      const qty = parseInt(document.getElementById('rx-qty').value) || 10;

      const rx = store.createPrescription({
        patientId: patSelect.value,
        patientName: patName,
        doctorId: store.getCurrentUser().id,
        doctorName: store.getCurrentUser().name,
        items: [
          {
            medicineId: medSelect.value,
            medicineName: medName,
            dosage: document.getElementById('rx-dosage').value || '1 tablet',
            frequency: document.getElementById('rx-frequency').value || 'Daily',
            duration: document.getElementById('rx-duration').value || '7 days',
            quantity: qty,
            unitPrice: medPrice,
            instructions: document.getElementById('rx-instructions').value || 'Take after food'
          }
        ]
      });

      alert(`✅ Prescription ${rx.id} issued to Chemist Dispensing Queue for ${rx.patientName}!`);
      closeAllModals();
      createRxForm.reset();
    });
  }

  // 5. Add Medicine Form
  const addMedForm = document.getElementById('form-add-medicine');
  if (addMedForm) {
    addMedForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const med = store.addMedicine({
        name: document.getElementById('med-name').value,
        category: document.getElementById('med-category').value,
        sku: document.getElementById('med-sku').value || `MED-${Date.now().toString().slice(-4)}`,
        stock: parseInt(document.getElementById('med-stock').value) || 50,
        minReorderLevel: parseInt(document.getElementById('med-reorder').value) || 20,
        unitPrice: parseFloat(document.getElementById('med-price').value) || 1.00,
        costPrice: parseFloat(document.getElementById('med-cost').value) || 0.50,
        supplier: document.getElementById('med-supplier').value,
        description: document.getElementById('med-description').value || "Pharmaceutical medication"
      });

      alert(`✅ Medicine ${med.name} added to inventory catalog!`);
      closeAllModals();
      addMedForm.reset();
    });
  }
}
