"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Profilemenu.module.css";
import type { User } from "./AuthModal";

interface ProfileMenuProps {
  user: User;
  darkMode?: boolean;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export default function ProfileMenu({ user, darkMode, onLogout, onOpenSettings }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={`${styles.avatar} ${darkMode ? styles.avatarDark : ""}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="Profile menu"
        title={user.name}
      >
        {user.initials}
      </button>

      {open && (
        <div className={`${styles.dropdown} ${darkMode ? styles.dropdownDark : ""}`}>
          <div className={styles.dropdownHeader}>
            <div className={`${styles.avatarLg} ${darkMode ? styles.avatarDark : ""}`}>
              {user.initials}
            </div>
            <div>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <button
            className={`${styles.menuItem} ${darkMode ? styles.menuItemDark : ""}`}
            onClick={() => { onOpenSettings(); setOpen(false); }}
          >
            <span className={styles.menuIcon}>⚙️</span> Profile Settings
          </button>
          <button
            className={`${styles.menuItem} ${styles.menuItemDanger} ${darkMode ? styles.menuItemDark : ""}`}
            onClick={() => { onLogout(); setOpen(false); }}
          >
            <span className={styles.menuIcon}>🚪</span> Log out
          </button>
        </div>
      )}
    </div>
  );
}