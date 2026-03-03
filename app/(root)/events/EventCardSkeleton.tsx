// app/(root)/events/EventCardSkeleton.tsx
export default function EventCardSkeleton() {
  return (
    <div>
      {/* Banner skeleton */}
      <div
        className="animate-pulse"
        style={{
          aspectRatio: "16 / 10",
          background: "#efefe8",
          borderRadius: "6px",
          marginBottom: "16px",
        }}
      />
      {/* Content skeleton */}
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
        <div
          className="animate-pulse"
          style={{
            height: "10px",
            width: "45%",
            background: "#f5f5f0",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}