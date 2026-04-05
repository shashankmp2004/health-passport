"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, AlertTriangle, Clock, TrendingUp } from "lucide-react";

export default function HospitalDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (
      !session ||
      (session.user.role !== "hospital" &&
        session.user.role !== "doctor" &&
        session.user.role !== "admin")
    ) {
      router.push("/auth/hospital/login");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/hospitals/dashboard");
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
        setError(null);
      } else {
        const rawBody = await response.text();
        let errorData: any = {};
        try {
          errorData = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          errorData = { error: rawBody || response.statusText };
        }

        console.error("Dashboard API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          body: rawBody,
        });
        setError(
          errorData.error ||
            `Failed to fetch dashboard data (${response.status})`,
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Network error fetching dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-secondary min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-white border-4 border-black shadow-brutal-sm"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-white border-4 border-black shadow-brutal-sm"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-secondary min-h-screen">
        <Card className="border-4 border-destructive bg-destructive/10">
          <CardContent className="p-6">
            <p className="font-black text-destructive uppercase text-xl">
              Error: {error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-6 py-3 bg-destructive text-white font-black uppercase border-2 border-destructive hover:bg-black hover:border-black transition"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-secondary min-h-screen">
      {/* Header */}
      <div className="bg-secondary border-4 border-black shadow-brutal-lg p-8">
        <Badge className="mb-4 bg-white text-black border-2 border-black uppercase font-black">
          SECURE
        </Badge>
        <h1 className="text-6xl font-display font-black uppercase tracking-tighter mb-2">
          Dashboard
        </h1>
        <p className="text-black font-bold text-lg">
          Hospital: {dashboardData?.hospital?.name || "System Admin"}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-4 border-black bg-white hover:shadow-brutal-lg transition hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-500 border-4 border-black mb-4"></div>
            <p className="text-sm font-bold uppercase text-gray-500">
              Total Patients
            </p>
            <p className="text-5xl font-black">
              {dashboardData?.statistics?.totalPatients || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black bg-white hover:shadow-brutal-lg transition hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-500 border-4 border-black mb-4"></div>
            <p className="text-sm font-bold uppercase text-gray-500">
              Today's Visits
            </p>
            <p className="text-5xl font-black">
              {dashboardData?.statistics?.todayVisits || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black bg-white hover:shadow-brutal-lg transition hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-yellow-500 border-4 border-black mb-4"></div>
            <p className="text-sm font-bold uppercase text-gray-500">
              Monthly Visits
            </p>
            <p className="text-5xl font-black">
              {dashboardData?.statistics?.monthlyVisits || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-4 border-black bg-white hover:shadow-brutal-lg transition hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-500 border-4 border-black mb-4"></div>
            <p className="text-sm font-bold uppercase text-gray-500">Doctors</p>
            <p className="text-5xl font-black">
              {dashboardData?.statistics?.totalDoctors || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients Section */}
      <Card className="border-4 border-black bg-white">
        <CardHeader className="border-b-4 border-black bg-secondary">
          <CardTitle className="font-black text-2xl uppercase">
            Recent Patients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dashboardData?.recentPatients &&
          dashboardData.recentPatients.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  className="p-4 border-4 border-black bg-gray-50 hover:bg-yellow-100 transition"
                >
                  <p className="font-black text-lg uppercase">{patient.name}</p>
                  <p className="text-sm font-bold text-gray-600">
                    ID: {patient.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last visit:{" "}
                    {patient.lastVisit
                      ? new Date(patient.lastVisit).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {patient.diagnosis && (
                    <p className="text-sm font-bold italic mt-2">
                      Diagnosis: {patient.diagnosis}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 font-bold">No recent patients</p>
          )}
        </CardContent>
      </Card>

      {/* Department Stats */}
      {dashboardData?.departmentStats &&
        dashboardData.departmentStats.length > 0 && (
          <Card className="border-4 border-black bg-white">
            <CardHeader className="border-b-4 border-black bg-primary/20">
              <CardTitle className="font-black text-2xl uppercase">
                Department Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.departmentStats.map((dept: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border-4 border-black bg-gray-50"
                  >
                    <p className="font-black text-lg uppercase">
                      {dept.specialty}
                    </p>
                    <p className="text-3xl font-black text-primary">
                      {dept.count}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
