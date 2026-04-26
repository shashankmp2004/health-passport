#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const rootDir = path.resolve(__dirname, "..");
loadEnvFile(path.join(rootDir, ".env.local"));
loadEnvFile(path.join(rootDir, ".env"));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Add it to .env.local or pass it in your shell.",
  );
}

const RESET = process.argv.includes("--reset");

function createHospitalId(index) {
  const suffixes = ["ALP001", "BET002", "GAM003", "DEL004"];
  return `HOS-2026-${suffixes[index]}`;
}

function createDoctorId(index) {
  return `DOC-${String(index + 1).padStart(8, "0")}`;
}

function createDoctorLicense(index) {
  return `ML-${String(index + 1).padStart(7, "0")}`;
}

function createHealthPassportId(index) {
  const left = String(index + 1).padStart(5, "0");
  const right = String(90000 + index).padStart(5, "0");
  return `HP-${left}-${right}`;
}

function randomFrom(items, index) {
  return items[index % items.length];
}

function createHospitals(passwordHash) {
  const facilities = [
    {
      name: "City General Hospital",
      type: "hospital",
      address: "101 Central Avenue, Springfield",
      phone: "+1-555-1001",
      email: "admin.citygeneral@healthpassport.local",
      licenseNumber: "LIC-HOSP-00101",
      adminFirstName: "Ariana",
      adminLastName: "Cole",
      adminEmail: "ariana.cole@citygeneral.local",
    },
    {
      name: "Metro Multispecialty Clinic",
      type: "clinic",
      address: "22 River Road, Greenville",
      phone: "+1-555-1002",
      email: "admin.metroclinic@healthpassport.local",
      licenseNumber: "LIC-CLIN-00202",
      adminFirstName: "Rahul",
      adminLastName: "Sethi",
      adminEmail: "rahul.sethi@metroclinic.local",
    },
    {
      name: "Northside Care Center",
      type: "specialty",
      address: "78 Elm Street, Lakeside",
      phone: "+1-555-1003",
      email: "admin.northside@healthpassport.local",
      licenseNumber: "LIC-SPEC-00303",
      adminFirstName: "Maya",
      adminLastName: "Shah",
      adminEmail: "maya.shah@northside.local",
    },
  ];

  return facilities.map((facility, index) => ({
    hospitalId: createHospitalId(index),
    facilityInfo: {
      name: facility.name,
      type: facility.type,
      address: facility.address,
      phone: facility.phone,
      email: facility.email,
      licenseNumber: facility.licenseNumber,
    },
    adminInfo: {
      firstName: facility.adminFirstName,
      lastName: facility.adminLastName,
      email: facility.adminEmail,
    },
    staff: [],
    verified: true,
    password: passwordHash,
    role: "hospital",
  }));
}

