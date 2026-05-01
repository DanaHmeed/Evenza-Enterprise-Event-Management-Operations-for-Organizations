export default function MyTicketsLoading() {
  return (
    <div style={{ background: "#fafaf8", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      {/* Dark header band */}
      <div style={{ background: "#1a1a2e", height: "180px" }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px 80px" }}>
        {/* Header card skeleton */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e0",
            borderRadius: "6px",
            marginTop: "-80px",
            position: "relative",
            zIndex: 1,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#f0f0ec" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ width: "120px", height: "20px", borderRadius: "4px", background: "#f0f0ec" }} />
            <div style={{ width: "200px", height: "13px", borderRadius: "4px", background: "#f0f0ec" }} />
          </div>
        </div>

        {/* Card skeletons */}
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #e5e5e0",
                borderRadius: "6px",
                overflow: "hidden",
                display: "flex",
                height: "128px",
              }}
            >
              <div style={{ width: "128px", background: "#f0f0ec", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ width: "60%", height: "16px", borderRadius: "4px", background: "#f0f0ec" }} />
                <div style={{ width: "40%", height: "12px", borderRadius: "4px", background: "#f0f0ec" }} />
                <div style={{ width: "30%", height: "12px", borderRadius: "4px", background: "#f0f0ec" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        div[style*="background: #f0f0ec"] { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
