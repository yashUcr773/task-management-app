"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, ArrowRight, Eye, EyeOff, Shield, Users, Zap, Check } from "lucide-react"
import { toast } from "sonner"

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }
    
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        toast.success("Account created successfully!")
        router.push("/auth/signin")      } else {
        const data = await response.json()
        toast.error(data.message || "Something went wrong")
      }
    } catch {
      toast.error("Something went wrong")
    }

    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 py-8">
        {/* Left side - Brand and benefits */}
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Brand */}
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="mr-3 p-2 bg-white/20 backdrop-blur rounded-lg">
              <CheckSquare className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl">TaskFlow</span>
          </div>

          {/* Benefits showcase */}
          <div className="relative z-20 mt-16 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Join thousands of teams</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-lg mt-1">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Team Collaboration</h3>
                    <p className="text-white/80">Work seamlessly with your team members in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-lg mt-1">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Boost Productivity</h3>
                    <p className="text-white/80">Streamline your workflow and get more done</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-lg mt-1">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Enterprise Security</h3>
                    <p className="text-white/80">Your data is protected with bank-level security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-20 mt-auto">
            <div className="grid grid-cols-3 gap-4 p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-white/70 text-xs">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-white/70 text-xs">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-white/70 text-xs">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="lg:p-8 relative z-10">
          <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg lg:hidden">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Start your journey with TaskFlow today
              </p>
            </div>

            {/* Sign up form */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl">Get started for free</CardTitle>
                <CardDescription>
                  Create your TaskFlow account in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="h-11 pr-10 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                        placeholder="Create a strong password"
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
                    <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="h-11 pr-10 border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500"
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Terms and conditions */}
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </div>
                    <div className="text-sm leading-5">
                      <Label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                        I agree to the{" "}
                        <Link href="/terms" className="text-green-600 hover:text-green-500 font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-green-600 hover:text-green-500 font-medium">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                    disabled={loading || !acceptTerms}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* What you get */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">What you get:</h4>
                  <div className="space-y-2">
                    {[
                      "Unlimited personal projects",
                      "5 team members included",
                      "10GB storage space",
                      "Email support"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Link 
                      href="/auth/signin" 
                      className="font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                      Sign in to your account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Join 10,000+ teams already using TaskFlow</p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span>🔒 SSL Secured</span>
                <span>•</span>
                <span>⚡ Free to start</span>
                <span>•</span>
                <span>📧 No spam, ever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
