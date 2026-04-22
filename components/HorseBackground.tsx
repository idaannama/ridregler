export default function HorseBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <img
        src="/srf-logo.svg"
        alt=""
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          opacity: 0.55,
        }}
      />
    </div>
  );
}
