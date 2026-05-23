'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { apiRequest } from "../../lib/api";
import Link from "next/link";
import { Kanban, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Cannot connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Subtle modern background patterns matching the light theme */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] px-4 sm:px-0 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
            <Kanban className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 text-center max-w-sm">
            Sign in to your account to continue your work.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="font-medium text-sm">⚠️ {error}</div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base shadow-sm transition-all" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}