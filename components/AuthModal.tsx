"use client";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./AuthModal.module.css";

type AuthMode = "login" | "signup";

export type User = {
  name: string;
  email: string;
  initials: string;
};

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  darkMode?: boolean;
}

const getInitials = (fullName: string) =>
  fullName.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function AuthModal({ onClose, onLogin, darkMode }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFriendlyError = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        onLogin({ name, email, initials: getInitials(name) });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const displayName = cred.user.displayName || email.split("@")[0];
        onLogin({ name: displayName, email, initials: getInitials(displayName) });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(getFriendlyError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.overlay} ${darkMode ? styles.overlayDark : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${styles.modal} ${darkMode ? styles.modalDark : ""}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.modalHeader}>
          <div className={styles.logo}>🏛️</div>
          <h2 className={styles.modalTitle}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className={styles.modalSubtitle}>
            {mode === "login" ? "Enter your credentials to continue" : "Join AskGreekGodsBot for free"}
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.tabActive : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log in
          </button>
          <button
            className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`}
            onClick={() => { setMode("signup"); setError(""); }}
          >
            Sign up
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className={styles.field}>
              <label className={styles.label}>Full name</label>
              <input
                type="text"
                className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
                placeholder="e.g. Odysseus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              placeholder="you@olympus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          {mode === "login" && (
            <div className={styles.forgotRow}>
              <button type="button" className={styles.forgotLink}>Forgot password?</button>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.submitBtn} ${loading ? styles.submitLoading : ""}`}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : mode === "login" ? "Continue" : "Create account"}
          </button>
        </form>

        <p className={styles.switchText}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className={styles.switchLink}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}