function createDoctors(passwordHash, hospitals) {
  const firstNames = ["Ethan", "Sophia", "Liam", "Olivia", "Noah", "Ava", "Arjun", "Nina", "Kabir"];
  const lastNames = ["Parker", "Mehta", "Iyer", "Fernandez", "Patel", "Reed", "Gupta", "Kim", "Rao"];
  const specialties = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Pulmonology",
    "General Medicine",
    "Oncology",
  ];

  return Array.from({ length: 9 }).map((_, index) => {
    const hospital = hospitals[index % hospitals.length];
    const firstName = randomFrom(firstNames, index);
    const lastName = randomFrom(lastNames, index + 2);
    const specialty = randomFrom(specialties, index);

    return {
      doctorId: createDoctorId(index),
      personalInfo: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@healthpassport.local`,
        phone: `+1-555-20${String(index + 1).padStart(2, "0")}`,
        licenseNumber: createDoctorLicense(index),
        specialty,
        hospitalAffiliation: hospital.facilityInfo.name,
      },
      credentials: {
        verified: true,
        verificationDate: new Date("2026-01-10T10:00:00.000Z"),
        verifiedBy: "System Admin",
        licenseExpiry: new Date("2031-12-31T00:00:00.000Z"),
      },
      password: passwordHash,
      role: "doctor",
    };
  });
}

function createPatients(passwordHash, hospitals, doctors) {
  const firstNames = [
    "Aarav",
    "Isha",
    "Vihaan",
    "Anaya",
    "Rohan",
    "Diya",
    "Karan",
    "Mira",
    "Aditya",
    "Sara",
    "Neel",
    "Tara",
    "Zara",
    "Dev",
    "Reyansh",
    "Kiara",
    "Samar",
    "Aditi",
    "Ritika",
    "Ishan",
  ];
  const lastNames = [
    "Sharma",
    "Verma",
    "Nair",
    "Khan",
    "Singh",
    "Das",
    "Mukherjee",
    "Bose",
    "Menon",
    "Kapoor",
    "Joshi",
    "Agarwal",
  ];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const conditions = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "Migraine",
    "Arthritis",
    "Thyroid Disorder",
    "Seasonal Allergy",
    "Hyperlipidemia",
  ];
  const allergies = ["Peanuts", "Penicillin", "Dust", "Pollen", "Shellfish", "Latex"];
  const medications = ["Metformin", "Atorvastatin", "Losartan", "Levothyroxine", "Montelukast"];
  const procedures = ["ECG", "MRI Scan", "X-Ray", "CT Scan", "Ultrasound"];

  return Array.from({ length: 24 }).map((_, index) => {
    const hospital = hospitals[index % hospitals.length];
    const doctor = doctors[index % doctors.length];
    const firstName = randomFrom(firstNames, index);
    const lastName = randomFrom(lastNames, index + 3);
    const dob = new Date(1975 + (index % 25), (index * 2) % 12, ((index * 3) % 27) + 1);
    const condition = randomFrom(conditions, index);
    const allergy = randomFrom(allergies, index + 1);
    const med = randomFrom(medications, index + 2);
    const procedure = randomFrom(procedures, index + 1);
    const now = new Date();

    const visitDate = new Date(now);
    visitDate.setDate(visitDate.getDate() - (index % 60));

    const medStart = new Date(now);
    medStart.setDate(medStart.getDate() - (15 + (index % 40)));

    const labDate = new Date(now);
    labDate.setDate(labDate.getDate() - (index % 20));

    const uploadDate = new Date(now);
    uploadDate.setDate(uploadDate.getDate() - (index % 10));

    return {
      healthPassportId: createHealthPassportId(index),
      personalInfo: {
        firstName,
        lastName,
        dateOfBirth: dob,
        gender: index % 2 === 0 ? "male" : "female",
        bloodType: randomFrom(bloodTypes, index),
        aadharNumber: `AADHAR-${String(100000000000 + index)}`,
        phone: `+1-555-30${String(index + 1).padStart(2, "0")}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@patients.local`,
        address: `${100 + index} Health Street, District ${index % 5}`,
        emergencyContact: {
          name: `${lastName} Family Contact`,
          phone: `+1-555-90${String(index + 1).padStart(2, "0")}`,
          relationship: "Family",
        },
      },
      medicalHistory: {
        conditions: [
          {
            name: condition,
            diagnosedDate: new Date(visitDate.getTime() - 120 * 24 * 60 * 60 * 1000),
            severity: index % 3 === 0 ? "Severe" : "Moderate",
            status: "Active",
            notes: `${condition} under periodic monitoring`,
          },
        ],
        allergies: [
          {
            name: allergy,
            severity: index % 2 === 0 ? "Moderate" : "Mild",
            reaction: "Skin rash",
            discoveredDate: new Date(visitDate.getTime() - 365 * 24 * 60 * 60 * 1000),
          },
        ],
        medications: [
          {
            name: med,
            dosage: "500 mg",
            frequency: "Twice daily",
            prescribedBy: doctor.doctorId,
            startDate: medStart,
            endDate: null,
            status: "Active",
          },
        ],
        immunizations: [
          {
            name: "Influenza Vaccine",
            dateAdministered: new Date("2025-11-01T00:00:00.000Z"),
            manufacturer: "HealthVax",
            lotNumber: `LOT-${index + 101}`,
            administeredBy: doctor.doctorId,
            status: "Complete",
          },
        ],
        procedures: [
          {
            name: procedure,
            date: new Date(visitDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            surgeon: `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
            hospital: hospital.facilityInfo.name,
            description: `${procedure} performed for routine assessment`,
            outcome: "Stable",
            status: "Completed",
          },
        ],
        labResults: [
          {
            testName: "Complete Blood Count",
            date: labDate,
            orderedBy: doctor.doctorId,
            results: "Within normal range",
            referenceRange: "4.5-11.0 x10^9/L",
            status: "Normal",
            notes: "No abnormalities",
            attachments: [
              {
                id: `lab-att-${index + 1}`,
                name: `cbc-report-${index + 1}.pdf`,
                url: `https://files.healthpassport.local/labs/cbc-${index + 1}.pdf`,
                public_id: `labs/cbc-${index + 1}`,
                type: "application/pdf",
                size: 254000,
              },
            ],
          },
        ],
        vitalSigns: [
          {
            date: visitDate,
            bloodPressure: "120/80",
            heartRate: "74",
            temperature: "98.6",
            weight: `${58 + (index % 20)} kg`,
            height: `${155 + (index % 20)} cm`,
            recordedBy: doctor.doctorId,
          },
        ],
      },
      medications: [
        {
          name: med,
          dosage: "500 mg",
          frequency: "Twice daily",
          prescribedBy: doctor.doctorId,
          startDate: medStart,
          endDate: null,
          status: "active",
        },
      ],
      vitals: [
        {
          type: "blood_pressure",
          value: "120/80",
          unit: "mmHg",
          recordedDate: visitDate,
          recordedBy: doctor.doctorId,
        },
        {
          type: "heart_rate",
          value: "74",
          unit: "bpm",
          recordedDate: visitDate,
          recordedBy: doctor.doctorId,
        },
      ],
      visits: [
        {
          hospitalId: hospital.hospitalId,
          doctorId: doctor.doctorId,
          date: visitDate,
          diagnosis: condition,
          treatment: `Treatment plan for ${condition}`,
          notes: "Follow-up advised in 4 weeks",
          visitType: index % 4 === 0 ? "follow_up" : "routine",
        },
      ],
      documents: [
        {
          fileName: `lab-report-${index + 1}.pdf`,
          fileUrl: `https://files.healthpassport.local/patients/${index + 1}/lab-report.pdf`,
          type: "lab_report",
          uploadedDate: uploadDate,
          uploadedBy: doctor.doctorId,
          description: "Routine lab report upload",
        },
      ],
      qrCode: `https://qr.healthpassport.local/${createHealthPassportId(index)}`,
      password: passwordHash,
    };
  });
}

