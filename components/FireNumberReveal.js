"use client";

import { useState, useMemo } from "react";
import { AGE_FROM, AGE_TO } from "@/app/config";

export default function FireNumberReveal({ onNext, onStartMusic }) {
  const [lit, setLit] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.1 + Math.random() * 0.9,
        size: 6 + Math.random() * 14,
        drift: (Math.random() - 0.5) * 60,
      })),
    []
  );

  const handleClick = () => {
    if (lit) return;
    setLit(true);
    onStartMusic?.();
    window.setTimeout(() => setRevealed(true), 900);
  };

  return (
    <section className="fireStage">
      <div className="vignette" />

      {!lit && <p className="hint">tap the number</p>}

      <button
        className={`numberBtn ${lit ? "lit" : ""}`}
        onClick={handleClick}
        aria-label="Reveal new age"
      >
        <span className="numText">{revealed ? AGE_TO : AGE_FROM}</span>
        {lit && (
          <span className="flames" aria-hidden="true">
            {particles.map((p) => (
              <span
                key={p.id}
                className="flameBit"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  width: p.size,
                  height: p.size * 1.4,
                  "--drift": `${p.drift}px`,
                }}
              />
            ))}
          </span>
        )}
      </button>

      {revealed && (
        <div className="revealWrap">
          <p className="revealLine">another year of you. happy birthday.</p>
          <button className="nextBtn" onClick={onNext}>
            Continue
          </button>
        </div>
      )}

      <style jsx>{`
        .fireStage {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 40%, #12081a 0%, var(--navy-deep) 70%);
        }
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 55%, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
          pointer-events: none;
        }
        .hint {
          position: relative;
          z-index: 2;
          font-family: var(--font-hand);
          font-size: 1.4rem;
          color: var(--gold-soft);
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
          opacity: 0.85;
          animation: floatHint 2.6s ease-in-out infinite;
        }
        @keyframes floatHint {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .numberBtn {
          position: relative;
          z-index: 2;
          background: none;
          border: none;
          padding: 0;
          line-height: 1;
        }
        .numText {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: clamp(7rem, 32vw, 16rem);
          background: linear-gradient(180deg, var(--cream) 0%, var(--gold) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 26px rgba(207, 159, 63, 0.35));
          transition: filter 0.4s ease;
          display: inline-block;
        }
        .lit .numText {
          animation: charFlicker 0.9s ease forwards;
        }
        @keyframes charFlicker {
          0% {
            filter: drop-shadow(0 0 26px rgba(207, 159, 63, 0.35));
          }
          40% {
            background: linear-gradient(180deg, var(--fire-2) 0%, var(--fire-1) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            filter: drop-shadow(0 0 46px rgba(255, 122, 41, 0.8));
          }
          100% {
            background: linear-gradient(180deg, var(--cream) 0%, var(--gold) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            filter: drop-shadow(0 0 26px rgba(207, 159, 63, 0.35));
          }
        }
        .flames {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 10%;
          height: 0;
        }
        .flameBit {
          position: absolute;
          bottom: 0;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          background: radial-gradient(circle at 50% 80%, var(--fire-2) 0%, var(--fire-1) 55%, transparent 100%);
          opacity: 0;
          animation-name: riseFlicker;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        @keyframes riseFlicker {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.4);
          }
          15% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(var(--drift), -220px) scale(1.15);
          }
        }
        .revealWrap {
          position: relative;
          z-index: 2;
          margin-top: 1.75rem;
          text-align: center;
          animation: floatIn 0.7s ease both;
        }
        .revealLine {
          font-family: var(--font-hand);
          font-size: 1.4rem;
          color: var(--cream-dim);
          margin: 0 0 1.75rem;
        }
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nextBtn {
          position: static;
          transform: none;
        }
      `}</style>
    </section>
  );
}
