/**
 * Curis Health - Seed Mock Data
 * Structured as clean JSON/Objects to easily mirror future database tables in Supabase
 */

export const INITIAL_DATA = {
  // Current active user & session simulation
  currentUser: {
    id: "usr-001",
    name: "Dr. Dominic Szoboszlai",
    email: "dominicszobo@curishealth.co.ke",
    role: "admin", // 'patient', 'doctor', 'admin'
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    title: "Chief Medical Officer & Administrator"
  },

  // Patients Table
  patients: [
    {
      id: "pat-101",
      name: "Arthur Pendelton",
      age: 45,
      gender: "Male",
      phone: "+254 722 123 456",
      email: "arthur.p@example.com",
      address: "Kilimani, Nairobi",
      bloodGroup: "O+",
      allergies: ["Penicillin", "Dust Mites"],
      medicalHistory: "Hypertension (diagnosed 2021), Mild Asthma",
      vitals: { bp: "128/84", pulse: 72, temp: "36.8°C", weight: "78 kg" },
      registeredDate: "2024-01-15",
      status: "Active"
    },
    {
      id: "pat-102",
      name: "Elena Rostova",
      age: 32,
      gender: "Female",
      phone: "+254 733 987 654",
      email: "elena.r@example.com",
      address: "Westlands, Nairobi",
      bloodGroup: "A-",
      allergies: ["Sulfa Drugs"],
      medicalHistory: "Type 2 Diabetes Mellitus",
      vitals: { bp: "118/76", pulse: 68, temp: "36.6°C", weight: "62 kg" },
      registeredDate: "2024-02-10",
      status: "Active"
    },
    {
      id: "pat-103",
      name: "Marcus Vance",
      age: 58,
      gender: "Male",
      phone: "+254 711 456 789",
      email: "marcus.vance@example.com",
      address: "Milimani, Nakuru",
      bloodGroup: "B+",
      allergies: ["None"],
      medicalHistory: "Osteoarthritis, High Cholesterol",
      vitals: { bp: "135/88", pulse: 76, temp: "37.0°C", weight: "85 kg" },
      registeredDate: "2024-03-01",
      status: "Active"
    },
    {
      id: "pat-104",
      name: "Sophia Chen",
      age: 27,
      gender: "Female",
      phone: "+254 700 321 654",
      email: "sophia.chen@example.com",
      address: "Nyali, Mombasa",
      bloodGroup: "AB+",
      allergies: ["Aspirin", "Peanuts"],
      medicalHistory: "Seasonal Allergies",
      vitals: { bp: "112/70", pulse: 65, temp: "36.5°C", weight: "54 kg" },
      registeredDate: "2024-04-12",
      status: "Active"
    }
  ],

  // Staff / Doctors Table
  staff: [
    {
      id: "doc-01",
      name: "Dr. Dominic Szoboszlai",
      role: "doctor",
      specialty: "General Medicine / Internal Practitioner",
      phone: "+254 720 111 222",
      email: "dominicszobo@curishealth.co.ke",
      status: "On Duty"
    },
    {
      id: "doc-02",
      name: "Dr. Robert Vance",
      role: "doctor",
      specialty: "Pediatrics & Family Health",
      phone: "+254 721 333 444",
      email: "robertvance@curishealth.co.ke",
      status: "On Duty"
    },
    {
      id: "pharm-01",
      name: "Chemist David Kim",
      role: "chemist",
      specialty: "Chief Chemist & Inventory Lead",
      phone: "+254 722 555 666",
      email: "d.kim@curishealth.co.ke",
      status: "On Duty"
    }
  ],

  // Appointments Table
  appointments: [
    {
      id: "apt-301",
      patientId: "pat-101",
      patientName: "Arthur Pendelton",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-16",
      time: "09:30 AM",
      type: "Routine Checkup",
      status: "Completed",
      notes: "Follow-up on hypertension management."
    },
    {
      id: "apt-302",
      patientId: "pat-102",
      patientName: "Elena Rostova",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-16",
      time: "11:00 AM",
      type: "Consultation",
      status: "In Consultation",
      notes: "Blood glucose review and dietary guidance."
    },
    {
      id: "apt-303",
      patientId: "pat-103",
      patientName: "Marcus Vance",
      doctorId: "doc-02",
      doctorName: "Dr. Robert Vance",
      date: "2026-09-16",
      time: "02:15 PM",
      type: "Follow-up",
      status: "Scheduled",
      notes: "Knee joint stiffness and pain evaluation."
    },
    {
      id: "apt-304",
      patientId: "pat-104",
      patientName: "Sophia Chen",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-17",
      time: "10:00 AM",
      type: "General Checkup",
      status: "Scheduled",
      notes: "Annual physical wellness exam."
    }
  ],

  // Consultations Table
  consultations: [
    {
      id: "con-501",
      appointmentId: "apt-301",
      patientId: "pat-101",
      patientName: "Arthur Pendelton",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-16",
      symptoms: "Mild headache, fatigue",
      diagnosis: "Essential Hypertension - Mild Spike",
      notes: "Doctor recorded consultation findings. Patient advised sodium reduction and continued daily exercise.",
      prescriptionId: "rx-801"
    }
  ],

  // Prescriptions Table (Bridge between Clinic & Chemist)
  prescriptions: [
    {
      id: "rx-801",
      consultationId: "con-501",
      patientId: "pat-101",
      patientName: "Arthur Pendelton",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-16",
      status: "Pending Dispense", // 'Pending Dispense', 'Dispensed', 'Cancelled'
      items: [
        {
          medicineId: "med-01",
          medicineName: "Amoxicillin 500mg",
          dosage: "1 capsule",
          frequency: "Three times daily (TID)",
          duration: "7 days",
          quantity: 21,
          unitPrice: 120.00,
          instructions: "Take after meals with water."
        },
        {
          medicineId: "med-03",
          medicineName: "Lisinopril 10mg",
          dosage: "1 tablet",
          frequency: "Once daily (QD)",
          duration: "30 days",
          quantity: 30,
          unitPrice: 60.00,
          instructions: "Take in the morning."
        }
      ]
    },
    {
      id: "rx-802",
      consultationId: "con-500",
      patientId: "pat-102",
      patientName: "Elena Rostova",
      doctorId: "doc-01",
      doctorName: "Dr. Sarah Jenkins",
      date: "2026-09-15",
      status: "Dispensed",
      items: [
        {
          medicineId: "med-02",
          medicineName: "Metformin 850mg",
          dosage: "1 tablet",
          frequency: "Twice daily (BID)",
          duration: "30 days",
          quantity: 60,
          unitPrice: 45.00,
          instructions: "Take during meals."
        }
      ]
    }
  ],

  // Medicines / Chemist Inventory Table
  medicines: [
    {
      id: "med-01",
      name: "Amoxicillin 500mg",
      category: "Antibiotics",
      sku: "MED-AMX-500",
      stock: 140,
      minReorderLevel: 50,
      unitPrice: 120.00,
      costPrice: 70.00,
      batchNo: "BT-2024-88A",
      expiryDate: "2027-06-30",
      supplier: "Harleys Pharma Distributors",
      description: "Broad-spectrum penicillin antibiotic."
    },
    {
      id: "med-02",
      name: "Metformin 850mg",
      category: "Antidiabetic",
      sku: "MED-MTF-850",
      stock: 220,
      minReorderLevel: 80,
      unitPrice: 45.00,
      costPrice: 25.00,
      batchNo: "BT-2024-91B",
      expiryDate: "2027-11-15",
      supplier: "Crown Healthcare Kenya",
      description: "First-line medication for type 2 diabetes."
    },
    {
      id: "med-03",
      name: "Lisinopril 10mg",
      category: "Cardiovascular",
      sku: "MED-LSP-010",
      stock: 18, // Low Stock Alert!
      minReorderLevel: 40,
      unitPrice: 60.00,
      costPrice: 35.00,
      batchNo: "BT-2024-44C",
      expiryDate: "2026-12-01",
      supplier: "Harleys Pharma Distributors",
      description: "ACE inhibitor used to treat high blood pressure."
    },
    {
      id: "med-04",
      name: "Ibuprofen 400mg",
      category: "Analgesics & NSAIDs",
      sku: "MED-IBU-400",
      stock: 450,
      minReorderLevel: 100,
      unitPrice: 30.00,
      costPrice: 15.00,
      batchNo: "BT-2025-05D",
      expiryDate: "2028-02-28",
      supplier: "Laborex Kenya Ltd",
      description: "Nonsteroidal anti-inflammatory medication."
    },
    {
      id: "med-05",
      name: "Salbutamol Inhaler 100mcg",
      category: "Respiratory",
      sku: "MED-SLB-100",
      stock: 8, // Low Stock Alert!
      minReorderLevel: 15,
      unitPrice: 850.00,
      costPrice: 550.00,
      batchNo: "BT-2024-19E",
      expiryDate: "2026-10-31",
      supplier: "Crown Healthcare Kenya",
      description: "Short-acting beta-2 adrenergic agonist for asthma relief."
    },
    {
      id: "med-06",
      name: "Atorvastatin 20mg",
      category: "Cardiovascular",
      sku: "MED-ATV-020",
      stock: 190,
      minReorderLevel: 60,
      unitPrice: 150.00,
      costPrice: 90.00,
      batchNo: "BT-2025-12F",
      expiryDate: "2027-08-15",
      supplier: "Harleys Pharma Distributors",
      description: "Statin medication used to prevent cardiovascular disease."
    }
  ],

  // Suppliers Table
  suppliers: [
    {
      id: "sup-01",
      name: "Harleys Pharma Distributors",
      contactPerson: "James Ochieng",
      phone: "+254 722 000 111",
      email: "orders@harleys.co.ke",
      leadTimeDays: 2,
      rating: "4.9/5"
    },
    {
      id: "sup-02",
      name: "Crown Healthcare Kenya",
      contactPerson: "Grace Wanjiku",
      phone: "+254 733 222 333",
      email: "supply@crownhealth.co.ke",
      leadTimeDays: 2,
      rating: "4.8/5"
    },
    {
      id: "sup-03",
      name: "Laborex Kenya Ltd",
      contactPerson: "Peter Kiprop",
      phone: "+254 711 444 555",
      email: "sales@laborex.co.ke",
      leadTimeDays: 3,
      rating: "4.7/5"
    }
  ],

  // Sales / POS Transactions Table
  sales: [
    {
      id: "sal-901",
      receiptNo: "REC-2026-00901",
      date: "2026-09-15",
      time: "02:45 PM",
      patientName: "Elena Rostova",
      prescriptionId: "rx-802",
      items: [
        { medicineName: "Metformin 850mg", qty: 60, price: 45.00, total: 2700.00 }
      ],
      subtotal: 2700.00,
      discount: 0.00,
      tax: 216.00,
      totalAmount: 2916.00,
      paymentMethod: "Mobile Money (MPesa)",
      paymentStatus: "Paid",
      processedBy: "Chemist David Kim"
    }
  ]
};
