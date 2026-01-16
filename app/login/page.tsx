"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { setAuthToken } from "@/lib/api";

interface LoginResponse {
  data?: {
    token?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  token?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation côté client
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Tentative de connexion avec:", { email });
      
      const res = await api.post<LoginResponse>("/login", { 
        email: email.trim(), 
        password 
      });

      console.log("✅ Réponse de connexion:", res.data);

      const token = res.data?.data?.token || res.data?.token;
      const user = res.data?.data?.user;

      if (!token) {
        setError("Connexion réussie mais le token est manquant.");
        setIsLoading(false);
        return;
      }

      // Sauvegarder le token et les infos utilisateur
      setAuthToken(token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      setSuccess("Connexion réussie ! Redirection...");
      
      // Redirection après un court délai
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (err) {
      console.error("❌ Erreur de connexion:", err);
      const apiError = err as ApiError;
      
      if (apiError?.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (apiError?.response?.status === 422) {
        const errors = apiError?.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0]?.[0];
          setError(firstError || "Données invalides.");
        } else {
          setError("Données invalides.");
        }
      } else if (apiError?.response?.status === 429) {
        setError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else {
        setError(apiError?.response?.data?.message || "Erreur de connexion. Vérifiez votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🔐</span>
        </div>
        
        <h1 style={styles.title}>Bon retour !</h1>
        <p style={styles.subtitle}>Connectez-vous à votre compte</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              required
              autoComplete="email"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.passwordContainer}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                required
                autoComplete="current-password"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={styles.passwordInput}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePassword}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <span style={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.success}>
              <span style={styles.successIcon}>✅</span>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner}>⏳</span>
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>ou</span>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Pas encore de compte ?{" "}
            <Link href="/register" style={styles.link}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "48px",
    width: "100%",
    maxWidth: "440px",
    animation: "slideUp 0.4s ease-out",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  icon: {
    fontSize: "48px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "15px",
    color: "#718096",
    marginBottom: "32px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
  },
  input: {
    padding: "14px 16px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    padding: "14px 50px 14px 16px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s",
    width: "100%",
    fontFamily: "inherit",
  },
  togglePassword: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    padding: "14px 16px",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "10px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #fc8181",
  },
  errorIcon: {
    fontSize: "18px",
  },
  success: {
    padding: "14px 16px",
    backgroundColor: "#c6f6d5",
    color: "#22543d",
    borderRadius: "10px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #68d391",
  },
  successIcon: {
    fontSize: "18px",
  },
  button: {
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    animation: "spin 1s linear infinite",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "24px 0",
  },
  dividerText: {
    padding: "0 16px",
    color: "#a0aec0",
    fontSize: "14px",
    fontWeight: "500",
    width: "100%",
    position: "relative",
  },
  footer: {
    marginTop: "8px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "14px",
    color: "#718096",
  },
  link: {
    color: "#667eea",
    fontWeight: "600",
    textDecoration: "none",
  },
};
