import { useState } from "react";
import { useRouter } from "next/router";
import api, { setAuthToken } from "../src/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      const msg = "Please enter both email and password.";
      setError(msg);
      alert(msg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post("/login", { email, password });
      const token = res?.data?.data?.token || res?.data?.token;

      if (!token) {
        const msg = "Login succeeded but token is missing in the response.";
        setError(msg);
        alert(msg);
        return;
      }

      setAuthToken(token);
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || "Login failed";
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