async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Failed to access MongoDB database handle.");
  }

  const hospitalsCollection = db.collection("hospitals");
  const doctorsCollection = db.collection("doctors");
  const patientsCollection = db.collection("patients");

  if (RESET) {
    await Promise.all([
      hospitalsCollection.deleteMany({}),
      doctorsCollection.deleteMany({}),
      patientsCollection.deleteMany({}),
    ]);
    console.log("Existing hospitals, doctors, and patients removed.");
  }

  const passwordHash = await bcrypt.hash("Password@123", 10);

  const hospitals = createHospitals(passwordHash);
  const doctors = createDoctors(passwordHash, hospitals);
  const patients = createPatients(passwordHash, hospitals, doctors);

  const doctorsByHospital = new Map();
  for (const doctor of doctors) {
    const key = doctor.personalInfo.hospitalAffiliation;
    if (!doctorsByHospital.has(key)) doctorsByHospital.set(key, []);
    doctorsByHospital.get(key).push(doctor.doctorId);
  }

  for (const hospital of hospitals) {
    const ids = doctorsByHospital.get(hospital.facilityInfo.name) || [];
    hospital.staff = ids.map((doctorId, idx) => ({
      doctorId,
      role: idx % 2 === 0 ? "doctor" : "technician",
      permissions: ["view_patients", "add_records", "scan_qr"],
      addedDate: new Date("2026-02-01T09:00:00.000Z"),
    }));
  }

  await hospitalsCollection.bulkWrite(
    hospitals.map((hospital) => ({
      updateOne: {
        filter: { hospitalId: hospital.hospitalId },
        update: { $set: hospital },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  await doctorsCollection.bulkWrite(
    doctors.map((doctor) => ({
      updateOne: {
        filter: { doctorId: doctor.doctorId },
        update: { $set: doctor },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  await patientsCollection.bulkWrite(
    patients.map((patient) => ({
      updateOne: {
        filter: { healthPassportId: patient.healthPassportId },
        update: { $set: patient },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  console.log("Mock data seeding complete.");
  console.log(`Hospitals upserted: ${hospitals.length}`);
  console.log(`Doctors upserted: ${doctors.length}`);
  console.log(`Patients upserted: ${patients.length}`);
  console.log("Default password for all seeded users: Password@123");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
