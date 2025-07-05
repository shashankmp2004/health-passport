import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Hospital, ArrowRight, Heart, CheckCircle, Smartphone, Brain, Stethoscope, Activity, Lock, Zap, Globe, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MovingParticles } from "@/components/moving-particles"
import { HealthPassportCard } from "@/components/health-passport-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      <MovingParticles />

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthPassport
                </span>
                <div className="text-xs text-gray-500 font-medium">Secure • Smart • Seamless</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#security" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Security
              </a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              <Link href="/auth/patient/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-100 hover:to-purple-100 px-6 py-3 text-sm font-semibold border border-blue-200/50">
              <Lock className="w-4 h-4 mr-2" />
              Blockchain-Secured Health Records
            </Badge>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Healthcare
              </span>
            </h1>

            <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Revolutionary AI-powered health passport system with quantum-grade security, 
              instant global access, and seamless provider integration.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link href="/auth/patient/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300">
                  Start Your Health Journey
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-10 py-6 text-xl border-2 border-gray-300 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
                Watch Demo
                <Activity className="w-6 h-6 ml-3" />
              </Button>
            </div>

            {/* Health Passport Card Showcase */}
            <div className="relative flex justify-center">
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <HealthPassportCard 
                  patientName="Sample Patient"
                  patientId="HP-SAMPLE-001"
                  bloodType="O+"
                  emergencyContact="+1 (555) 0123"
                  lastVisit="Sample Visit"
                  location="Sample Hospital"
                  vitals={{
                    bloodPressure: "120/80",
                    heartRate: "72 BPM", 
                    temperature: "98.6°F",
                    weight: "140 lbs"
                  }}
                  className="shadow-3xl" 
                />
                
                {/* Floating Action Indicators */}
                <div className="absolute -top-8 -left-8 animate-bounce delay-1000">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Verified
                  </div>
                </div>
                
                <div className="absolute -top-8 -right-8 animate-bounce delay-2000">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Instant Access
                  </div>
                </div>
                
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce delay-3000">
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Global Standard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portals */}
      <section className="relative z-10 py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Choose Your Portal
              </span>
            </h2>
            <p className="text-xl text-gray-600">Select your role to experience the future of healthcare</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Patient Portal */}
            <Card className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center pb-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Patient Portal
                </CardTitle>
                <p className="text-gray-600 mt-4">Take control of your health journey with smart, secure access to your complete medical history</p>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <div className="space-y-4 mb-10">
                  <Link href="/auth/patient/login" className="w-full block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Access Your Health Dashboard
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </Link>
                  <Link href="/auth/patient/signup" className="w-full block">
                    <Button variant="outline" className="w-full h-12 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                      Create Your Health Passport
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Complete Medical History</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI Health Insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>QR Code Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Global Compatibility</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Healthcare Provider Portal */}
            <Card className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center pb-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Hospital className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Healthcare Provider
                </CardTitle>
                <p className="text-gray-600 mt-4">Advanced tools for healthcare professionals to deliver exceptional patient care with instant access to verified health data</p>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <div className="space-y-4 mb-10">
                  <Link href="/auth/hospital/login" className="w-full block">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Access Provider Dashboard
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </Link>
                  <Link href="/auth/hospital/signup" className="w-full block">
                    <Button variant="outline" className="w-full h-12 border-2 border-gray-300 hover:border-green-500 hover:text-green-600 transition-all duration-300">
                      Register Your Facility
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant Patient Lookup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>QR Scanner Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>EHR Compatibility</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section id="features" className="relative z-10 py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience next-generation healthcare technology designed for the modern world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Quantum-Speed Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Lightning-fast access to complete medical records via QR codes, biometric verification, or patient ID. 
                  Zero waiting times, maximum efficiency.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-green-50/30 overflow-hidden">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                  Unbreakable Security
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Military-grade blockchain encryption with quantum-resistant algorithms. Your medical data is 
                  mathematically impossible to compromise.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-purple-50/30 overflow-hidden">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
                  AI Health Oracle
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed text-lg">
                  Advanced AI provides predictive health analytics, personalized recommendations, and early 
                  warning systems for optimal health outcomes.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Diagnostics</h4>
              <p className="text-sm text-gray-600">AI-powered health pattern recognition</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Standard</h4>
              <p className="text-sm text-gray-600">Accepted worldwide by healthcare providers</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">Continuous health tracking and alerts</p>
            </div>

            <div className="text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Care</h4>
              <p className="text-sm text-gray-600">VIP access to top healthcare facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section id="security" className="relative z-10 py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Uncompromising Security
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your health data is protected by the most advanced security protocols ever deployed in healthcare
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Security Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Quantum-Resistant Encryption</h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Next-generation cryptographic algorithms that remain secure even against quantum computer attacks. 
                    Your data is protected for decades to come.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Immutable Blockchain Records</h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Every health record is permanently stored on an immutable blockchain, making tampering or 
                    unauthorized changes mathematically impossible.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Zero-Knowledge Architecture</h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Our systems can verify your identity and health data without ever storing your private information. 
                    Complete privacy by design.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-center mb-8 text-white">Security Metrics</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-300 mb-2">256-bit</div>
                  <div className="text-blue-200">AES Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-300 mb-2">99.99%</div>
                  <div className="text-blue-200">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-300 mb-2">SOC 2</div>
                  <div className="text-blue-200">Type II Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">HIPAA</div>
                  <div className="text-blue-200">Compliant</div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-white font-semibold">Multi-layer Security Stack</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Advanced threat detection, real-time monitoring, and automated incident response 
                  protect your data 24/7/365.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Statistics */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Transforming Healthcare Globally</h2>
            <p className="text-xl text-blue-100">Join millions who trust HealthPassport with their most precious asset</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                2.5M+
              </div>
              <div className="text-blue-100 text-lg">Active Health Passports</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50M+
              </div>
              <div className="text-blue-100 text-lg">Secure Health Records</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                99.99%
              </div>
              <div className="text-blue-100 text-lg">Security Uptime</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-blue-100 text-lg">Global Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    HealthPassport
                  </span>
                  <div className="text-sm text-gray-400">The Future of Healthcare</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
                Revolutionizing healthcare with quantum-secured blockchain technology, AI-powered insights, 
                and seamless global accessibility. Your health, your control, your future.
              </p>
              <div className="flex space-x-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started Today
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl text-white">For Patients</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Medical Records</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Health Tracking</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>AI Health Insights</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Emergency Access</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-xl text-white">For Providers</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Patient Lookup</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>QR Code Scanner</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Analytics Dashboard</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>EHR Integration</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                © 2024 HealthPassport. All rights reserved. Securing healthcare for humanity.
              </div>
              <div className="flex space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
