"use client";

import { useRef, useState } from "react";
import { NICKNAMES, PHOTOS } from "@/app/config";

// Which photos show on the board, in order. The LAST one in this list renders
// on top of the others when the page first loads.
const SELECTED_NUMBERS = [18, 19, 23, 24, 27, 4];
const FEATURED_NUMBER = 4; // shown bigger + on top

// Crop nudges per photo number, if a face ever gets cut off (see PhotoGallery.js)
const PHOTO_SETTINGS = {
  5: { focus: "center 20%" },
  6: { focus: "center 15%" },
};

const LAYOUT = [
  { x: 6, y: 8, rotate: -8 },
  { x: 48, y: 4, rotate: 6 },
  { x: 10, y: 48, rotate: 7 },
  { x: 54, y: 46, rotate: -6 },
  { x: 30, y: 16, rotate: -3 },
  { x: 30, y: 22, rotate: 2 }, // featured slot, centered-ish
];

const INITIAL = SELECTED_NUMBERS.map((num, i) => {
  const pos = LAYOUT[i % LAYOUT.length];
  const isFeatured = num === FEATURED_NUMBER;
  return {
    id: i,
    num,
    src: PHOTOS[num - 1],
    caption: NICKNAMES[i % NICKNAMES.length],
    x: pos.x,
    y: pos.y,
    rotate: isFeatured ? 0 : pos.rotate,
    heart: i % 3 !== 2,
    focus: (PHOTO_SETTINGS[num] || {}).focus || "center",
    big: isFeatured,
  };
});

export default function PolaroidBoard({ onNext }) {
  const [cards, setCards] = useState(INITIAL);
  const boardRef = useRef(null);
  const dragRef = useRef(null);

  const startDrag = (e, id) => {
    const board = boardRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    dragRef.current = {
      id,
      startX: point.clientX,
      startY: point.clientY,
      board,
    };
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag, { passive: false });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);
  };

  const onDrag = (e) => {
    if (!dragRef.current) return;
    e.preventDefault?.();
    const point = e.touches ? e.touches[0] : e;
    const { id, board } = dragRef.current;
    const dxPct = ((point.clientX - dragRef.current.startX) / board.width) * 100;
    const dyPct = ((point.clientY - dragRef.current.startY) / board.height) * 100;

    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              x: clamp(c.x + dxPct, -2, 82),
              y: clamp(c.y + dyPct, -2, 80),
            }
          : c
      )
    );
    dragRef.current.startX = point.clientX;
    dragRef.current.startY = point.clientY;
  };

  const endDrag = () => {
    dragRef.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("touchmove", onDrag);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchend", endDrag);
  };

  const bringToFront = (id) => {
    setCards((prev) => [...prev.filter((c) => c.id !== id), prev.find((c) => c.id === id)]);
  };

  return (
    <section className="boardStage" ref={boardRef}>
      <p className="hint">drag the polaroids around</p>
      {cards.map((c) => (
        <div
          key={c.id}
          className={`polaroid ${c.big ? "big" : ""}`}
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            transform: `rotate(${c.rotate}deg)`,
          }}
          onMouseDown={(e) => {
            bringToFront(c.id);
            startDrag(e, c.id);
          }}
          onTouchStart={(e) => {
            bringToFront(c.id);
            startDrag(e, c.id);
          }}
        >
          {c.heart && <span className="heart">❤️</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src} alt="" draggable={false} style={{ objectPosition: c.focus }} />
          <p className="caption">{c.caption}</p>
        </div>
      ))}

      <button className="nextBtn" onClick={onNext}>
        Continue
      </button>

      <style jsx>{`
        .boardStage {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, #ece0c6 0%, var(--cream) 60%);
          overflow: hidden;
          touch-action: none;
        }
        .hint {
          position: absolute;
          top: 6%;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-hand);
          font-size: 1.2rem;
          color: #6b5a52;
          z-index: 6;
        }
        .polaroid {
          position: absolute;
          width: clamp(120px, 24vw, 180px);
          padding: 10px 10px 26px;
          background: #fffdf8;
          box-shadow: 0 14px 26px rgba(0, 0, 0, 0.22);
          cursor: grab;
          user-select: none;
          touch-action: none;
        }
        .polaroid.big {
          width: clamp(190px, 38vw, 300px);
          box-shadow: 0 22px 44px rgba(0, 0, 0, 0.32);
        }
        .polaroid img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }
        .caption {
          font-family: var(--font-hand);
          font-size: 1.15rem;
          color: var(--maroon);
          text-align: center;
          margin: 8px 0 0;
        }
        .polaroid.big .caption {
          font-size: 1.5rem;
        }
        .heart {
          position: absolute;
          top: -12px;
          right: -8px;
          font-size: 1.4rem;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
        }
        .nextBtn {
          color: var(--ink);
          border-color: var(--maroon);
          background: rgba(107, 30, 38, 0.06);
        }
        .nextBtn:hover {
          background: rgba(107, 30, 38, 0.14);
        }
      `}</style>
    </section>
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
