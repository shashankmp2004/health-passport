import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HealthPassportCard } from "@/components/health-passport-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary border-2 border-black flex items-center justify-center shadow-brutal-sm">
                <span className="font-bold text-xl text-black">HP</span>
              </div>
              <div>
                <span className="text-3xl font-display font-black tracking-tighter uppercase text-black">
                  HealthPassport
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-black hover:bg-black hover:text-white px-2 py-1 font-bold border-2 border-transparent transition-colors">
                FEATURES
              </a>
              <a href="#security" className="text-black hover:bg-black hover:text-white px-2 py-1 font-bold border-2 border-transparent transition-colors">
                SECURITY
              </a>
              <Link href="/auth/patient/signup">
                <Button size="lg" className="uppercase font-black text-lg">
                  GET STARTED
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20 bg-secondary border-b-4 border-black border-dashed overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col items-start lg:col-span-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black mb-6 leading-none uppercase tracking-tighter mix-blend-multiply brutal-enter delay-100">
                THE FUTURE
                <br />
                OF HEALTH.
              </h1>

              <p className="text-xl md:text-3xl text-black font-medium mb-10 max-w-2xl border-l-8 border-black pl-6 brutal-enter delay-200">
                Revolutionary AI-powered health passport system. Secure your health data all at one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 w-full brutal-enter delay-300">
                <Link href="/auth/patient/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-black text-xl px-8 h-16 border-4 border-black uppercase font-black">
                    START NOW -&gt;
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-xl px-8 h-16 border-4 border-black uppercase font-black bg-white text-black">
                  [ WATCH DEMO ]
                </Button>
              </div>
            </div>

            {/* Showcase */}
            <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0 brutal-enter delay-500 lg:col-span-5 lg:col-start-8">
              <div className="relative rotate-3 hover:rotate-0 transition-transform duration-300 w-full max-w-lg xl:max-w-xl lg:translate-x-12 xl:translate-x-16">
                <HealthPassportCard 
                  patientName="Shashank"
                  patientId="HP-XXXXX-XXXXX"
                  dob="dd/mm/yyyy"
                  bloodType="O+"
                  className="shadow-brutal-lg border-4 border-black bg-white p-0 sm:p-1 w-full" 
                />
                
                {/* Brutalist Badges */}
                <div className="absolute -top-6 -left-6 rotate-[-10deg]">
                  <div className="bg-accent text-black border-2 border-black px-4 py-2 font-black uppercase shadow-brutal-sm transform">
                    VERIFIED
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 rotate-[5deg]">
                  <div className="bg-primary text-black border-2 border-black px-4 py-2 font-black uppercase shadow-brutal-sm z-10">
                    GLOBAL STD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portals */}
      <section className="relative z-10 py-24 bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 border-b-4 border-black pb-8">
            <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter">
              PORTALS_
            </h2>
            <p className="text-2xl font-bold mt-4 bg-black text-white inline-block px-4 py-1">
              SELECT YOUR ROLE
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Patient Portal */}
            <Card className="bg-primary/20 hover:bg-primary transition-colors duration-300">
              <CardHeader className="pb-8 border-b-4 border-black">
                <div className="w-16 h-16 bg-white border-4 border-black mb-6 flex items-center justify-center shadow-brutal-sm">
                  <span className="font-black text-3xl">P</span>
                </div>
                <CardTitle className="text-4xl font-display font-black uppercase">
                  Patient
                </CardTitle>
                <p className="font-bold text-lg mt-4 border-l-4 border-black pl-4">
                  Take control of your health journey.
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6 mb-8">
                  <Link href="/auth/patient/login" className="block">
                    <Button className="w-full bg-white text-black border-4 border-black h-16 text-xl uppercase font-black hover:bg-black hover:text-white">
                      LOGIN -&gt;
                    </Button>
                  </Link>
                  <Link href="/auth/patient/signup" className="block">
                    <Button variant="outline" className="w-full h-16 border-4 border-black text-xl uppercase font-black bg-transparent text-black hover:bg-white hover:text-black hover:shadow-brutal-sm">
                      + CREATE PASSPORT
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3 font-bold text-lg">
                  <div className="flex items-center gap-2">[X] Complete Medical History</div>
                  <div className="flex items-center gap-2">[X] AI Health Insights</div>
                  <div className="flex items-center gap-2">[X] Global Compatibility</div>
                </div>
              </CardContent>
            </Card>

            {/* Healthcare Provider Portal */}
            <Card className="bg-accent/20 hover:bg-accent transition-colors duration-300">
              <CardHeader className="pb-8 border-b-4 border-black">
                <div className="w-16 h-16 bg-white border-4 border-black mb-6 flex items-center justify-center shadow-brutal-sm">
                  <span className="font-black text-3xl">H</span>
                </div>
                <CardTitle className="text-4xl font-display font-black uppercase">
                  Provider
                </CardTitle>
                <p className="font-bold text-lg mt-4 border-l-4 border-black pl-4">
                  Advanced tools for healthcare pros.
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6 mb-8">
                  <Link href="/auth/hospital/login" className="block">
                    <Button className="w-full bg-white text-black border-4 border-black h-16 text-xl uppercase font-black hover:bg-black hover:text-white">
                      LOGIN -&gt;
                    </Button>
                  </Link>
                  <Link href="/auth/hospital/signup" className="block">
                    <Button variant="outline" className="w-full h-16 border-4 border-black text-xl uppercase font-black bg-transparent text-black hover:bg-white hover:text-black hover:shadow-brutal-sm">
                      + REGISTER FACILITY
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3 font-bold text-lg">
                  <div className="flex items-center gap-2">[X] Instant Patient Lookup</div>
                  <div className="flex items-center gap-2">[X] QR Scanner Integration</div>
                  <div className="flex items-center gap-2">[X] EHR Compatibility</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Revolutionary Features */}
      <section id="features" className="relative z-10 py-24 bg-primary border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-b-4 border-black pb-8 inline-block bg-white px-8 -ml-8">
            <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter text-black">
              FEATURES_
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300">
              <CardHeader className="border-b-4 border-black pb-6">
                <CardTitle className="text-3xl font-display font-black uppercase">
                  Q-Speed
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-bold text-lg">
                  Lightning-fast access to complete medical records. Zero waiting times.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300">
              <CardHeader className="border-b-4 border-black pb-6">
                <CardTitle className="text-3xl font-display font-black uppercase">
                  Fort Knox
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-bold text-lg">
                  Military-grade quantum encryption. Mathematically impossible to hack.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300">
              <CardHeader className="border-b-4 border-black pb-6">
                <CardTitle className="text-3xl font-display font-black uppercase">
                  AI Oracle
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-bold text-lg">
                  Predictive health analytics and early warning systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black text-white py-20 border-t-8 border-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <div className="text-5xl font-display font-black uppercase tracking-tighter mb-4 text-white">
                HealthPassport
              </div>
              <p className="text-xl font-bold bg-white text-black inline-block px-2 py-1 mb-8">
                THE FUTURE OF HEALTHCARE
              </p>
              <div className="flex space-x-4">
                <Button className="bg-accent text-black hover:bg-white border-2 border-transparent hover:border-black text-lg uppercase font-black">
                  START NOW
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-black mb-6 text-2xl uppercase border-b-2 border-white pb-2 inline-block">PATIENTS</h4>
                <ul className="space-y-4 font-bold text-lg">
                  <li><a href="#" className="hover:text-accent hover:underline">&gt; MEDICAL RECORDS</a></li>
                  <li><a href="#" className="hover:text-accent hover:underline">&gt; HEALTH TRACKING</a></li>
                  <li><a href="#" className="hover:text-accent hover:underline">&gt; AI INSIGHTS</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black mb-6 text-2xl uppercase border-b-2 border-white pb-2 inline-block">PROVIDERS</h4>
                <ul className="space-y-4 font-bold text-lg">
                  <li><a href="#" className="hover:text-primary hover:underline">&gt; PATIENT LOOKUP</a></li>
                  <li><a href="#" className="hover:text-primary hover:underline">&gt; QR SCANNER</a></li>
                  <li><a href="#" className="hover:text-primary hover:underline">&gt; ANALYTICS</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-white pt-8 flex flex-col md:flex-row justify-between items-center font-bold">
            <div className="mb-4 md:mb-0">
              © 2026 HP. SECURING HEALTHCARE FOR HUMANITY.
            </div>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-accent hover:underline">PRIVACY</a>
              <a href="#" className="hover:text-accent hover:underline">TERMS</a>
              <a href="#" className="hover:text-accent hover:underline">CONTACT</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
