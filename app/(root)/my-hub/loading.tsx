// app/(root)/my-hub/loading.tsx
const t = {
  bg: "#fafaf8",
  surface: "#ffffff",
  borderLight: "#ebebea",
  sans: "'DM Sans', sans-serif",
};

export default function Loading() {
  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: t.sans }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 32px" }}>
        <div
          style={{
            paddingBottom: "28px",
            borderBottom: `1px solid ${t.borderLight}`,
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              height: "22px",
              width: "240px",
              background: t.borderLight,
              borderRadius: "4px",
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              height: "13px",
              width: "180px",
              background: t.borderLight,
              borderRadius: "4px",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: t.surface,
                border: `1px solid ${t.borderLight}`,
                borderRadius: "8px",
                height: "72px",
              }}
            />
          ))}
        </div>

        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              background: t.surface,
              border: `1px solid ${t.borderLight}`,
              borderRadius: "8px",
              height: "72px",
              marginBottom: "6px",
            }}
          />
        ))}
      </div>
    </div>
  );
}