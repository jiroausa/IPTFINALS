"use client";
import { useState, useRef } from "react";
import axios from "axios";
import QuickActions from "@/components/QuickActions";
import ChatBox from "@/components/ChatBox";
import styles from "./page.module.css";
type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};
export default function HomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  try {
      // ✅ FIXED: Correct Axios URL
      const res = await axios.post("http://localhost:8000/ask", {
        message: textToSend,
      });
      const botMsg: Message = {
        id: Date.now().toString() + "_b",
        text: res.data.response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("Connection error:", error);
      const botErr: Message = {
        id: Date.now().toString() + "_err",
        text: "⚠️ Cannot connect to server",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botErr]);
    }
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
      <header className={styles.header}>
        <h1 className={styles.title}>🏛️ AskGreekGodsBot</h1>
        <div
          className={styles.toggleSwitch}
          onClick={() => setDarkMode(!darkMode)}
        >
          <div className={`${styles.toggleThumb} ${darkMode ? styles.active : ""}`}>
            {darkMode ? "🌙" : "☀️"}
          </div>
        </div>
      </header>
      <QuickActions
        actions={quickActions}
        darkMode={darkMode}
        onClick={(q: string | undefined) => sendMessage(q)}
      />
      <ChatBox ref={listRef} messages={messages} darkMode={darkMode} />
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Ask about any god..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className={`${styles.input} ${darkMode ? styles.inputDark : ""}`}
        />
        <button onClick={() => sendMessage()} className={styles.button}>
          Send
        </button>
      </div>
    </main>
  );
}