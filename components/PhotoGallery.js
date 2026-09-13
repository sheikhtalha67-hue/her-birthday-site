"use client";

import { useMemo, useState } from "react";
import { HER_NAME, PHOTOS } from "@/app/config";

// Per-photo crop nudges — keyed by index in PHOTOS (0 = photo1.jpg, etc.).
const PHOTO_SETTINGS = {
  0: { focus: "center 38%" },
  1: { focus: "center 24%" },
  2: { focus: "center 28%" },
  3: { focus: "32% 22%" },
  4: { focus: "center 20%" },
  5: { focus: "center 12%" },
  6: { focus: "center 32%" },
  10: { focus: "center 15%" },
  11: { focus: "center 22%" },
  12: { focus: "center 15%" },
  13: { focus: "center 18%" },
  14: { focus: "center 25%" },
  15: { focus: "center 32%" },
  16: { focus: "center 15%" },
  17: { focus: "center 32%" },
  19: { focus: "center 70%" },
  20: { focus: "center 32%" },
  21: { focus: "center 35%" },
  22: { focus: "center 22%" },
  23: { focus: "center 38%" },
  24: { focus: "center 40%" },
  25: { focus: "center 20%" },
  26: { focus: "center 25%" },
  27: { focus: "center 12%" },
};

// ---- Wheel geometry (one "unit" of the repeating path) ----
// trail-before -> open ring -> trail-after, all in one continuous ribbon.
const WHEEL_COUNT = 10; // photos forming the ring outline
const TRAIL_BEFORE_COUNT = 9; // photos leading into the ring
const TRAIL_AFTER_COUNT = PHOTOS.length - WHEEL_COUNT - TRAIL_BEFORE_COUNT; // rest continue the trail

const PHOTO_SIZE = 68; // px
const SPACING = 108; // px between trail photo centers
const RX = 168; // ring radius (horizontal)
const RY = 138; // ring radius (vertical)
const BASELINE_Y = 300; // trail y-level, px, within the unit
const RING_GAP_DEG = 60; // how wide the lower-right opening is
const BAND_HEIGHT = 440; // must comfortably fit the ring above BASELINE_Y

function ringPoint(cx, cy, j, count) {
  // 0deg = top, clockwise. Gap is centered at 135deg (lower-right).
  const gapCenter = 135;
  const startAngle = gapCenter + RING_GAP_DEG / 2; // just past the opening
  const sweep = 360 - RING_GAP_DEG;
  const deg = startAngle + (j / Math.max(count - 1, 1)) * sweep;
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + RX * Math.sin(rad),
    y: cy - RY * Math.cos(rad),
  };
}

export default function PhotoGallery({ onNext }) {
  const [active, setActive] = useState(null);

  const { items, unitWidth } = useMemo(() => {
    const wheelCenterX = TRAIL_BEFORE_COUNT * SPACING + RX + 70;
    const wheelCenterY = BASELINE_Y - RY;
    const trailAfterStartX = wheelCenterX + RX + 70;

    const out = [];

    for (let k = 0; k < TRAIL_BEFORE_COUNT; k++) {
      out.push({ x: k * SPACING, y: BASELINE_Y, srcIndex: k });
    }
    for (let k = 0; k < WHEEL_COUNT; k++) {
      const p = ringPoint(wheelCenterX, wheelCenterY, k, WHEEL_COUNT);
      out.push({ x: p.x, y: p.y, srcIndex: TRAIL_BEFORE_COUNT + k });
    }
    for (let k = 0; k < TRAIL_AFTER_COUNT; k++) {
      out.push({
        x: trailAfterStartX + k * SPACING,
        y: BASELINE_Y,
        srcIndex: TRAIL_BEFORE_COUNT + WHEEL_COUNT + k,
      });
    }

    const withPhotos = out.map((pt, idx) => {
      const src = PHOTOS[pt.srcIndex];
      const settings = PHOTO_SETTINGS[pt.srcIndex] || {};
      return {
        ...pt,
        idx,
        src,
        rotate: ((idx * 47) % 19) - 9,
        focus: settings.focus || "center",
      };
    });

    const lastX = trailAfterStartX + (TRAIL_AFTER_COUNT - 1) * SPACING + PHOTO_SIZE + 60;

    return { items: withPhotos, unitWidth: lastX };
  }, []);

  return (
    <section className="galleryStage">
      <div className="heading">
        <h2 className="hTitle">
          Happy Birthday
          <br />
          <span className="hName">{HER_NAME}</span>
        </h2>
        <p className="hSub">May this year bring you closer to everything you&rsquo;re chasing.</p>
      </div>

      <div className="trailBand">
        <div className="track" style={{ width: `${unitWidth * 2}px` }}>
          {[0, 1].map((copyIdx) => (
            <div
              key={copyIdx}
              className="unit"
              style={{ left: `${copyIdx * unitWidth}px`, width: `${unitWidth}px` }}
            >
              {items.map((item) => {
                const key = `${copyIdx}-${item.idx}`;
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    className={`photoItem ${isActive ? "active" : ""}`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
                    }}
                    onMouseEnter={() => setActive(key)}
                    onMouseLeave={() => setActive((c) => (c === key ? null : c))}
                    onClick={() => setActive((c) => (c === key ? null : key))}
                    aria-label="Photo"
                    tabIndex={-1}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" style={{ objectPosition: item.focus }} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button className="nextBtn" onClick={onNext}>
        Continue
      </button>

      <style jsx>{`
        .galleryStage {
          position: absolute;
          inset: 0;
          background: var(--cream);
          overflow: hidden;
        }
        .heading {
          position: absolute;
          top: 6%;
          left: 6%;
          z-index: 4;
          max-width: 60%;
        }
        .hTitle {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(1.9rem, 6vw, 3rem);
          color: var(--ink);
          margin: 0;
          line-height: 1.05;
        }
        .hName {
          color: var(--maroon);
        }
        .hSub {
          font-family: var(--font-body);
          color: #6b5a52;
          font-size: 0.95rem;
          margin-top: 0.6rem;
          max-width: 30ch;
        }

        .trailBand {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: ${BAND_HEIGHT}px;
          transform: translateY(-52%);
          overflow: hidden;
        }
        .track {
          position: relative;
          height: 100%;
          animation: driftRight 70s linear infinite;
          will-change: transform;
        }
        @keyframes driftRight {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0%);
          }
        }
        .unit {
          position: absolute;
          top: 0;
          bottom: 0;
        }
        .photoItem {
          position: absolute;
          width: ${PHOTO_SIZE}px;
          padding: 0;
          border: none;
          background: none;
          border-radius: 4px;
          cursor: pointer;
          scale: 1;
          transition: scale 0.4s ease, z-index 0s;
        }
        .photoItem.active {
          scale: 1.14;
          z-index: 20;
        }
        .photoItem img {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
          filter: grayscale(1);
          transition: filter 0.5s ease, box-shadow 0.4s ease;
        }
        .photoItem.active img {
          filter: grayscale(0);
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
        }

        .nextBtn {
          color: var(--ink);
          border-color: var(--maroon);
          background: rgba(107, 30, 38, 0.06);
        }
        .nextBtn:hover {
          background: rgba(107, 30, 38, 0.14);
        }

        @media (max-width: 800px) {
          .trailBand {
            transform: translateY(-52%) scale(0.62);
            transform-origin: left center;
          }
        }
      `}</style>
    </section>
  );
}
