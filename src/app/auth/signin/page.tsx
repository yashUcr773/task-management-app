"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, ArrowRight, Eye, EyeOff, Shield, Zap } from "lucide-react"
import { toast } from "sonner"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials")
      } else {
        const session = await getSession()
        if (session) {
          router.push("/dashboard")
          router.refresh()        }
      }
    } catch {
      toast.error("Something went wrong")
    }

    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left side - Brand and testimonial */}
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Brand */}
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="mr-3 p-2 bg-white/20 backdrop-blur rounded-lg">
              <CheckSquare className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl">TaskFlow</span>
          </div>

          {/* Features showcase */}
          <div className="relative z-20 mt-16 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Authentication</h3>
                <p className="text-white/80 text-sm">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Lightning Fast</h3>
                <p className="text-white/80 text-sm">Access your workspace instantly with optimized performance</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-20 mt-auto">
            <div className="p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <blockquote className="space-y-2">
                <p className="text-lg leading-relaxed">
                  &quot;TaskFlow has revolutionized how our team manages projects. The intuitive interface and powerful features make collaboration seamless.&quot;
                </p>
                <footer className="flex items-center space-x-3 mt-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">SD</span>
                  </div>
                  <div>
                    <div className="font-medium">Sofia Davis</div>
                    <div className="text-white/70 text-sm">Product Manager at TechCorp</div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="lg:p-8 relative z-10">
          <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg lg:hidden">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your TaskFlow account to continue
              </p>
            </div>

            {/* Sign in form */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </Label>
                    </div>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                      New to TaskFlow?
                    </span>
                  </div>
                </div>

                {/* Sign up link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link 
                      href="/auth/signup" 
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Protected by enterprise-grade security</p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span>🔒 SSL Secured</span>
                <span>•</span>
                <span>🛡️ SOC 2 Compliant</span>
                <span>•</span>
                <span>🔐 GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
