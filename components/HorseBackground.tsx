const horses = [
  { top: "5%",  left: "2%",  size: "2.5rem", rotate: 10,  opacity: 0.18 },
  { top: "12%", left: "88%", size: "3rem",   rotate: -15, opacity: 0.15 },
  { top: "25%", left: "5%",  size: "2rem",   rotate: 5,   opacity: 0.2  },
  { top: "30%", left: "92%", size: "2.2rem", rotate: -8,  opacity: 0.18 },
  { top: "45%", left: "1%",  size: "3.5rem", rotate: 12,  opacity: 0.12 },
  { top: "50%", left: "90%", size: "2.8rem", rotate: -20, opacity: 0.16 },
  { top: "62%", left: "7%",  size: "2rem",   rotate: -5,  opacity: 0.2  },
  { top: "68%", left: "85%", size: "3rem",   rotate: 8,   opacity: 0.14 },
  { top: "78%", left: "3%",  size: "2.5rem", rotate: -10, opacity: 0.18 },
  { top: "82%", left: "91%", size: "2rem",   rotate: 15,  opacity: 0.2  },
  { top: "90%", left: "10%", size: "3rem",   rotate: -6,  opacity: 0.15 },
  { top: "92%", left: "80%", size: "2.5rem", rotate: 10,  opacity: 0.17 },
  { top: "8%",  left: "45%", size: "1.8rem", rotate: -12, opacity: 0.1  },
  { top: "55%", left: "48%", size: "2rem",   rotate: 7,   opacity: 0.08 },
  { top: "38%", left: "18%", size: "1.6rem", rotate: 20,  opacity: 0.12 },
  { top: "72%", left: "72%", size: "1.8rem", rotate: -18, opacity: 0.13 },
];

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
      {horses.map((h, i) => (
        <img
          key={i}
          src="/srf-horse.svg"
          alt=""
          style={{
            position: "absolute",
            top: h.top,
            left: h.left,
            width: h.size,
            opacity: h.opacity,
            transform: `rotate(${h.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
