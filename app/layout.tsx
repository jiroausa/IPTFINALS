export const metadata = {
  title: "AskGreekGodsBot",
  description: "Greek mythology assistant with FastAPI backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
