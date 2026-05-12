export const metadata = { title: "PropAnalyzer", description: "AI-powered rental analysis for realtors" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
