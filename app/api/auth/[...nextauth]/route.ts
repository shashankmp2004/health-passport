import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Patient from "@/lib/models/Patient";
import Doctor from "@/lib/models/Doctor";
import Hospital from "@/lib/models/Hospital";
import { verifyPassword } from "@/lib/utils/helpers";

async function connectDbForAuth() {
  const { default: dbConnect } = await import("@/lib/db/mongodb");
  await dbConnect();
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        if (!adminEmail || (!adminPasswordHash && !adminPassword)) {
          return null;
        }

        if (credentials.email.trim() !== adminEmail) {
          return null;
        }

        const isValid = adminPasswordHash
          ? await verifyPassword(credentials.password, adminPasswordHash)
          : credentials.password === adminPassword;
        if (!isValid) {
          return null;
        }
        return {
          id: "admin",
          email: adminEmail,
          name: "System Admin",
          role: "admin",
          verified: true,
        };
      },
    }),

    CredentialsProvider({
      id: "patient",
      name: "Patient",
      credentials: {
        healthPassportId: { label: "Health Passport ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.healthPassportId || !credentials?.password) {
          return null;
        }

        try {
          if (
            process.env.NODE_ENV === "development" &&
            credentials.healthPassportId === "HP12345"
          ) {
            if (
              credentials.password === "test123" ||
              credentials.password === "password"
            ) {
              return {
                id: "mock_patient_1",
                email: "john.doe@email.com",
                name: "John Doe",
                role: "patient",
                healthPassportId: "HP12345",
              };
            }
          }

          await connectDbForAuth();

          const patient = await Patient.findOne({
            healthPassportId: credentials.healthPassportId,
          });

          if (!patient) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            patient.password,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: patient._id.toString(),
            email: patient.personalInfo.email,
            name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
            role: "patient",
            healthPassportId: patient.healthPassportId,
          };
        } catch (error) {
          console.error("Patient authentication error:", error);
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "doctor",
      name: "Doctor",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDbForAuth();

          const doctor = await Doctor.findOne({
            "personalInfo.email": credentials.email,
          });

          if (!doctor) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            doctor.password,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: doctor._id.toString(),
            email: doctor.personalInfo.email,
            name: `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
            role: "doctor",
            doctorId: doctor.doctorId,
            specialty: doctor.specialty,
            verified: doctor.credentials.verified,
          };
        } catch (error) {
          console.error("Doctor authentication error:", error);
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "hospital",
      name: "Hospital",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDbForAuth();

          const hospital = await Hospital.findOne({
            "facilityInfo.email": credentials.email,
          });

          if (!hospital) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            hospital.password,
          );

          if (!isValid) {
            return null;
          }

          return {
            id: hospital._id.toString(),
            email: hospital.facilityInfo.email,
            name: hospital.facilityInfo.name,
            role: "hospital",
            hospitalId: hospital.hospitalId,
            facilityType: hospital.facilityInfo.type,
            verified: hospital.verified,
          };
        } catch (error) {
          console.error("Hospital authentication error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;

        if (user.role === "admin") {
          token.verified = true;
        } else if (user.role === "patient") {
          token.healthPassportId = user.healthPassportId;
        } else if (user.role === "doctor") {
          token.doctorId = user.doctorId;
          token.specialty = user.specialty;
          token.verified = user.verified;
        } else if (user.role === "hospital") {
          token.hospitalId = user.hospitalId;
          token.facilityType = user.facilityType;
          token.verified = user.verified;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role || "patient") as
          | "patient"
          | "doctor"
          | "hospital"
          | "admin";

        if (token.role === "admin") {
          session.user.verified = true;
        } else if (token.role === "patient") {
          (session.user as any).healthPassportId =
            token.healthPassportId as string;
        } else if (token.role === "doctor") {
          (session.user as any).doctorId = token.doctorId as string;
          (session.user as any).specialty = token.specialty as string;
          (session.user as any).verified = token.verified as boolean;
        } else if (token.role === "hospital") {
          (session.user as any).hospitalId = token.hospitalId as string;
          (session.user as any).facilityType = token.facilityType as string;
          (session.user as any).verified = token.verified as boolean;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
