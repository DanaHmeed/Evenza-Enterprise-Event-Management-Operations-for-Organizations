// app/(root)/events/EventsLoadingSkeleton.tsx
export default function EventsLoadingSkeleton() {
  return (
    <section
      style={{
        minHeight: "100vh",
        background: "#fafaf8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "80px 48px 48px",
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: "12px", marginBottom: "24px" }}
          >
            <div
              className="animate-pulse"
              style={{ width: "32px", height: "2px", background: "#f0f0ec" }}
            />
            <div
              className="animate-pulse"
              style={{
                width: "60px",
                height: "10px",
                background: "#f0f0ec",
                borderRadius: "2px",
              }}
            />
          </div>
          <div
            className="animate-pulse"
            style={{
              height: "40px",
              width: "280px",
              background: "#f0f0ec",
              borderRadius: "4px",
              marginBottom: "12px",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "16px",
              width: "360px",
              background: "#f5f5f0",
              borderRadius: "3px",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              marginTop: "40px",
              height: "44px",
              width: "420px",
              maxWidth: "100%",
              background: "#f5f5f0",
              borderRadius: "4px",
              border: "1px solid #eee",
            }}
          />
        </div>
      </div>
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "48px 48px 96px",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "48px 32px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div
                className="animate-pulse"
                style={{
                  aspectRatio: "16 / 10",
                  background: "#efefe8",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  className="animate-pulse"
                  style={{
                    height: "10px",
                    width: "80px",
                    background: "#efefe8",
                    borderRadius: "2px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "14px",
                    width: "85%",
                    background: "#efefe8",
                    borderRadius: "2px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "10px",
                    width: "60%",
                    background: "#f5f5f0",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}