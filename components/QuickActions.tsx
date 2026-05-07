"use client";

import styles from "./QuickActions.module.css";

interface Props {
  actions: string[];
  darkMode: boolean;
  onClick: (text: string) => void;
}

export default function QuickActions({ actions, darkMode, onClick }: Props) {
  return (
    <div className={styles.container}>
      {actions.map((a) => (
        <button
          key={a}
          onClick={() => onClick(a)}
          className={`${styles.button} ${darkMode ? styles.dark : ""}`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
