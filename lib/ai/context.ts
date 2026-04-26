import type { Session } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/mongodb";
import Patient from "@/lib/models/Patient";
import Doctor from "@/lib/models/Doctor";
import Hospital from "@/lib/models/Hospital";
import HospitalPatientRecord from "@/lib/models/HospitalPatientRecord";
import PatientNotification from "@/lib/models/PatientNotification";

type RoleType = "patient" | "doctor" | "hospital" | "admin";

type ScopeInfo = {
  role: RoleType;
  roleLabel: string;
  scopeType: string;
  scopeDescription: string;
  user: Record<string, unknown>;
};

type ContextPayload = {
  scope: ScopeInfo;
  dataset: Record<string, unknown>;
};

function toIsoDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function calculateAge(dateOfBirth: unknown) {
  if (!dateOfBirth) return null;
  const dob = new Date(String(dateOfBirth));
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function sortByDateDesc<T extends Record<string, unknown>>(items: T[], key: string) {
  return [...items].sort((a, b) => {
    const aTime = new Date(String(a[key] || 0)).getTime();
    const bTime = new Date(String(b[key] || 0)).getTime();
    return bTime - aTime;
  });
}

function normalizePatient(patient: any) {
  const personalInfo = patient?.personalInfo || {};
  const medicalHistory = patient?.medicalHistory || {};

  const visits = safeArray<any>(patient?.visits).map((visit) => ({
    id: String(visit?._id || ""),
    hospitalId: visit?.hospitalId || null,
    doctorId: visit?.doctorId || null,
    date: toIsoDate(visit?.date),
    diagnosis: visit?.diagnosis || null,
    treatment: visit?.treatment || null,
    notes: visit?.notes || null,
    visitType: visit?.visitType || null,
  }));

  const medications = safeArray<any>(patient?.medications).map((medication) => ({
    id: String(medication?._id || ""),
    name: medication?.name || null,
    dosage: medication?.dosage || null,
    frequency: medication?.frequency || null,
    prescribedBy: medication?.prescribedBy || null,
    startDate: toIsoDate(medication?.startDate),
    endDate: toIsoDate(medication?.endDate),
    status: medication?.status || null,
    active:
      !medication?.endDate ||
      new Date(String(medication.endDate)).getTime() > Date.now(),
  }));

  const vitals = safeArray<any>(patient?.vitals).map((vital) => ({
    id: String(vital?._id || ""),
    type: vital?.type || null,
    value: vital?.value || null,
    unit: vital?.unit || null,
    recordedDate: toIsoDate(vital?.recordedDate),
    recordedBy: vital?.recordedBy || null,
  }));

  const documents = safeArray<any>(patient?.documents).map((document) => ({
    id: String(document?._id || ""),
    fileName: document?.fileName || null,
    fileUrl: document?.fileUrl || null,
    type: document?.type || null,
    uploadedDate: toIsoDate(document?.uploadedDate),
    uploadedBy: document?.uploadedBy || null,
    description: document?.description || null,
  }));

  const conditions = safeArray<any>(medicalHistory?.conditions).map((condition) => ({
    id: String(condition?._id || ""),
    name: condition?.name || null,
    diagnosedDate: toIsoDate(condition?.diagnosedDate),
    severity: condition?.severity || null,
    status: condition?.status || null,
    notes: condition?.notes || null,
  }));

  const allergies = safeArray<any>(medicalHistory?.allergies).map((allergy) => ({
    id: String(allergy?._id || ""),
    name: allergy?.name || null,
    severity: allergy?.severity || null,
    reaction: allergy?.reaction || null,
    discoveredDate: toIsoDate(allergy?.discoveredDate),
  }));

  const historyMedications = safeArray<any>(medicalHistory?.medications).map(
    (medication) => ({
      id: String(medication?._id || ""),
      name: medication?.name || null,
      dosage: medication?.dosage || null,
      frequency: medication?.frequency || null,
      prescribedBy: medication?.prescribedBy || null,
      startDate: toIsoDate(medication?.startDate),
      endDate: toIsoDate(medication?.endDate),
      status: medication?.status || null,
    }),
  );

  const immunizations = safeArray<any>(medicalHistory?.immunizations).map(
    (immunization) => ({
      id: String(immunization?._id || ""),
      name: immunization?.name || null,
      dateAdministered: toIsoDate(immunization?.dateAdministered),
      manufacturer: immunization?.manufacturer || null,
      lotNumber: immunization?.lotNumber || null,
      administeredBy: immunization?.administeredBy || null,
      status: immunization?.status || null,
    }),
  );

  const procedures = safeArray<any>(medicalHistory?.procedures).map((procedure) => ({
    id: String(procedure?._id || ""),
    name: procedure?.name || null,
    date: toIsoDate(procedure?.date),
    surgeon: procedure?.surgeon || null,
    hospital: procedure?.hospital || null,
    description: procedure?.description || null,
    outcome: procedure?.outcome || null,
    status: procedure?.status || null,
  }));

  const labResults = safeArray<any>(medicalHistory?.labResults).map((labResult) => ({
    id: String(labResult?._id || ""),
    testName: labResult?.testName || null,
    date: toIsoDate(labResult?.date),
    orderedBy: labResult?.orderedBy || null,
    results: labResult?.results || null,
    referenceRange: labResult?.referenceRange || null,
    status: labResult?.status || null,
    notes: labResult?.notes || null,
    attachments: safeArray<any>(labResult?.attachments).map((attachment) => ({
      id: attachment?.id || null,
      name: attachment?.name || null,
      url: attachment?.url || null,
      type: attachment?.type || null,
      size: attachment?.size || null,
      publicId: attachment?.public_id || null,
    })),
  }));

  const vitalHistory = safeArray<any>(medicalHistory?.vitalSigns).map((vitalSign) => ({
    id: String(vitalSign?._id || ""),
    date: toIsoDate(vitalSign?.date),
    bloodPressure: vitalSign?.bloodPressure || null,
    heartRate: vitalSign?.heartRate || null,
    temperature: vitalSign?.temperature || null,
    weight: vitalSign?.weight || null,
    height: vitalSign?.height || null,
    recordedBy: vitalSign?.recordedBy || null,
  }));

  const visitsSorted = sortByDateDesc(visits, "date");
  const labsSorted = sortByDateDesc(labResults, "date");
  const docsSorted = sortByDateDesc(documents, "uploadedDate");

  return {
    id: String(patient?._id || ""),
    healthPassportId: patient?.healthPassportId || null,
    profile: {
      firstName: personalInfo?.firstName || null,
      lastName: personalInfo?.lastName || null,
      fullName:
        [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") ||
        null,
      dateOfBirth: toIsoDate(personalInfo?.dateOfBirth),
      age: calculateAge(personalInfo?.dateOfBirth),
      gender: personalInfo?.gender || null,
      bloodType: personalInfo?.bloodType || null,
      phone: personalInfo?.phone || null,
      email: personalInfo?.email || null,
      address: personalInfo?.address || null,
      emergencyContact: {
        name: personalInfo?.emergencyContact?.name || null,
        phone: personalInfo?.emergencyContact?.phone || null,
        relationship: personalInfo?.emergencyContact?.relationship || null,
      },
    },
    visits,
    medications,
    vitals,
    documents,
    medicalHistory: {
      conditions,
      allergies,
      medications: historyMedications,
      immunizations,
      procedures,
      labResults,
      vitalSigns: vitalHistory,
    },
    summary: {
      totalVisits: visits.length,
      totalMedications: medications.length,
      totalVitals: vitals.length,
      totalDocuments: documents.length,
      conditionCount: conditions.length,
      allergyCount: allergies.length,
      immunizationCount: immunizations.length,
      procedureCount: procedures.length,
      labResultCount: labResults.length,
      lastVisit: visitsSorted[0] || null,
      lastLabResult: labsSorted[0] || null,
      lastDocument: docsSorted[0] || null,
      activeMedications: medications.filter((item) => item.active),
    },
  };
}

async function buildPatientPayload(session: Session): Promise<ContextPayload> {
  await dbConnect();

  const patient = (await Patient.findById(session.user.id).lean()) as any;
  if (!patient || Array.isArray(patient)) {
    return {
      scope: {
        role: "patient",
        roleLabel: "Patient",
        scopeType: "self_only",
        scopeDescription: "Only the logged-in patient record is accessible.",
        user: {
          userId: session.user.id,
          name: session.user.name || null,
        },
      },
      dataset: {
        error: "Patient record not found",
      },
    };
  }

  const normalizedPatient = normalizePatient(patient);

  return {
    scope: {
      role: "patient",
      roleLabel: "Patient",
      scopeType: "self_only",
      scopeDescription: "Only the logged-in patient record is accessible.",
      user: {
        userId: session.user.id,
        name: session.user.name || null,
        healthPassportId: normalizedPatient.healthPassportId,
      },
    },
    dataset: {
      patient: normalizedPatient,
    },
  };
}

async function buildAdminPayload(session: Session): Promise<ContextPayload> {
  await dbConnect();

  const [patientsRaw, doctorsRaw, hospitalsRaw, hospitalRecordsRaw, notificationsRaw] =
    await Promise.all([
      Patient.find({}).lean(),
      Doctor.find({}).lean(),
      Hospital.find({}).lean(),
      HospitalPatientRecord.find({}).lean(),
      PatientNotification.find({}).lean(),
    ]);

  const patients = (patientsRaw as any[]).map(normalizePatient);
  const doctors = (doctorsRaw as any[]).map((doctor) => ({
    id: String(doctor?._id || ""),
    doctorId: doctor?.doctorId || null,
    firstName: doctor?.personalInfo?.firstName || null,
    lastName: doctor?.personalInfo?.lastName || null,
    fullName:
      [doctor?.personalInfo?.firstName, doctor?.personalInfo?.lastName]
        .filter(Boolean)
        .join(" ") || null,
    email: doctor?.personalInfo?.email || null,
    phone: doctor?.personalInfo?.phone || null,
    specialty: doctor?.personalInfo?.specialty || null,
    licenseNumber: doctor?.personalInfo?.licenseNumber || null,
    hospitalAffiliation: doctor?.personalInfo?.hospitalAffiliation || null,
    credentials: {
      verified: !!doctor?.credentials?.verified,
      verificationDate: toIsoDate(doctor?.credentials?.verificationDate),
      verifiedBy: doctor?.credentials?.verifiedBy || null,
      licenseExpiry: toIsoDate(doctor?.credentials?.licenseExpiry),
    },
    createdAt: toIsoDate(doctor?.createdAt),
    updatedAt: toIsoDate(doctor?.updatedAt),
  }));

  const hospitals = (hospitalsRaw as any[]).map((hospital) => ({
    id: String(hospital?._id || ""),
    hospitalId: hospital?.hospitalId || null,
    verified: !!hospital?.verified,
    facilityInfo: {
      name: hospital?.facilityInfo?.name || null,
      type: hospital?.facilityInfo?.type || null,
      address: hospital?.facilityInfo?.address || null,
      phone: hospital?.facilityInfo?.phone || null,
      email: hospital?.facilityInfo?.email || null,
      licenseNumber: hospital?.facilityInfo?.licenseNumber || null,
    },
    adminInfo: {
      firstName: hospital?.adminInfo?.firstName || null,
      lastName: hospital?.adminInfo?.lastName || null,
      email: hospital?.adminInfo?.email || null,
    },
    staff: safeArray<any>(hospital?.staff).map((staffMember) => ({
      doctorId: staffMember?.doctorId || null,
      role: staffMember?.role || null,
      permissions: safeArray<string>(staffMember?.permissions),
      addedDate: toIsoDate(staffMember?.addedDate),
    })),
    createdAt: toIsoDate(hospital?.createdAt),
    updatedAt: toIsoDate(hospital?.updatedAt),
  }));

  const hospitalRecords = (hospitalRecordsRaw as any[]).map((record) => ({
    id: String(record?._id || ""),
    hospitalId: record?.hospitalId || null,
    hospitalName: record?.hospitalName || null,
    healthPassportId: record?.healthPassportId || null,
    patientName: record?.patientName || null,
    patientAge: record?.patientAge || null,
    bloodType: record?.bloodType || null,
    emergencyContact: record?.emergencyContact || null,
    riskLevel: record?.riskLevel || null,
    conditions: safeArray<string>(record?.conditions),
    allergies: safeArray<string>(record?.allergies),
    status: record?.status || null,
    accessLevel: record?.accessLevel || null,
    lastVisitDate: toIsoDate(record?.lastVisitDate),
    totalVisits: record?.totalVisits ?? 0,
    addedDate: toIsoDate(record?.addedDate),
    lastUpdated: toIsoDate(record?.lastUpdated),
    metadata: record?.metadata || {},
  }));

  const notifications = (notificationsRaw as any[]).map((notification) => ({
    id: String(notification?._id || ""),
    patientId: notification?.patientId || null,
    hospitalId: String(notification?.hospitalId || ""),
    hospitalName: notification?.hospitalName || null,
    type: notification?.type || null,
    status: notification?.status || null,
    message: notification?.message || null,
    requestedBy: notification?.requestedBy || {},
    respondedAt: toIsoDate(notification?.respondedAt),
    expiresAt: toIsoDate(notification?.expiresAt),
    metadata: notification?.metadata || {},
    createdAt: toIsoDate(notification?.createdAt),
    updatedAt: toIsoDate(notification?.updatedAt),
  }));

  const adults = patients.filter((patient) => (patient.profile?.age || 0) >= 18).length;
  const minors = patients.filter((patient) => {
    const age = patient.profile?.age;
    return typeof age === "number" && age < 18;
  }).length;

  const patientsByBloodType = patients.reduce(
    (acc: Record<string, number>, patient) => {
      const bloodType = String(patient.profile?.bloodType || "Unknown");
      acc[bloodType] = (acc[bloodType] || 0) + 1;
      return acc;
    },
    {},
  );

  return {
    scope: {
      role: "admin",
      roleLabel: "System Admin",
      scopeType: "global",
      scopeDescription: "All records across patient, doctor, and hospital collections.",
      user: {
        userId: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
      },
    },
    dataset: {
      patients,
      doctors,
      hospitals,
      hospitalRecords,
      notifications,
      stats: {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalHospitals: hospitals.length,
        totalHospitalRecords: hospitalRecords.length,
        totalNotifications: notifications.length,
        adults,
        minors,
        patientsByBloodType,
      },
    },
  };
}

function hospitalIdCandidates(session: Session) {
  const candidates = new Set<string>();

  const candidateValues = [
    session.user.id,
    (session.user as any).hospitalId,
    (session as any).hospitalId,
  ];

  for (const value of candidateValues) {
    if (typeof value === "string" && value.trim()) {
      candidates.add(value.trim());
    }
  }

  return [...candidates];
}

async function buildHospitalPayload(session: Session): Promise<ContextPayload> {
  await dbConnect();

  const candidates = hospitalIdCandidates(session);
  const objectIdCandidates = candidates.filter((candidate) =>
    mongoose.isValidObjectId(candidate),
  );

  const hospitalQueryOr: Record<string, unknown>[] = [];
  if (objectIdCandidates.length > 0) {
    hospitalQueryOr.push({ _id: { $in: objectIdCandidates } });
  }
  if (candidates.length > 0) {
    hospitalQueryOr.push({ hospitalId: { $in: candidates } });
  }

  const hospital = (await Hospital.findOne(
    hospitalQueryOr.length > 0 ? { $or: hospitalQueryOr } : {},
  ).lean()) as any;

  const resolvedHospitalId = hospital?.hospitalId || candidates[0] || session.user.id;
  const hospitalMongoId = hospital?._id ? String(hospital._id) : null;

  const [patientsRaw, recordsRaw, notificationsRaw] = await Promise.all([
    Patient.find({
      visits: {
        $elemMatch: {
          hospitalId: resolvedHospitalId,
        },
      },
    }).lean(),
    HospitalPatientRecord.find({
      hospitalId: resolvedHospitalId,
    }).lean(),
    PatientNotification.find(
      hospitalMongoId
        ? { $or: [{ hospitalId: hospitalMongoId }, { hospitalName: hospital?.facilityInfo?.name }] }
        : { hospitalName: hospital?.facilityInfo?.name || "" },
    ).lean(),
  ]);

  const patients = (patientsRaw as any[]).map((patient) => {
    const normalized = normalizePatient(patient);
    const scopedVisits = normalized.visits.filter(
      (visit) => visit.hospitalId === resolvedHospitalId,
    );
    return {
      ...normalized,
      visitsInScope: scopedVisits,
      summary: {
        ...normalized.summary,
        visitsInScopeCount: scopedVisits.length,
      },
    };
  });

  const records = (recordsRaw as any[]).map((record) => ({
    id: String(record?._id || ""),
    healthPassportId: record?.healthPassportId || null,
    patientName: record?.patientName || null,
    patientAge: record?.patientAge || null,
    bloodType: record?.bloodType || null,
    emergencyContact: record?.emergencyContact || null,
    riskLevel: record?.riskLevel || null,
    status: record?.status || null,
    accessLevel: record?.accessLevel || null,
    conditions: safeArray<string>(record?.conditions),
    allergies: safeArray<string>(record?.allergies),
    totalVisits: record?.totalVisits ?? 0,
    lastVisitDate: toIsoDate(record?.lastVisitDate),
    addedDate: toIsoDate(record?.addedDate),
    lastUpdated: toIsoDate(record?.lastUpdated),
    metadata: record?.metadata || {},
  }));

  const notifications = (notificationsRaw as any[]).map((notification) => ({
    id: String(notification?._id || ""),
    patientId: notification?.patientId || null,
    hospitalName: notification?.hospitalName || null,
    type: notification?.type || null,
    status: notification?.status || null,
    message: notification?.message || null,
    requestedBy: notification?.requestedBy || {},
    metadata: notification?.metadata || {},
    createdAt: toIsoDate(notification?.createdAt),
    respondedAt: toIsoDate(notification?.respondedAt),
    expiresAt: toIsoDate(notification?.expiresAt),
  }));

  const highRiskCount = records.filter((record) => record.riskLevel === "High").length;
  const activeRecords = records.filter((record) => record.status === "active").length;
  const adults = patients.filter((patient) => (patient.profile?.age || 0) >= 18).length;

  return {
    scope: {
      role: "hospital",
      roleLabel: "Hospital",
      scopeType: "hospital_scoped",
      scopeDescription: "Records related to the logged-in hospital scope.",
      user: {
        userId: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        hospitalId: resolvedHospitalId,
        hospitalName: hospital?.facilityInfo?.name || session.user.name || null,
      },
    },
    dataset: {
      hospital: hospital
        ? {
            id: hospitalMongoId,
            hospitalId: hospital?.hospitalId || null,
            verified: !!hospital?.verified,
            facilityInfo: hospital?.facilityInfo || {},
            adminInfo: hospital?.adminInfo || {},
            staff: safeArray<any>(hospital?.staff),
          }
        : null,
      patients,
      hospitalRecords: records,
      notifications,
      stats: {
        totalPatients: patients.length,
        adults,
        totalHospitalRecords: records.length,
        activeHospitalRecords: activeRecords,
        highRiskHospitalRecords: highRiskCount,
        totalNotifications: notifications.length,
      },
    },
  };
}

async function buildDoctorPayload(session: Session): Promise<ContextPayload> {
  await dbConnect();

  const doctor = (await Doctor.findById(session.user.id).lean()) as any;
  if (!doctor || Array.isArray(doctor)) {
    return {
      scope: {
        role: "doctor",
        roleLabel: "Doctor",
        scopeType: "doctor_scoped",
        scopeDescription: "Only records where this doctor is associated in visits/medications.",
        user: {
          userId: session.user.id,
          name: session.user.name || null,
          email: session.user.email || null,
        },
      },
      dataset: {
        error: "Doctor record not found",
      },
    };
  }

  const doctorIdentifier = doctor.doctorId || session.user.id;

  const patientsRaw = (await Patient.find({
    $or: [{ "visits.doctorId": doctorIdentifier }, { "medications.prescribedBy": doctorIdentifier }],
  }).lean()) as any[];

  const patients = patientsRaw.map((patient) => {
    const normalized = normalizePatient(patient);
    const visitsByDoctor = normalized.visits.filter(
      (visit) => visit.doctorId === doctorIdentifier,
    );
    const medicationsByDoctor = normalized.medications.filter(
      (medication) => medication.prescribedBy === doctorIdentifier,
    );
    const labsByDoctor = normalized.medicalHistory.labResults.filter(
      (labResult) => labResult.orderedBy === doctorIdentifier,
    );
    return {
      ...normalized,
      doctorScoped: {
        visits: visitsByDoctor,
        medications: medicationsByDoctor,
        labResults: labsByDoctor,
        stats: {
          visitsCount: visitsByDoctor.length,
          medicationsCount: medicationsByDoctor.length,
          labResultsCount: labsByDoctor.length,
        },
      },
    };
  });

  const activePatients = patients.filter(
    (patient) => patient.summary.activeMedications.length > 0,
  ).length;

  return {
    scope: {
      role: "doctor",
      roleLabel: "Doctor",
      scopeType: "doctor_scoped",
      scopeDescription: "Only records where this doctor is associated in visits/medications.",
      user: {
        userId: session.user.id,
        doctorId: doctorIdentifier,
        name: [doctor?.personalInfo?.firstName, doctor?.personalInfo?.lastName]
          .filter(Boolean)
          .join(" "),
        email: doctor?.personalInfo?.email || null,
        specialty: doctor?.personalInfo?.specialty || null,
        hospitalAffiliation: doctor?.personalInfo?.hospitalAffiliation || null,
      },
    },
    dataset: {
      doctor: {
        id: String(doctor?._id || ""),
        doctorId: doctorIdentifier,
        personalInfo: doctor?.personalInfo || {},
        credentials: doctor?.credentials || {},
      },
      patients,
      stats: {
        totalPatients: patients.length,
        activePatients,
        totalVisitsByDoctor: patients.reduce(
          (sum, patient) => sum + patient.doctorScoped.stats.visitsCount,
          0,
        ),
        totalPrescriptionsByDoctor: patients.reduce(
          (sum, patient) => sum + patient.doctorScoped.stats.medicationsCount,
          0,
        ),
      },
    },
  };
}

export async function buildRoleAwareContext(session: Session): Promise<ContextPayload> {
  const role = session.user.role as RoleType;

  if (role === "patient") {
    return buildPatientPayload(session);
  }

  if (role === "admin") {
    return buildAdminPayload(session);
  }

  if (role === "doctor") {
    return buildDoctorPayload(session);
  }

  return buildHospitalPayload(session);
}
