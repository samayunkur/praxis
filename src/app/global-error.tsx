"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body style={{ background: "#030712", color: "#fff", fontFamily: "system-ui", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚗️</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>エラーが発生しました</h2>
          <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>申し訳ありません。予期せぬエラーが発生しました。</p>
          <button
            onClick={reset}
            style={{ padding: "0.75rem 2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontSize: "1rem" }}
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
