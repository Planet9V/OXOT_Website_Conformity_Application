const base = import.meta.env.BASE_URL;

export default function Slide1Cover() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#F8F9FB",
        fontFamily: "'Inter', sans-serif",
        color: "#333333",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero image strip */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <img
          src={`${base}hero.jpg`}
          crossOrigin="anonymous"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        {/* Gradient overlay — left side legible, right side visible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(28,37,65,0.97) 0%, rgba(28,37,65,0.88) 45%, rgba(28,37,65,0.55) 72%, rgba(28,37,65,0.25) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "6vh 8vw",
          boxSizing: "border-box",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1vw",
            }}
          >
            <div
              style={{
                width: "2.8vw",
                height: "2.8vw",
                borderRadius: "0.4vw",
                backgroundColor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.4vw",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              O
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.1vw",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                OXOT
              </div>
              <div
                style={{
                  fontSize: "0.75vw",
                  fontFamily: "'DM Mono', monospace",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                CONFORMITY
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.85vw",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.08em",
            }}
          >
            EXECUTIVE BRIEFING — AUGUST 2026
          </div>
        </div>

        {/* Main headline */}
        <div style={{ marginTop: "auto", marginBottom: "2vh" }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.9vw",
              color: "#F97316",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "2vh",
            }}
          >
            Product overview
          </div>
          <h1
            style={{
              fontSize: "5.5vw",
              fontWeight: 800,
              margin: 0,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: "58vw",
              textWrap: "balance",
            }}
          >
            The EU Regulatory<br />Compliance Workbench
          </h1>
          <p
            style={{
              fontSize: "1.6vw",
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
              margin: "2.5vh 0 0 0",
              maxWidth: "50vw",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            From obligation to evidence — CRA, AI Act, NIS2, and Machinery Regulation managed in one structured workbench.
          </p>
        </div>

        {/* Bottom metadata strip */}
        <div
          style={{
            borderTop: "0.1vh solid rgba(255,255,255,0.2)",
            paddingTop: "3vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "2vw",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6vh" }}>
            <span style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Regulations</span>
            <span style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>11 active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6vh" }}>
            <span style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Requirements mapped</span>
            <span style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>89 obligations</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6vh" }}>
            <span style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cross-reg themes</span>
            <span style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>15 themes</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6vh" }}>
            <span style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Shared mappings</span>
            <span style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>72 resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
