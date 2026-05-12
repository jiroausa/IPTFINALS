"use client";
import styles from "./ChatHistory.module.css";

export type HistorySession = {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
};

interface ChatHistoryProps {
  sessions: HistorySession[];
  activeId: string | null;
  darkMode?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ChatHistory({ sessions, activeId, darkMode, onSelect, onNew, onDelete }: ChatHistoryProps) {
  return (
    <div className={`${styles.sidebar} ${darkMode ? styles.sidebarDark : ""}`}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>History</span>
        <button className={`${styles.newBtn} ${darkMode ? styles.newBtnDark : ""}`} onClick={onNew} title="New chat">
          ＋
        </button>
      </div>

      <div className={styles.sessionList}>
        {sessions.length === 0 && (
          <p className={styles.empty}>No conversations yet.<br />Ask the gods something!</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`${styles.sessionItem} ${activeId === s.id ? styles.sessionActive : ""} ${darkMode ? styles.sessionItemDark : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <div className={styles.sessionMeta}>
              <span className={styles.sessionTitle}>{s.title}</span>
              <span className={styles.sessionTime}>{timeAgo(s.timestamp)}</span>
            </div>
            <p className={styles.sessionPreview}>{s.preview}</p>
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
              title="Delete"
              aria-label="Delete session"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}