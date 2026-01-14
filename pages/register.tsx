import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api, { setAuthToken } from "../lib/api";

interface LoginResponse {
  data?: {
    token?: string;
  };
  token?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      const msg = "Please enter both email and password.";
      setError(msg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<LoginResponse>("/login", { email, password });
      const token = res.data?.data?.token || res.data?.token;

      if (!token) {
        const msg = "Login succeeded but token is missing in the response.";
        setError(msg);
        setIsLoading(false);
        return;
      }

      setAuthToken(token);
      await router.push("/");
    } catch (err) {
      console.error(err);
      const apiError = err as ApiError;
      const message = apiError?.response?.data?.message || apiError?.message || "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.link}>
              Sign up
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
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
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
    fontWeight: "500",
    color: "#2d3748",
  },
  input: {
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "8px",
    fontSize: "14px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    marginTop: "8px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footer: {
    marginTop: "24px",
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