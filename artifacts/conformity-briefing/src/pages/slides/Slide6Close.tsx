export default function Slide6Close() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#1C2541",
        fontFamily: "'Inter', sans-serif",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Decorative background rings */}
      <div
        style={{
          position: "absolute",
          top: "-12vw",
          right: "-8vw",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          border: "0.15vw solid rgba(255,255,255,0.07)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-8vw",
          right: "-4vw",
          width: "32vw",
          height: "32vw",
          borderRadius: "50%",
          border: "0.15vw solid rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10vw",
          left: "-6vw",
          width: "28vw",
          height: "28vw",
          borderRadius: "50%",
          border: "0.15vw solid rgba(249,115,22,0.12)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "10vh 10vw",
          boxSizing: "border-box",
        }}
      >
        {/* Orange accent mark */}
        <div
          style={{
            width: "3vw",
            height: "0.4vh",
            backgroundColor: "#F97316",
            marginBottom: "4vh",
          }}
        />

        <h2
          style={{
            fontSize: "5vw",
            fontWeight: 800,
            margin: "0 0 3vh 0",
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            maxWidth: "50vw",
            textWrap: "balance",
          }}
        >
          See it working on your products
        </h2>

        <p
          style={{
            fontSize: "1.6vw",
            color: "rgba(255,255,255,0.65)",
            maxWidth: "44vw",
            margin: "0 0 8vh 0",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          The platform is live with a fully seeded demo assessment — NovaGuard Smart Home Hub, grade D, three open blockers, active Art 14 incident tracks, and a finalized board briefing ready to review.
        </p>

        {/* Three next-step items */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "3vw",
            maxWidth: "58vw",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#F97316", textTransform: "uppercase", letterSpacing: "0.12em" }}>Demo</div>
            <div style={{ fontSize: "1.15vw", fontWeight: 600, lineHeight: 1.3 }}>Walk through the assessment workbench live</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#F97316", textTransform: "uppercase", letterSpacing: "0.12em" }}>Pilot</div>
            <div style={{ fontSize: "1.15vw", fontWeight: 600, lineHeight: 1.3 }}>Onboard a real product from your portfolio</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#F97316", textTransform: "uppercase", letterSpacing: "0.12em" }}>Report</div>
            <div style={{ fontSize: "1.15vw", fontWeight: 600, lineHeight: 1.3 }}>Generate a board briefing for the pilot assessment</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: "8vh",
          padding: "0 8vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "0.1vh solid rgba(255,255,255,0.1)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.8vw",
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        <span>OXOT Conformity</span>
        <span>06</span>
      </div>
    </div>
  );
}
