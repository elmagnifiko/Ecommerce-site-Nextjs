"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { setAuthToken } from "@/lib/api";

interface RegisterResponse {
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

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const router = useRouter();

  const checkPasswordStrength = (pwd: string): string => {
    if (pwd.length === 0) return "";
    if (pwd.length < 6) return "Faible";
    if (pwd.length < 8) return "Moyen";
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return "Fort";
    return "Moyen";
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations côté client
    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Tentative d'inscription avec:", { name, email });
      
      const res = await api.post<RegisterResponse>("/register", { 
        name: name.trim(), 
        email: email.trim(), 
        password,
        password_confirmation: confirmPassword
      });

      console.log("✅ Réponse d'inscription:", res.data);
      
      const token = res.data?.data?.token || res.data?.token;
      const user = res.data?.data?.user;

      if (token) {
        setAuthToken(token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setSuccess("Compte créé avec succès ! Redirection...");
        
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setSuccess("Compte créé ! Redirection vers la connexion...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Erreur d'inscription:", err);
      const apiError = err as ApiError;
      
      if (apiError?.response?.status === 422) {
        const errors = apiError?.response?.data?.errors;
        if (errors) {
          const errorMessages = Object.entries(errors)
            .map(([field, messages]) => messages.join(", "))
            .join(" ");
          setError(errorMessages);
        } else {
          setError("Données invalides. Vérifiez vos informations.");
        }
      } else if (apiError?.response?.status === 409) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(apiError?.response?.data?.message || "Erreur lors de la création du compte.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🚀</span>
        </div>
        
        <h1 style={styles.title}>Créer un compte</h1>
        <p style={styles.subtitle}>Rejoignez-nous dès aujourd'hui</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              value={name}
              required
              autoComplete="name"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

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
                autoComplete="new-password"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  setPasswordStrength(checkPasswordStrength(e.target.value));
                }}
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
            {passwordStrength && (
              <div style={styles.strengthIndicator}>
                <span style={{
                  ...styles.strengthText,
                  color: passwordStrength === "Fort" ? "#38a169" : passwordStrength === "Moyen" ? "#d69e2e" : "#e53e3e"
                }}>
                  Force: {passwordStrength}
                </span>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmer le mot de passe
            </label>
            <div style={styles.passwordContainer}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                required
                autoComplete="new-password"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                style={styles.passwordInput}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.togglePassword}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
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
                Création en cours...
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>ou</span>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Vous avez déjà un compte ?{" "}
            <Link href="/login" style={styles.link}>
              Se connecter
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
  strengthIndicator: {
    marginTop: "4px",
  },
  strengthText: {
    fontSize: "12px",
    fontWeight: "600",
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
