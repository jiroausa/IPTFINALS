"use client";

import { forwardRef } from "react";
import styles from "./ChatBox.module.css";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

interface Props {
  messages: Message[];
  darkMode: boolean;
}

const ChatBox = forwardRef<HTMLDivElement, Props>(({ messages, darkMode }, ref) => {
  return (
    <div ref={ref} className={styles.chatBox}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.message} ${
            msg.sender === "user" ? styles.user : styles.bot
          }`}
        >
          {msg.text.split("\n").map((line, i) => (
            <p key={i} className={darkMode ? styles.darkText : styles.text}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
});

ChatBox.displayName = "ChatBox";
export default ChatBox;
