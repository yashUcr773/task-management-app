import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Users, Calendar, BarChart3, Shield, Zap, ArrowRight, Star, Play, Check, Globe, Smartphone, Clock } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link className="flex items-center justify-center" href="/">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CheckSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#testimonials">
              Testimonials
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
              Pricing
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <Badge variant="secondary" className="px-4 py-2">
              <Star className="w-3 h-3 mr-1" />
              Trusted by 10,000+ teams worldwide
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Task Management
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl lg:text-2xl dark:text-gray-400 leading-relaxed">
                Organize your work, collaborate with your team, and boost productivity with our intuitive task management platform trusted by teams worldwide.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/auth/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="#demo" className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Everything you need
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features for Modern Teams
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl dark:text-gray-400 leading-relaxed">
                Everything you need to manage tasks, collaborate with teams, and track progress in one beautiful platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3 lg:gap-12">
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Smart Task Management</CardTitle>
                <CardDescription className="text-base">
                  Create, assign, and track tasks with rich details, dependencies, custom workflows, and automated reminders.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
                <CardDescription className="text-base">
                  Work together seamlessly with role-based access, real-time updates, team insights, and instant messaging.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Multiple Views</CardTitle>
                <CardDescription className="text-base">
                  Switch between Kanban boards, calendar view, Gantt charts, and table views to stay organized and productive.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Analytics & Reports</CardTitle>
                <CardDescription className="text-base">
                  Track progress, measure productivity, and generate insights with comprehensive reporting and dashboards.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Enterprise Security</CardTitle>
                <CardDescription className="text-base">
                  Keep your data secure with enterprise-grade security, SOC 2 compliance, and advanced access controls.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-xl">Powerful Integrations</CardTitle>
                <CardDescription className="text-base">
                  Connect with 100+ tools and automate workflows with Slack, GitHub, Google Workspace, and more.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Testimonials
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Loved by teams worldwide
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl dark:text-gray-400">
                See what our customers have to say about TaskFlow
              </p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    SD
                  </div>
                  <div>
                    <p className="font-semibold">Sofia Davis</p>
                    <p className="text-sm text-muted-foreground">Product Manager at TechCorp</p>
                  </div>
                </div>
                <CardDescription className="text-base">
                  &quot;TaskFlow has revolutionized how our team manages projects. The intuitive interface and powerful features make collaboration seamless. Our productivity has increased by 40%!&quot;
                </CardDescription>
                <div className="flex items-center space-x-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    MJ
                  </div>
                  <div>
                    <p className="font-semibold">Marcus Johnson</p>
                    <p className="text-sm text-muted-foreground">Engineering Lead at StartupXYZ</p>
                  </div>
                </div>
                <CardDescription className="text-base">
                  &quot;The real-time collaboration features are incredible. Our remote team feels more connected than ever. TaskFlow&apos;s Kanban boards and sprint planning tools are game-changers.&quot;
                </CardDescription>
                <div className="flex items-center space-x-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    AW
                  </div>
                  <div>
                    <p className="font-semibold">Amanda Wilson</p>
                    <p className="text-sm text-muted-foreground">Operations Director at GlobalCo</p>
                  </div>
                </div>
                <CardDescription className="text-base">
                  &quot;We&apos;ve tried many project management tools, but TaskFlow is by far the best. The analytics and reporting features help us make data-driven decisions every day.&quot;
                </CardDescription>
                <div className="flex items-center space-x-1 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Pricing
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl dark:text-gray-400">
                Choose the plan that works best for your team
              </p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="relative border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">
                  Perfect for small teams getting started
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Up to 5 team members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Basic task management</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Kanban boards</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Mobile app</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            </Card>
            <Card className="relative border-2 border-primary hover:shadow-lg transition-all duration-300 scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-muted-foreground">/month per user</span>
                </div>
                <CardDescription className="mt-4">
                  For growing teams that need more features
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Unlimited team members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Time tracking</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" asChild>
                  <Link href="/auth/signup">Start Free Trial</Link>
                </Button>
              </div>
            </Card>
            <Card className="relative border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$25</span>
                  <span className="text-muted-foreground">/month per user</span>
                </div>
                <CardDescription className="mt-4">
                  For large organizations with advanced needs
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Everything in Professional</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">SSO & advanced security</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Custom workflows</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm">API access</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/auth/signup">Contact Sales</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Ready to transform your workflow?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl leading-relaxed">
                Join thousands of teams who trust TaskFlow to organize their work and boost productivity. Start your free trial today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/auth/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Setup in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Works everywhere</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Mobile friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <CheckSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">TaskFlow</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The modern task management platform that helps teams stay organized and productive.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Security</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Integrations</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 TaskFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Made with ❤️ for productive teams</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
