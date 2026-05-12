"use client";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const getInitials = (n: string) =>
    n.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setError("");
    setSaving(true);
    try {
      // Save display name to Firebase Auth so it persists after logout
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      onSave({ name: name.trim(), email: user.email, initials: getInitials(name.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
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
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              placeholder="Your name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
              value={user.email}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button
            type="submit"
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
            disabled={saving}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}