"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import QuickActions from "@/components/QuickActions";
import ChatBox from "@/components/ChatBox";
import AuthModal, { type User } from "@/components/AuthModal";
import ProfileMenu from "@/components/ProfileMenu";
import ProfileSettings from "@/components/ProfileSettings";
import ChatHistory, { type HistorySession } from "@/components/ChatHistory";
import styles from "./page.module.css";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type Session = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
};

export default function HomePage() {
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  const historyItems: HistorySession[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    preview: s.messages[0]?.text ?? "",
    timestamp: s.timestamp,
  }));

  // ── Load sessions from Firestore when user logs in ──
  const loadSessions = async (email: string) => {
    try {
      const q = query(
        collection(db, "users", email, "sessions"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const loaded: Session[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          messages: data.messages,
          timestamp: data.timestamp?.toDate?.() ?? new Date(),
        };
      });
      setSessions(loaded);
      if (loaded.length > 0) setActiveSessionId(loaded[0].id);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  // ── Save a single session to Firestore ──
  const saveSession = async (email: string, session: Session) => {
    try {
      await setDoc(doc(db, "users", email, "sessions", session.id), {
        title: session.title,
        messages: session.messages,
        timestamp: session.timestamp,
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const createNewSession = () => {
    const id = Date.now().toString();
    const newSession: Session = {
      id,
      title: "New conversation",
      messages: [],
      timestamp: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
  };

  const ensureActiveSession = (): string => {
    if (activeSessionId && sessions.find((s) => s.id === activeSessionId)) {
      return activeSessionId;
    }
    const id = Date.now().toString();
    const newSession: Session = {
      id,
      title: "New conversation",
      messages: [],
      timestamp: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend) return;

    const sessionId = ensureActiveSession();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
    };

    let updatedSession: Session | null = null;

    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id !== sessionId) return s;
        const isFirst = s.messages.length === 0;
        const updated = {
          ...s,
          messages: [...s.messages, userMsg],
          title: isFirst
            ? textToSend.slice(0, 36) + (textToSend.length > 36 ? "…" : "")
            : s.title,
          timestamp: new Date(),
        };
        updatedSession = updated;
        return updated;
      });
      return next;
    });
    setInput("");

    try {
      const res = await axios.post("https://backend-jb1z.onrender.com/ask", {
        message: textToSend,
      });
      const botMsg: Message = {
        id: Date.now().toString() + "_b",
        text: res.data.response,
        sender: "bot",
      };

      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updated = { ...s, messages: [...s.messages, botMsg] };
          updatedSession = updated;
          return updated;
        });
        // Save to Firestore after bot reply
        if (user && updatedSession) saveSession(user.email, updatedSession);
        return next;
      });

      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch {
      const errMsg: Message = {
        id: Date.now().toString() + "_err",
        text: "⚠️ Cannot connect to server",
        sender: "bot",
      };
      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updated = { ...s, messages: [...s.messages, errMsg] };
          if (user) saveSession(user.email, updated);
          return updated;
        });
        return next;
      });
    }
  };

  const deleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.email, "sessions", id));
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }
  };

  const handleLogin = async (u: User) => {
    setShowAuth(false);
    setUser(u);
    await loadSessions(u.email);
  };

  const handleLogout = () => {
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
  };

  const quickActions = [
    "Who is Zeus?",
    "Who is Hades' wife?",
    "Zeus vs Poseidon",
    "Show power ranking",
    "What is Apollo god of?",
  ];

  return (
    <main className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      {user && (
        <ChatHistory
          sessions={historyItems}
          activeId={activeSessionId}
          darkMode={darkMode}
          onSelect={setActiveSessionId}
          onNew={createNewSession}
          onDelete={deleteSession}
        />
      )}

      <div className={styles.mainArea}>
        <div className={styles.heroBanner}>
          <div className={styles.header}>
            {user ? (
              <ProfileMenu
                user={user}
                darkMode={darkMode}
                onLogout={handleLogout}
                onOpenSettings={() => setShowSettings(true)}
              />
            ) : (
              <button
                className={`${styles.loginBtn} ${darkMode ? styles.loginBtnDark : ""}`}
                onClick={() => setShowAuth(true)}
              >
                <span className={styles.loginBtnIcon}>⚡</span>
                <span className={styles.loginBtnText}>Log In</span>
              </button>
            )}

            <div className={styles.toggleSwitch} onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              <div className={`${styles.toggleThumb} ${darkMode ? styles.active : ""}`}>
                {darkMode ? "🌙" : "☀️"}
              </div>
            </div>
          </div>

          <div className={styles.heroContent}>
            <p className={styles.titleEyebrow}>Oracle of the Ancients</p>
            <h1 className={styles.title}>🏛️ AskGreekGodsBot</h1>
            <p className={styles.heroSubtitle}>
              Seek wisdom from the gods of Olympus — ask anything about myth, legend, and divine power.
            </p>
            <div className={styles.ornament}>
              <span className={styles.ornamentLine} />
              ✦
              <span className={styles.ornamentLine} />
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <QuickActions
            actions={quickActions}
            darkMode={darkMode}
            onClick={(q: string | undefined) => sendMessage(q)}
          />
          <ChatBox ref={listRef} messages={messages} darkMode={darkMode} />
        </div>

        <div className={styles.inputWrapper}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Ask of the gods..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
            />
            <button onClick={() => sendMessage()} className={styles.button}>
              Consult
            </button>
          </div>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          darkMode={darkMode}
        />
      )}

      {showSettings && user && (
        <ProfileSettings
          user={user}
          darkMode={darkMode}
          onClose={() => setShowSettings(false)}
          onSave={(updated) => { setUser(updated); setShowSettings(false); }}
        />
      )}
    </main>
  );
}