import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Heart, Pill, AlertTriangle, Download } from "lucide-react"

export default function MedicalHistory() {
  const conditions = [
    {
      condition: "Hypertension",
      diagnosedDate: "2020-03-15",
      status: "Active",
      severity: "Moderate",
      description: "High blood pressure managed with medication and lifestyle changes",
    },
    {
      condition: "Type 2 Diabetes",
      diagnosedDate: "2019-08-22",
      status: "Active",
      severity: "Well-controlled",
      description: "Diabetes mellitus type 2, managed with Metformin and diet",
    },
    {
      condition: "High Cholesterol",
      diagnosedDate: "2021-01-10",
      status: "Active",
      severity: "Mild",
      description: "Elevated LDL cholesterol, managed with statin therapy",
    },
  ]

  const procedures = [
    {
      procedure: "Cardiac Stress Test",
      date: "2024-11-15",
      provider: "Dr. James Wilson",
      location: "Heart Center",
      result: "Normal",
      notes: "No signs of coronary artery disease",
    },
    {
      procedure: "Colonoscopy",
      date: "2024-06-20",
      provider: "Dr. Lisa Chen",
      location: "Gastroenterology Clinic",
      result: "Normal",
      notes: "No polyps found, next screening in 10 years",
    },
    {
      procedure: "Eye Exam",
      date: "2024-03-10",
      provider: "Dr. Robert Kim",
      location: "Vision Center",
      result: "Mild changes",
      notes: "Early signs of diabetic retinopathy, follow-up in 6 months",
    },
  ]

  const labResults = [
    {
      test: "HbA1c",
      date: "2024-12-01",
      result: "6.8%",
      range: "< 7.0%",
      status: "Normal",
    },
    {
      test: "Total Cholesterol",
      date: "2024-12-01",
      result: "185 mg/dL",
      range: "< 200 mg/dL",
      status: "Normal",
    },
    {
      test: "Blood Pressure",
      date: "2024-12-15",
      result: "125/82 mmHg",
      range: "< 130/80 mmHg",
      status: "Normal",
    },
    {
      test: "Creatinine",
      date: "2024-12-01",
      result: "1.1 mg/dL",
      range: "0.6-1.2 mg/dL",
      status: "Normal",
    },
  ]

  const allergies = [
    {
      allergen: "Penicillin",
      type: "Drug",
      severity: "Severe",
      reaction: "Anaphylaxis",
      notes: "Avoid all penicillin-based antibiotics",
    },
    {
      allergen: "Shellfish",
      type: "Food",
      severity: "Moderate",
      reaction: "Hives, swelling",
      notes: "Carry EpiPen, avoid all shellfish",
    },
  ]

  const immunizations = [
    {
      vaccine: "COVID-19 (Pfizer)",
      date: "2024-09-15",
      dose: "Annual Booster",
      provider: "CVS Pharmacy",
    },
    {
      vaccine: "Influenza",
      date: "2024-10-01",
      dose: "Annual",
      provider: "Primary Care Clinic",
    },
    {
      vaccine: "Tdap",
      date: "2022-05-20",
      dose: "Booster",
      provider: "Primary Care Clinic",
    },
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical History</h1>
          <p className="text-gray-600">Complete overview of your medical records and health history</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span>Medical Conditions</span>
              </CardTitle>
              <CardDescription>Your current and past medical conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{condition.condition}</h3>
                      <div className="flex space-x-2">
                        <Badge
                          className={
                            condition.status === "Active" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {condition.status}
                        </Badge>
                        <Badge variant="outline">{condition.severity}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Diagnosed:</span>{" "}
                      {new Date(condition.diagnosedDate).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-700">{condition.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Procedures & Tests</span>
              </CardTitle>
              <CardDescription>Medical procedures and diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procedures.map((procedure, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{procedure.procedure}</h3>
                      <Badge
                        className={
                          procedure.result === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {procedure.result}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(procedure.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Provider:</span> {procedure.provider}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {procedure.location}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {procedure.notes}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Laboratory Results</span>
              </CardTitle>
              <CardDescription>Recent lab test results and values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Test</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Result</th>
                      <th className="text-left p-2">Reference Range</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((lab, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{lab.test}</td>
                        <td className="p-2 text-gray-600">{new Date(lab.date).toLocaleDateString()}</td>
                        <td className="p-2 font-semibold">{lab.result}</td>
                        <td className="p-2 text-gray-600">{lab.range}</td>
                        <td className="p-2">
                          <Badge
                            className={
                              lab.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {lab.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Allergies & Adverse Reactions</span>
              </CardTitle>
              <CardDescription>Known allergies and adverse drug reactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergies.map((allergy, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-red-800">{allergy.allergen}</h3>
                      <div className="flex space-x-2">
                        <Badge className="bg-red-600 text-white">{allergy.severity}</Badge>
                        <Badge variant="outline" className="border-red-300 text-red-700">
                          {allergy.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-red-700 mb-2">
                      <span className="font-medium">Reaction:</span> {allergy.reaction}
                    </div>
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Notes:</span> {allergy.notes}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-purple-600" />
                <span>Immunization History</span>
              </CardTitle>
              <CardDescription>Vaccination records and immunization history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {immunizations.map((immunization, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{immunization.vaccine}</h3>
                      <Badge className="bg-purple-100 text-purple-800">{immunization.dose}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(immunization.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Provider:</span> {immunization.provider}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
