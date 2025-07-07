"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Download, Search, Eye, Share, Trash2, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PatientDocuments() {
  const [loading, setLoading] = useState(true)
  const [documentsData, setDocumentsData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'patient') {
      router.push('/auth/patient/login')
      return
    }

    fetchDocuments()
  }, [session, status, router])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/patients/documents')
      if (response.ok) {
        const result = await response.json()
        setDocumentsData(result.data)
      } else {
        console.error('Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-96"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const documents = documentsData?.documents || []
  const categories = ["All", "Laboratory", "Consultation", "Prescription", "Imaging", "Immunization"]

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc: any) =>
    doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Documents</h1>
          <p className="text-gray-600">Manage and access your medical documents and reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search documents..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>All Documents</span>
              </CardTitle>
              <CardDescription>Your complete medical document library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc: any) => (
                    <div key={doc.id || doc._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{doc.fileName || doc.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{doc.fileType || doc.type}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadDate || doc.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{doc.fileSize || doc.size}</span>
                              {doc.provider && (
                                <>
                                  <span>•</span>
                                  <span>{doc.provider}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{doc.category}</Badge>
                              <Badge
                                className={
                                  doc.status === "Recent"
                                    ? "bg-green-100 text-green-800"
                                    : doc.status === "Active"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No documents found</p>
                    <p className="text-sm">Your medical documents will be uploaded by healthcare providers</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other category tabs would filter the documents accordingly */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category} value={category.toLowerCase()} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{category} Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents
                    .filter((doc) => doc.category === category)
                    .map((doc) => (
                      <div key={doc.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{doc.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{new Date(doc.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.provider}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">{doc.category}</Badge>
                                <Badge
                                  className={
                                    doc.status === "Recent"
                                      ? "bg-green-100 text-green-800"
                                      : doc.status === "Active"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Your document storage overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Used Storage</span>
              <span className="text-sm font-medium">2.4 GB of 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "24%" }}></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">24</div>
                <div className="text-gray-600">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="font-medium">6</div>
                <div className="text-gray-600">Recent</div>
              </div>
              <div className="text-center">
                <div className="font-medium">3</div>
                <div className="text-gray-600">Shared</div>
              </div>
              <div className="text-center">
                <div className="font-medium">2.4 GB</div>
                <div className="text-gray-600">Storage Used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
