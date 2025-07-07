// Shared mock data store for testing
// This allows both hospital and patient portals to access the same mock patient data

interface MockPatientData {
  _id: string;
  healthPassportId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    age: number;
    bloodType?: string;
  };
  medicalHistory: {
    conditions: any[];
    allergies: any[];
    medications: any[];
    immunizations: any[];
    procedures: any[];
    labResults: any[];
    vitalSigns: any[];
  };
  medications: any[];
  vitals: any[];
  visits: any[];
  documents: any[];
  createdAt: string;
  updatedAt: string;
}

// In-memory mock data store
let mockPatient: MockPatientData = {
  _id: 'mock_patient_1',
  healthPassportId: 'HP12345',
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    phone: '+1-555-123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-987-6543',
      relationship: 'Spouse'
    },
    age: 39,
    bloodType: 'O+'
  },
  medicalHistory: {
    conditions: [
      {
        name: 'Hypertension',
        diagnosedDate: '2020-03-15',
        severity: 'Moderate',
        status: 'Active',
        doctor: 'Dr. Smith',
        notes: 'Well controlled with medication'
      }
    ],
    allergies: [
      {
        name: 'Penicillin',
        severity: 'Severe',
        reaction: 'Anaphylaxis',
        dateIdentified: '2010-05-20'
      }
    ],
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescribedBy: 'Dr. Smith',
        startDate: '2020-03-15',
        status: 'Active'
      }
    ],
    immunizations: [
      {
        name: 'COVID-19 Vaccine',
        dateAdministered: '2021-04-15',
        manufacturer: 'Pfizer',
        lotNumber: 'ABC123',
        administeredBy: 'Dr. Johnson',
        status: 'Complete'
      }
    ],
    procedures: [],
    labResults: [],
    vitalSigns: []
  },
  medications: [
    {
      _id: 'med_1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2020-03-15',
      endDate: null,
      prescribedBy: 'Dr. Smith',
      status: 'Active'
    }
  ],
  vitals: [
    {
      _id: 'vital_1',
      type: 'blood_pressure',
      value: '120/80',
      unit: 'mmHg',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recordedBy: 'Dr. Smith'
    },
    {
      _id: 'vital_2',
      type: 'heart_rate',
      value: 72,
      unit: 'bpm',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      recordedBy: 'Dr. Smith'
    }
  ],
  visits: [
    {
      _id: 'visit_1',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      hospital: 'General Hospital',
      type: 'Routine Checkup',
      reason: 'Annual physical examination',
      diagnosis: 'Hypertension - well controlled',
      doctor: 'Dr. Smith'
    }
  ],
  documents: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export function getMockPatient(): MockPatientData {
  return { ...mockPatient };
}

export function updateMockPatient(updates: Partial<MockPatientData>): MockPatientData {
  console.log('Updating mock patient with:', updates);
  
  // Deep merge the updates
  if (updates.personalInfo) {
    mockPatient.personalInfo = { ...mockPatient.personalInfo, ...updates.personalInfo };
  }
  
  if (updates.medicalHistory) {
    mockPatient.medicalHistory = {
      conditions: updates.medicalHistory.conditions || mockPatient.medicalHistory.conditions,
      allergies: updates.medicalHistory.allergies || mockPatient.medicalHistory.allergies,
      medications: updates.medicalHistory.medications || mockPatient.medicalHistory.medications,
      immunizations: updates.medicalHistory.immunizations || mockPatient.medicalHistory.immunizations,
      procedures: updates.medicalHistory.procedures || mockPatient.medicalHistory.procedures,
      labResults: updates.medicalHistory.labResults || mockPatient.medicalHistory.labResults,
      vitalSigns: updates.medicalHistory.vitalSigns || mockPatient.medicalHistory.vitalSigns
    };
  }
  
  if (updates.medications) {
    mockPatient.medications = updates.medications;
  }
  
  if (updates.vitals) {
    mockPatient.vitals = updates.vitals;
  }
  
  if (updates.visits) {
    mockPatient.visits = updates.visits;
  }
  
  if (updates.documents) {
    mockPatient.documents = updates.documents;
  }
  
  mockPatient.updatedAt = new Date().toISOString();
  
  console.log('Mock patient updated successfully');
  return { ...mockPatient };
}

export function isMockPatient(healthPassportId: string): boolean {
  return process.env.NODE_ENV === 'development' && healthPassportId === 'HP12345';
}

export function isMockPatientById(id: string): boolean {
  return process.env.NODE_ENV === 'development' && id === 'mock_patient_1';
}
