// app/(root)/events/[id]/EventDetailSkeleton.tsx
export default function EventDetailSkeleton() {
  return (
    <div style={{ background: "#fafaf8", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      {/* Banner skeleton */}
      <div
        className="animate-pulse"
        style={{
          width: "100%",
          aspectRatio: "21 / 8",
          maxHeight: "420px",
          minHeight: "260px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      {/* Content skeleton */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "48px 48px 96px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "56px",
        }}
      >
        {/* Left column */}
        <div>
          {/* Organizer row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #f0f0ec" }}>
            <div className="animate-pulse" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#efefe8" }} />
            <div>
              <div className="animate-pulse" style={{ width: "60px", height: "8px", background: "#efefe8", borderRadius: "2px", marginBottom: "6px" }} />
              <div className="animate-pulse" style={{ width: "120px", height: "12px", background: "#efefe8", borderRadius: "2px" }} />
            </div>
          </div>

          {/* Info strip */}
          <div style={{ display: "flex", gap: "32px", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="animate-pulse" style={{ width: "52px", height: "52px", background: "#efefe8", borderRadius: "4px" }} />
              <div>
                <div className="animate-pulse" style={{ width: "180px", height: "12px", background: "#efefe8", borderRadius: "2px", marginBottom: "6px" }} />
                <div className="animate-pulse" style={{ width: "120px", height: "10px", background: "#f5f5f0", borderRadius: "2px" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="animate-pulse" style={{ width: "44px", height: "44px", background: "#efefe8", borderRadius: "4px" }} />
              <div>
                <div className="animate-pulse" style={{ width: "140px", height: "12px", background: "#efefe8", borderRadius: "2px" }} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "48px" }}>
            <div className="animate-pulse" style={{ width: "180px", height: "18px", background: "#efefe8", borderRadius: "3px", marginBottom: "20px" }} />
            {[100, 95, 90, 80, 60].map((w, i) => (
              <div key={i} className="animate-pulse" style={{ width: `${w}%`, height: "12px", background: "#f5f5f0", borderRadius: "2px", marginBottom: "10px" }} />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <div
            className="animate-pulse"
            style={{
              background: "#fff",
              border: "1px solid #e5e5e0",
              borderRadius: "6px",
              padding: "28px",
              height: "380px",
            }}
          />
        </div>
      </div>
    </div>
  );
}