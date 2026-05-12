"use client";
import { useState } from "react";
import styles from "./ProfileSettings.module.css";
import type { User } from "./AuthModal";

interface ProfileSettingsProps {
  user: User;
  darkMode?: boolean;
  onClose: () => void;
  onSave: (updated: User) => void;
}

export default function ProfileSettings({ user, darkMode, onClose, onSave }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);

  const getInitials = (n: string) =>
    n.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, initials: getInitials(name) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className={`${styles.overlay} ${darkMode ? styles.overlayDark : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${styles.modal} ${darkMode ? styles.modalDark : ""}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.header}>
          <div className={`${styles.avatarLg} ${darkMode ? styles.avatarDark : ""}`}>
            {getInitials(name)}
          </div>
          <div>
            <h2 className={styles.title}>Profile Settings</h2>
            <p className={styles.subtitle}>Manage your account details</p>
          </div>
        </div>

        <div className={styles.sectionLabel}>Account Info</div>
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label className={styles.label}>Display name</label>
            <input
              type="text"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@olympus.com"
            />
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: "20px" }}>Change Password</div>
          <div className={styles.field}>
            <label className={styles.label}>Current password</label>
            <input
              type="password"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>New password</label>
            <input
              type="password"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}