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

    if (!session || (session.user.role !== 'patient' && session.user.role !== 'admin')) {
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
      <div className="p-6 md:p-8 space-y-8 bg-[#f4f4f0] min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-white border-4 border-black mb-4 w-64 shadow-[4px_4px_0px_#000]"></div>
          <div className="h-6 bg-white border-2 border-black w-96 mb-8"></div>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white border-4 border-black shadow-[4px_4px_0px_#000]"></div>
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
    <div className="p-6 md:p-8 space-y-8 bg-[#f4f4f0] min-h-screen selection:bg-purple-200 selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 brutal-enter">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mix-blend-multiply">Medical Documents</h1>
          <p className="text-black font-bold text-lg border-l-4 border-black pl-3 mt-2 bg-white/50 inline-block pr-3">Manage and access your medical documents and reports</p>
        </div>
        <Button className="h-12 bg-purple-200 text-black hover:bg-black hover:text-white border-4 border-black rounded-none font-black text-base uppercase transition-all shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_#000]">
          <Upload className="w-5 h-5 mr-3" strokeWidth={3} />
          Upload Document
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white brutal-enter delay-100">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-6 h-6" strokeWidth={3} />
              <Input 
                placeholder="SEARCH DOCUMENTS..." 
                className="pl-14 h-14 border-4 border-black rounded-none text-black font-black uppercase placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black transition-shadow focus-within:shadow-[4px_4px_0px_#000] text-lg bg-[#f4f4f0]" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Button className="h-14 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-secondary text-black font-black uppercase tracking-wider md:w-auto flex-1">
                <Calendar className="w-5 h-5 md:mr-2" strokeWidth={3} />
                <span className="hidden md:inline">Date Range</span>
              </Button>
              <Button className="h-14 border-4 border-black rounded-none shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all bg-[#4ade80] text-black font-black uppercase tracking-wider md:w-auto flex-1">
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full brutal-enter delay-200">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-0 border-4 border-black bg-white rounded-none shadow-brutal-sm mb-8 relative z-10 overflow-hidden">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category.toLowerCase()}
              className="rounded-none border-b-4 lg:border-b-0 lg:border-r-4 border-black last:border-b-0 last:border-r-0 data-[state=active]:bg-purple-200 data-[state=active]:text-black font-black uppercase text-sm md:text-xs xl:text-sm py-4 px-1"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 outline-none">
          <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white">
            <CardHeader className="border-b-4 border-black bg-blue-200/20 pb-4">
              <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                <FileText className="w-8 h-8 text-black" strokeWidth={3} />
                <span>All Documents</span>
              </CardTitle>
              <CardDescription className="font-bold uppercase text-black">Your complete medical document library</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-4 divide-black">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc: any) => (
                    <div key={doc.id || doc._id} className="p-4 md:p-6 hover:bg-blue-200/10 transition-colors group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform shadow-[4px_4px_0px_#000] shrink-0">
                            <FileText className="w-8 h-8 text-black" strokeWidth={3} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-xl uppercase tracking-wider mb-2">{doc.fileName || doc.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase mb-3">
                              <span className="bg-white border-2 border-black px-2 py-0.5">{doc.fileType || doc.type}</span>
                              <span className="bg-black text-white px-2 py-0.5">{new Date(doc.uploadDate || doc.date).toLocaleDateString()}</span>
                              <span className="bg-white border-2 border-black px-2 py-0.5">{doc.fileSize || doc.size}</span>
                              {doc.provider && (
                                <span className="bg-white border-2 border-dashed border-black px-2 py-0.5">{doc.provider}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className="border-2 border-black rounded-none font-black uppercase tracking-wider text-xs px-2 py-1 bg-[#f4f4f0] text-black shadow-brutal-sm hover:bg-white">{doc.category}</Badge>
                              <Badge
                                className={`border-2 border-black rounded-none font-black uppercase tracking-wider text-xs px-2 py-1 shadow-brutal-sm ${
                                  doc.status === "Recent"
                                    ? "bg-green-200 text-black hover:bg-green-200"
                                    : doc.status === "Active"
                                      ? "bg-[#60a5fa] text-black hover:bg-[#60a5fa]"
                                      : "bg-gray-200 text-black hover:bg-gray-200"
                                }`}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:ml-4 border-t-4 border-black border-dashed md:border-t-0 md:border-l-4 pt-4 md:pt-0 pl-0 md:pl-6 shrink-0">
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-secondary shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="View">
                            <Eye className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-[#4ade80] shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Download">
                            <Download className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-[#60a5fa] shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Share">
                            <Share className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-destructive text-white hover:bg-red-600 shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Delete">
                            <Trash2 className="w-5 h-5" strokeWidth={3} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4 bg-gray-50 border-b-4 border-black">
                    <div className="w-20 h-20 border-4 border-black rounded-none mx-auto mb-6 flex items-center justify-center bg-white rotate-6 shadow-[4px_4px_0px_#000]">
                      <FileText className="w-10 h-10 text-black" strokeWidth={3} />
                    </div>
                    <p className="font-black text-2xl uppercase mb-2">No documents found</p>
                    <p className="text-sm font-bold uppercase px-4 py-1 border-2 border-black inline-block bg-white shadow-brutal-sm max-w-sm mx-auto">Your medical documents will appear here once uploaded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other category tabs would filter the documents accordingly */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category} value={category.toLowerCase()} className="space-y-4 outline-none">
            <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white mt-8">
              <CardHeader className="border-b-4 border-black bg-purple-200/20 pb-4">
                <CardTitle className="flex items-center space-x-3 font-display font-black text-2xl uppercase">
                  <FileText className="w-8 h-8 text-black" strokeWidth={3} />
                  <span>{category} Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y-4 divide-black">
                  {documents
                    .filter((doc: any) => doc.category === category && (
                      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
                    .length > 0 ? documents
                    .filter((doc: any) => doc.category === category && (
                      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
                    .map((doc: any) =>  (
                      <div key={doc.id || doc._id} className="p-4 md:p-6 hover:bg-purple-200/10 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[4px_4px_0px_#000] shrink-0">
                            <FileText className="w-8 h-8 text-black" strokeWidth={3} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-xl uppercase tracking-wider mb-2">{doc.fileName || doc.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase mb-3">
                              <span className="bg-white border-2 border-black px-2 py-0.5">{doc.fileType || doc.type}</span>
                              <span className="bg-black text-white px-2 py-0.5">{new Date(doc.uploadDate || doc.date).toLocaleDateString()}</span>
                              <span className="bg-white border-2 border-black px-2 py-0.5">{doc.fileSize || doc.size}</span>
                              {doc.provider && (
                                <span className="bg-white border-2 border-dashed border-black px-2 py-0.5">{doc.provider}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className="border-2 border-black rounded-none font-black uppercase tracking-wider text-xs px-2 py-1 bg-[#f4f4f0] text-black shadow-brutal-sm hover:bg-white">{doc.category}</Badge>
                              <Badge
                                className={`border-2 border-black rounded-none font-black uppercase tracking-wider text-xs px-2 py-1 shadow-brutal-sm ${
                                  doc.status === "Recent"
                                    ? "bg-green-200 text-black hover:bg-green-200"
                                    : doc.status === "Active"
                                      ? "bg-[#60a5fa] text-black hover:bg-[#60a5fa]"
                                      : "bg-gray-200 text-black hover:bg-gray-200"
                                }`}
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:ml-4 border-t-4 border-black border-dashed md:border-t-0 md:border-l-4 pt-4 md:pt-0 pl-0 md:pl-6 shrink-0">
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-secondary shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="View">
                            <Eye className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-[#4ade80] shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Download">
                            <Download className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-white text-black hover:bg-[#60a5fa] shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Share">
                            <Share className="w-5 h-5" strokeWidth={3} />
                          </Button>
                          <Button className="h-10 w-10 p-0 border-4 border-black rounded-none bg-destructive text-white hover:bg-red-600 shadow-brutal-sm hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:translate-x-1 transition-all" title="Delete">
                            <Trash2 className="w-5 h-5" strokeWidth={3} />
                          </Button>
                        </div>
                      </div>
                      </div>
                    )) : (
                    <div className="text-center py-12 px-4 bg-gray-50 border-b-4 border-black">
                      <div className="w-16 h-16 border-4 border-black rounded-none mx-auto mb-4 flex items-center justify-center bg-white -rotate-6 shadow-[4px_4px_0px_#000]">
                        <FileText className="w-8 h-8 text-black" strokeWidth={3} />
                      </div>
                      <p className="font-black text-lg uppercase mb-2">No {category} Documents</p>
                      <p className="text-xs font-bold uppercase px-3 py-1 border-2 border-black inline-block bg-white shadow-brutal-sm">Or none matching search</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Storage Usage */}
      <Card className="border-4 border-black rounded-none shadow-brutal-sm bg-white brutal-enter delay-300">
        <CardHeader className="border-b-4 border-black bg-gray-100 pb-4">
          <CardTitle className="font-display font-black text-2xl uppercase">Storage Usage</CardTitle>
          <CardDescription className="font-bold uppercase text-black">Your document storage overview</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider bg-black text-white px-3 py-1 border-2 border-black inline-block">Used Storage</span>
              <span className="font-black text-lg">2.4 GB <span className="text-sm">of</span> 10 GB</span>
            </div>
            <div className="w-full bg-white border-4 border-black h-8 rounded-none relative overflow-hidden shadow-[4px_4px_0px_#000]">
              <div 
                className="bg-[#60a5fa] h-full absolute top-0 left-0 border-r-4 border-black" 
                style={{ width: "24%" }}
              >
                <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] bg-white"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t-4 border-black border-dashed">
              <div className="text-center p-4 border-4 border-black bg-white shadow-brutal-sm hover:-translate-y-1 transition-transform cursor-default">
                <div className="font-black text-3xl">24</div>
                <div className="text-sm font-bold uppercase mt-1">Total Docs</div>
              </div>
              <div className="text-center p-4 border-4 border-black bg-[#4ade80] shadow-brutal-sm hover:-translate-y-1 transition-transform cursor-default">
                <div className="font-black text-3xl">6</div>
                <div className="text-sm font-bold uppercase mt-1">Recent</div>
              </div>
              <div className="text-center p-4 border-4 border-black bg-secondary shadow-brutal-sm hover:-translate-y-1 transition-transform cursor-default">
                <div className="font-black text-3xl">3</div>
                <div className="text-sm font-bold uppercase mt-1">Shared</div>
              </div>
              <div className="text-center p-4 border-4 border-black bg-black text-white shadow-brutal-sm hover:-translate-y-1 transition-transform cursor-default">
                <div className="font-black text-3xl">2.4<span className="text-sm">GB</span></div>
                <div className="text-sm font-bold uppercase mt-1">Storage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
