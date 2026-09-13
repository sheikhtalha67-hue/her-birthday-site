"use client";

import { useMemo } from "react";
import { HER_NAME } from "@/app/config";

const COLORS = ["#e8536b", "#cf9f3f", "#4a9d8e", "#e8cd8a", "#b5563f", "#8f6fae"];

export default function BirthdayBalloons({ onNext }) {
  const balloons = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: 3 + Math.random() * 94,
        delay: Math.random() * 1.2,
        duration: 7 + Math.random() * 5,
        size: 46 + Math.random() * 46,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  return (
    <section className="balloonStage">
      <div className="sky" />
      <div className="balloons" aria-hidden="true">
        {balloons.map((b) => (
          <span
            key={b.id}
            className="balloon"
            style={{
              left: `${b.left}%`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              width: b.size,
              height: b.size * 1.2,
              background: `radial-gradient(circle at 32% 28%, ${lighten(b.color)} 0%, ${b.color} 70%)`,
            }}
          />
        ))}
      </div>

      <div className="banner">
        <h1 className="title">
          Happy
          <br />
          Birthday
        </h1>
        <p className="subtitle">{HER_NAME}</p>
      </div>

      <button className="nextBtn" onClick={onNext}>
        Continue
      </button>

      <style jsx>{`
        .balloonStage {
          position: absolute;
          inset: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #1a0d16 0%, var(--navy-deep) 65%);
        }
        .balloons {
          position: absolute;
          inset: 0;
        }
        .balloon {
          position: absolute;
          bottom: -20%;
          border-radius: 50% 50% 50% 50% / 55% 55% 45% 45%;
          box-shadow: inset -6px -10px 18px rgba(0, 0, 0, 0.18);
          animation-name: drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          opacity: 0.92;
        }
        .balloon::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -70px;
          width: 1px;
          height: 70px;
          background: rgba(244, 233, 214, 0.25);
        }
        @keyframes drift {
          0% {
            transform: translateY(0) translateX(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-58vh) translateX(18px) rotate(3deg);
          }
          100% {
            transform: translateY(-118vh) translateX(-14px) rotate(-2deg);
          }
        }
        .banner {
          position: relative;
          z-index: 3;
          text-align: center;
        }
        .title {
          font-family: var(--font-display);
          font-weight: 800;
          font-style: italic;
          font-size: clamp(3.2rem, 12vw, 6.5rem);
          line-height: 1.02;
          margin: 0;
          color: var(--cream);
          text-shadow: 0 0 30px rgba(207, 159, 63, 0.3);
        }
        .subtitle {
          font-family: var(--font-hand);
          font-size: clamp(2rem, 7vw, 3.2rem);
          color: var(--gold);
          margin: 0.3rem 0 0;
        }
      `}</style>
    </section>
  );
}

function lighten(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 60);
  const g = Math.min(255, ((n >> 8) & 255) + 60);
  const b = Math.min(255, (n & 255) + 60);
  return `rgb(${r},${g},${b})`;
}
