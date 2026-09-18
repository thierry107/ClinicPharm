/**
 * ClinicPharm Enterprise SaaS - Data & Service Abstraction Layer
 * Designed so UI calls Store methods (e.g. store.getPatients(), store.createPrescription()).
 * When Supabase is integrated later, ONLY this file will be updated to make async API calls!
 */

import { INITIAL_DATA } from './mock-data.js';

class DataStore {
  constructor() {
    this.STORAGE_KEY = 'clinicpharm_state_v1';
    this.listeners = [];
    this.state = this.loadState();
    this.authenticatedUser = null;
    this.authMode = 'demo'; // 'demo' | 'real'
  }

  // Load from localStorage or fallback to initial mock seed
  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge legacy photographic avatar if previously cached in localStorage
        if (parsed.currentUser && parsed.currentUser.avatar && parsed.currentUser.avatar.includes('unsplash.com')) {
          parsed.currentUser.avatar = null;
          parsed.currentUser.avatar_url = null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read localStorage state, using initial seed data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  // Save current state to local persistence
  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not persist state to localStorage.', e);
    }
    this.notify();
  }

  // Subscribe to state changes for dynamic UI re-rendering
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Reset to initial seed data
  resetState() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }

  // --- USER & ROLE SERVICES ---
  getCurrentUser() {
    if (this.isRealAuth()) {
      return this.authenticatedUser;
    }
    return this.state.currentUser;
  }

  isRealAuth() {
    return this.authMode === 'real' && this.authenticatedUser !== null;
  }

  getAuthMode() {
    return this.authMode;
  }

  setAuthenticatedUser(userData) {
    if (!userData) return;
    const role = (userData.role || 'patient').toLowerCase();

    // Contextual title based on verified database role
    let defaultTitle = 'Patient Portal User';
    if (role === 'doctor') defaultTitle = 'Medical Practitioner';
    else if (role === 'chemist') defaultTitle = 'Licensed Chemist / Pharmacist';
    else if (role === 'admin') defaultTitle = 'Chief Medical Officer & Administrator';

    this.authenticatedUser = {
      id: userData.id,
      name: userData.full_name || userData.name || 'Curis User',
      full_name: userData.full_name || userData.name || 'Curis User',
      email: userData.email || '',
      role: role,
      avatar: userData.avatar || null,
      avatar_url: userData.avatar_url || null,
      title: userData.title || defaultTitle
    };
    this.authMode = 'real';
    this.notify();
  }

  clearAuthenticatedUser() {
    this.authenticatedUser = null;
    this.authMode = 'demo';
    this.notify();
  }

  setCurrentRole(role) {
    // If real user is authenticated, database role is authoritative — demo switcher cannot override
    if (this.isRealAuth()) {
      console.warn('[Curis Health] Cannot change role in authenticated session. Database role is authoritative.');
      return;
    }

    if (['patient', 'doctor', 'chemist', 'admin'].includes(role)) {
      this.state.currentUser.role = role;
      if (role === 'patient') {
        this.state.currentUser.name = 'Arthur Pendelton (Patient)';
        this.state.currentUser.title = 'Patient Portal User';
      } else if (role === 'doctor') {
        this.state.currentUser.name = 'Dr. Olivia Birgen';
        this.state.currentUser.title = 'General Practitioner';
      } else if (role === 'chemist') {
        this.state.currentUser.name = 'Chemist Damon Sims';
        this.state.currentUser.title = 'Chief Chemist & Inventory Lead';
      } else {
        this.state.currentUser.name = 'Admin (Dr. Thiaw Henry)';
        this.state.currentUser.title = 'Chief Medical Officer & Administrator';
      }
      this.state.currentUser.avatar = null;
      this.state.currentUser.avatar_url = null;
      this.saveState();
    }
  }

  // --- PATIENTS SERVICE ---
  getPatients() {
    return this.state.patients || [];
  }

  getPatientById(id) {
    return this.state.patients.find(p => p.id === id);
  }

  addPatient(patientData) {
    const newId = `pat-${100 + this.state.patients.length + 1}`;
    const newPatient = {
      id: newId,
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      vitals: patientData.vitals || { bp: "120/80", pulse: 70, temp: "36.6°C", weight: "70 kg" },
      allergies: patientData.allergies || ["None"],
      medicalHistory: patientData.medicalHistory || "None recorded",
      ...patientData
    };
    this.state.patients.unshift(newPatient);
    this.saveState();
    return newPatient;
  }

  // --- STAFF SERVICE ---
  getStaff() {
    return this.state.staff || [];
  }

  // --- APPOINTMENTS SERVICE ---
  getAppointments() {
    return this.state.appointments || [];
  }

  addAppointment(appointmentData) {
    const newId = `apt-${300 + this.state.appointments.length + 1}`;
    const newAppointment = {
      id: newId,
      status: 'Scheduled',
      ...appointmentData
    };
    this.state.appointments.unshift(newAppointment);
    this.saveState();
    return newAppointment;
  }

  updateAppointmentStatus(id, status) {
    const apt = this.state.appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      this.saveState();
    }
  }

  // --- CONSULTATIONS SERVICE ---
  getConsultations() {
    return this.state.consultations || [];
  }

  addConsultation(consultationData) {
    const newId = `con-${500 + this.state.consultations.length + 1}`;
    const newConsultation = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      ...consultationData
    };
    this.state.consultations.unshift(newConsultation);

    // Also update associated appointment status to Completed
    if (consultationData.appointmentId) {
      this.updateAppointmentStatus(consultationData.appointmentId, 'Completed');
    }

    this.saveState();
    return newConsultation;
  }

  // --- PRESCRIPTIONS & CLINIC-TO-CHEMIST WORKFLOW SERVICE ---
  getPrescriptions() {
    return this.state.prescriptions || [];
  }

  createPrescription(rxData) {
    const newId = `rx-${800 + this.state.prescriptions.length + 1}`;
    const newRx = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Dispense',
      ...rxData
    };
    this.state.prescriptions.unshift(newRx);
    this.saveState();
    return newRx;
  }

  // CONNECTED WORKFLOW: Dispense Prescription -> Update Inventory Stock -> Record Sale
  dispensePrescription(prescriptionId, paymentMethod = 'Cash') {
    const rx = this.state.prescriptions.find(p => p.id === prescriptionId);
    if (!rx) return { success: false, message: 'Prescription not found' };
    if (rx.status === 'Dispensed') return { success: false, message: 'Prescription already dispensed' };

    // 1. Check stock for all items
    for (const item of rx.items) {
      const med = this.state.medicines.find(m => m.id === item.medicineId || m.name === item.medicineName);
      if (med && med.stock < item.quantity) {
        return { 
          success: false, 
          message: `Insufficient stock for ${item.medicineName}. Available: ${med.stock}, Required: ${item.quantity}` 
        };
      }
    }

    // 2. Deduct stock quantity in Inventory
    let subtotal = 0;
    const saleItems = [];

    rx.items.forEach(item => {
      const med = this.state.medicines.find(m => m.id === item.medicineId || m.name === item.medicineName);
      if (med) {
        med.stock -= item.quantity;
      }
      const itemTotal = (item.quantity || 1) * (item.unitPrice || 1.0);
      subtotal += itemTotal;
      saleItems.push({
        medicineName: item.medicineName,
        qty: item.quantity,
        price: item.unitPrice,
        total: itemTotal
      });
    });

    // 3. Update prescription status
    rx.status = 'Dispensed';

    // 4. Create POS sale record
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;
    const saleId = `sal-${900 + this.state.sales.length + 1}`;
    const receiptNo = `REC-2026-${0 + (this.state.sales.length + 901)}`;

    const newSale = {
      id: saleId,
      receiptNo: receiptNo,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientName: rx.patientName,
      prescriptionId: rx.id,
      items: saleItems,
      subtotal: subtotal,
      discount: 0.00,
      tax: tax,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid',
      processedBy: this.state.currentUser.name
    };

    this.state.sales.unshift(newSale);
    this.saveState();

    return { 
      success: true, 
      message: `Prescription ${rx.id} dispensed successfully! Stock updated and sale recorded.`,
      sale: newSale
    };
  }

  // --- MEDICINES & INVENTORY SERVICE ---
  getMedicines() {
    return this.state.medicines || [];
  }

  addMedicine(medicineData) {
    const newId = `med-${10 + this.state.medicines.length + 1}`;
    const newMed = {
      id: newId,
      stock: parseInt(medicineData.stock) || 0,
      minReorderLevel: parseInt(medicineData.minReorderLevel) || 20,
      unitPrice: parseFloat(medicineData.unitPrice) || 1.00,
      costPrice: parseFloat(medicineData.costPrice) || 0.50,
      batchNo: `BT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90 + 10)}`,
      ...medicineData
    };
    this.state.medicines.unshift(newMed);
    this.saveState();
    return newMed;
  }

  updateStock(medicineId, additionalQuantity) {
    const med = this.state.medicines.find(m => m.id === medicineId);
    if (med) {
      med.stock += parseInt(additionalQuantity);
      this.saveState();
    }
  }

  // --- SUPPLIERS SERVICE ---
  getSuppliers() {
    return this.state.suppliers || [];
  }

  // --- POS / SALES SERVICE ---
  getSales() {
    return this.state.sales || [];
  }

  addDirectSale(saleData) {
    const saleId = `sal-${900 + this.state.sales.length + 1}`;
    const receiptNo = `REC-2026-${(this.state.sales.length + 901)}`;
    const newSale = {
      id: saleId,
      receiptNo: receiptNo,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentStatus: 'Paid',
      processedBy: this.state.currentUser.name,
      ...saleData
    };

    // Deduct stock
    newSale.items.forEach(item => {
      const med = this.state.medicines.find(m => m.name === item.medicineName || m.id === item.medicineId);
      if (med) {
        med.stock -= item.qty;
      }
    });

    this.state.sales.unshift(newSale);
    this.saveState();
    return newSale;
  }
}

export const store = new DataStore();
