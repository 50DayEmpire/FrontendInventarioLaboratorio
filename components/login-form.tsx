"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/authService";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  function toggleMode() {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setErrorMessage("");
    setSuccessMessage("");
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        await AuthService.register({ email, password });
        setSuccessMessage(
          "Cuenta creada con éxito. Ahora puedes iniciar sesión.",
        );
        setMode("login");
        setEmail("");
        setPassword("");
      } else {
        const response = await AuthService.login({ email, password });
        const token = response?.token || response?.jwt || response?.accessToken;

        if (!token || typeof token !== "string") {
          throw new Error("No se recibió un token JWT válido");
        }

        localStorage.setItem("token", token);
        router.push("/products");
      }
    } catch (error) {
      setErrorMessage(
        mode === "register"
          ? "No se pudo crear la cuenta. Verifica los datos e intenta de nuevo."
          : "Credenciales inválidas o error de autenticación",
      );
      console.error(
        mode === "register"
          ? "Error al registrarse:"
          : "Error al iniciar sesión:",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground tracking-tight">
              NovaCom
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <blockquote className="space-y-3">
            <p className="text-lg leading-relaxed text-primary-foreground/80">
              {
                '"Streamline your product management with powerful tools designed for modern teams.'
              }
            </p>
            <footer className="text-sm text-primary-foreground/60">
              Enterprise-grade security and performance
            </footer>
          </blockquote>
        </div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">
              NovaCom
            </span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {mode === "login" ? "Bienvenido de nuevo!" : "Crear una cuenta"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mode === "login"
                ? "Inicia sesión en tu cuenta para continuar"
                : "Completa los campos para registrarte"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-10 h-11 bg-secondary/50 border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                {mode === "login" && (
                  <Link
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 bg-secondary/50 border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {mode === "register" && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial (!@#$%...)</li>
                </ul>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {mode === "login" ? "Signing in..." : "Registrando..."}
                </div>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Registrarse"
              )}
            </Button>

            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "login"
              ? "¿No tienes una cuenta? "
              : "¿Ya tienes una cuenta? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
            >
              {mode === "login" ? "Registrarse" : "Iniciar sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
