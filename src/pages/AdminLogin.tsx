import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowUpRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Access — Sampaguita & Saro";
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden grain bg-background">
      {/* Animated orbs matching Hero */}
      <div
        aria-hidden
        className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-primary/25 blur-[120px] animate-orb -z-10"
      />
      <div
        aria-hidden
        className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-accent/30 blur-[120px] animate-orb -z-10"
        style={{ animationDelay: "-6s" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[120px] animate-orb -z-10"
        style={{ animationDelay: "-12s" }}
      />

      <div className="container relative max-w-md px-6">
        {/* Logo/Brand */}
        <div className="reveal text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-foreground text-background mb-6 shadow-card">
            <Lock className="w-9 h-9" />
          </div>
          <h1 className="font-display font-medium text-5xl tracking-tight text-foreground mb-3">
            Admin <span className="italic font-light text-gradient-warm">Access</span>
          </h1>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-foreground/60">
            Sampaguita & Saro
          </p>
        </div>

        {/* Login Form */}
        <div className="reveal reveal-delay-1 glass rounded-3xl p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full inline-flex items-center justify-center gap-3 pl-7 pr-3 py-4 rounded-full bg-foreground text-background overflow-hidden transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-medium tracking-wide relative z-10">
                {isLoading ? "Signing in..." : "Sign in"}
              </span>
              <span className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background text-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="absolute inset-0 gradient-warm opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>
        </div>

        {/* Back to Home Link */}
        <div className="reveal reveal-delay-2 text-center mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors"
          >
            <span className="border-b border-foreground/20 hover:border-primary pb-0.5">
              Back to home
            </span>
          </a>
        </div>

        {/* Decorative spinning badge */}
        <div className="absolute -top-12 -right-12 hidden md:flex items-center justify-center w-28 h-28 rounded-full bg-foreground text-background animate-spin-slow opacity-40">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <defs>
              <path
                id="circle-admin"
                d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              />
            </defs>
            <text className="font-mono text-[9px] tracking-[0.3em] uppercase fill-background">
              <textPath href="#circle-admin">
                Admin · Secure · Private · Admin · Secure · Private ·
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
