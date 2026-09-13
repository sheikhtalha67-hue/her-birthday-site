"use client";

import { useEffect, useState } from "react";
import { PHOTOS, HER_NAME } from "@/app/config";

const FLIP_MS = 900; // how long one page-turn takes — keep in sync with the CSS below

// Photos used across the sketchbook pages — pulled from your main PHOTOS list.
const P_SPREAD1_LEFT = PHOTOS[0];
const P_SPREAD1_RIGHT = [PHOTOS[1], PHOTOS[2], PHOTOS[3]];
const P_SPREAD2_LEFT = PHOTOS[4];
const P_SPREAD2_RIGHT = [PHOTOS[15], PHOTOS[22], PHOTOS[26]]; // photo16, photo23, photo27

export default function SketchbookIntro({ onNext }) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [page, setPage] = useState(0);
  const [fromPage, setFromPage] = useState(0);
  const [turning, setTurning] = useState(null); // null | "next" | "prev"

  const handleOpen = () => {
    if (opening || opened) return;
    setOpening(true);
    window.setTimeout(() => setOpened(true), 950);
  };

  const goNext = () => {
    if (turning) return; // ignore taps while a flip is already in progress
    if (page < PAGES_DATA.length - 1) {
      setFromPage(page);
      setTurning("next");
      setPage((p) => p + 1);
      window.setTimeout(() => setTurning(null), FLIP_MS);
    } else {
      onNext(); // last page — leave the book, move to the next section of the site
    }
  };

  const goPrev = () => {
    if (turning) return;
    if (page > 0) {
      setFromPage(page);
      setTurning("prev");
      setPage((p) => p - 1);
      window.setTimeout(() => setTurning(null), FLIP_MS);
    }
  };

  // Arrow keys, desktop
  useEffect(() => {
    if (!opened) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, page, turning]);

  // Swipe, mobile
  let touchStartX = null;
  const onTouchStart = (e) => {
    touchStartX = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (dx <= -50) goNext();
    else if (dx >= 50) goPrev();
  };

  const current = PAGES_DATA[page];
  const outgoing = PAGES_DATA[fromPage];
  const CurrentLeft = current.Left;
  const CurrentRight = current.Right;
  const OutgoingLeft = outgoing.Left;
  const OutgoingRight = outgoing.Right;
  const isLastPage = page === PAGES_DATA.length - 1;

  return (
    <section className="deskStage">
      {!opened && (
        <>
          <p className="hint">tap to open</p>
          <button
            className={`book ${opening ? "opening" : ""}`}
            onClick={handleOpen}
            aria-label="Open sketchbook"
          >
            <span className="spiral" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} />
              ))}
            </span>
            <span className="cover">
              <span className="sticker moon" aria-hidden="true">🌙</span>
              <span className="sticker cherry" aria-hidden="true">🍒</span>
              <span className="sticker flower" aria-hidden="true">🌸</span>
              <span className="sticker camera" aria-hidden="true">📷</span>
              <span className="titleWord">
                {"SKETCHBOOK".split("").map((ch, i) => (
                  <span className="letterTile" key={i} style={{ "--i": i }}>
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </button>
        </>
      )}

      {opened && (
        <div className="bookWrap">
          <div className="bookInner" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="pageSlot slotLeft" onClick={goPrev} aria-label="Previous page">
              <CurrentLeft />
            </div>
            <div className="spineLine" aria-hidden="true" />
            <div className="pageSlot slotRight" onClick={goNext} aria-label="Next page">
              <CurrentRight />
            </div>

            {turning === "next" && (
              <div className="flipSheet hingeLeft">
                <div className="flipFace flipFront">
                  <OutgoingRight />
                </div>
                <div className="flipFace flipBack">
                  <div className="paperBack" />
                </div>
                <div className="flipShadow" />
              </div>
            )}
            {turning === "prev" && (
              <div className="flipSheet hingeRight">
                <div className="flipFace flipFront">
                  <OutgoingLeft />
                </div>
                <div className="flipFace flipBack">
                  <div className="paperBack" />
                </div>
                <div className="flipShadow" />
              </div>
            )}
          </div>

          <div className="navRow">
            {page > 0 && (
              <button className="backBtn" onClick={goPrev} aria-label="Previous page">
                &lsaquo; Back
              </button>
            )}
            <button className="nextBtn" onClick={goNext}>
              {isLastPage ? "Continue" : "Turn page \u203a"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .deskStage {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 30%, #140a1c 0%, var(--navy-deep) 75%);
        }
        .hint {
          position: absolute;
          left: 50%;
          top: 14%;
          transform: translateX(-50%);
          font-family: var(--font-hand);
          font-size: 1.3rem;
          color: var(--gold-soft);
          opacity: 0.85;
          margin: 0;
          white-space: nowrap;
        }
        .book {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(78vw, 340px);
          height: min(78vw, 440px);
          background: none;
          border: none;
          padding: 0;
          perspective: 1600px;
        }
        .spiral {
          position: absolute;
          left: -10px;
          top: 4%;
          bottom: 4%;
          width: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 3;
        }
        .spiral span {
          width: 20px;
          height: 20px;
          border: 3px solid var(--gold-soft);
          border-radius: 50%;
          background: transparent;
          box-shadow: inset 0 0 0 3px var(--navy-deep);
        }
        .cover {
          position: absolute;
          inset: 0;
          border-radius: 4px 10px 10px 4px;
          background: linear-gradient(155deg, #efe0be 0%, #e3cf9c 55%, #d8bd82 100%);
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 0, 0, 0.08);
          transform-origin: left center;
          transition: transform 0.95s cubic-bezier(0.65, 0, 0.35, 1);
          overflow: hidden;
        }
        .opening .cover {
          transform: rotateY(-150deg);
        }
        .sticker {
          position: absolute;
          font-size: 2.4rem;
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.25));
        }
        .moon {
          top: 8%;
          right: 12%;
          font-size: 3rem;
        }
        .cherry {
          top: 18%;
          left: 14%;
          font-size: 2.1rem;
          transform: rotate(-12deg);
        }
        .flower {
          bottom: 10%;
          left: 10%;
        }
        .camera {
          bottom: 30%;
          right: 14%;
          font-size: 3.2rem;
        }
        .titleWord {
          position: absolute;
          left: 50%;
          top: 42%;
          transform: translate(-50%, -50%) rotate(-2deg);
          display: flex;
          gap: 2px;
        }
        .letterTile {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(1rem, 3.6vw, 1.3rem);
          background: var(--maroon-deep);
          color: var(--cream);
          padding: 4px 3px;
          border: 1px solid rgba(244, 233, 214, 0.25);
          transform: rotate(calc((var(--i) - 5) * 1.4deg));
        }

        /* ---------------- the book itself ---------------- */
        .bookWrap {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.1rem;
        }
        .bookInner {
          position: relative;
          width: min(94vw, 800px);
          height: min(74vh, 460px);
          perspective: 2200px;
          filter: drop-shadow(0 28px 46px rgba(0, 0, 0, 0.55));
          animation: bookIn 0.5s ease both;
        }
        @keyframes bookIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .pageSlot {
          position: absolute;
          top: 0;
          bottom: 0;
          width: calc(50% - 7px);
          background: linear-gradient(155deg, #f2e9d6 0%, #e7dab8 100%);
          overflow: hidden;
          cursor: pointer;
        }
        .slotLeft {
          left: 0;
          border-radius: 6px 0 0 6px;
        }
        .slotRight {
          right: 0;
          border-radius: 0 6px 6px 0;
        }
        .spineLine {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 14px;
          transform: translateX(-50%);
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.22));
          z-index: 6;
          pointer-events: none;
        }

        /* ---------------- the turning page ---------------- */
        .flipSheet {
          position: absolute;
          top: 0;
          bottom: 0;
          width: calc(50% - 7px);
          transform-style: preserve-3d;
          z-index: 50;
          animation-duration: ${FLIP_MS}ms;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.4, 0.05, 0.2, 1);
          pointer-events: none;
        }
        .hingeLeft {
          left: 0;
          transform-origin: left center;
          animation-name: flipNext;
        }
        .hingeRight {
          right: 0;
          transform-origin: right center;
          animation-name: flipPrev;
        }
        @keyframes flipNext {
          0% {
            transform: translateZ(0) rotateY(0deg);
          }
          50% {
            transform: translateZ(60px) rotateY(-90deg);
          }
          100% {
            transform: translateZ(0) rotateY(-180deg);
          }
        }
        @keyframes flipPrev {
          0% {
            transform: translateZ(0) rotateY(0deg);
          }
          50% {
            transform: translateZ(60px) rotateY(90deg);
          }
          100% {
            transform: translateZ(0) rotateY(180deg);
          }
        }
        .flipFace {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          background: linear-gradient(155deg, #f2e9d6 0%, #e7dab8 100%);
        }
        .hingeLeft .flipFront {
          border-radius: 0 6px 6px 0;
        }
        .hingeRight .flipFront {
          border-radius: 6px 0 0 6px;
        }
        .flipBack {
          transform: rotateY(180deg);
        }
        .hingeLeft .flipBack {
          border-radius: 6px 0 0 6px;
        }
        .hingeRight .flipBack {
          border-radius: 0 6px 6px 0;
        }
        .paperBack {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
              100deg,
              rgba(0, 0, 0, 0.03) 0px,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 1px,
              transparent 5px
            ),
            linear-gradient(200deg, #ece0c2 0%, #dcc99e 60%, #cdb98c 100%);
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.18);
        }
        .flipShadow {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          opacity: 0;
          animation: shadowPulse ${FLIP_MS}ms cubic-bezier(0.4, 0.05, 0.2, 1) forwards;
        }
        @keyframes shadowPulse {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 0.38;
          }
        }

        /* ---------------- controls ---------------- */
        .navRow {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .backBtn {
          background: rgba(244, 233, 214, 0.1);
          border: 1px solid var(--gold-soft);
          color: var(--cream);
          padding: 12px 22px;
          border-radius: 999px;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: background 0.25s ease;
        }
        .backBtn:hover {
          background: rgba(244, 233, 214, 0.2);
        }
        .nextBtn {
          position: static;
          transform: none;
          color: var(--ink);
          border-color: var(--maroon);
          background: rgba(107, 30, 38, 0.08);
        }
        .nextBtn:hover {
          background: rgba(107, 30, 38, 0.18);
        }

        @media (max-width: 560px) {
          .bookInner {
            height: min(78vh, 560px);
          }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// Page halves — each is a standalone component so it can be
// rendered independently on either side of the spine, and
// reused as the "outgoing" face while a page is mid-flip.
// ============================================================

function Spread1Left() {
  return (
    <div className="page">
      <span className="tornCorner" aria-hidden="true" />
      <div className="quoteCard">
        You are the stars in my dark and cold nights — shining and unwavering.
      </div>
      <span className="snap tilt-a">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={P_SPREAD1_LEFT} alt="" />
      </span>
      <span className="stk butterfly" aria-hidden="true">🦋</span>
      <span className="stk hamster" aria-hidden="true">🐹</span>

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          padding: clamp(16px, 4vw, 30px);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.7rem;
          box-sizing: border-box;
        }
        .tornCorner {
          position: absolute;
          top: 0;
          left: 0;
          width: 46%;
          height: 40%;
          background: linear-gradient(135deg, #e8d9b8 0%, #d9c39a 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%);
          opacity: 0.8;
        }
        .quoteCard {
          font-family: var(--font-hand);
          font-size: clamp(0.95rem, 2.3vw, 1.2rem);
          color: var(--maroon-deep);
          background: rgba(255, 255, 255, 0.55);
          padding: 0.5rem 0.7rem;
          border-radius: 3px;
          max-width: 20ch;
          line-height: 1.3;
          z-index: 2;
        }
        .snap {
          position: relative;
          display: block;
          width: clamp(80px, 20vw, 130px);
          padding: 5px 5px 14px;
          background: #fffdf8;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
          align-self: center;
        }
        .snap img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }
        .tilt-a {
          transform: rotate(-5deg);
          z-index: 2;
        }
        .stk {
          position: absolute;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .butterfly {
          bottom: 12%;
          left: 8%;
          transform: rotate(-8deg);
        }
        .hamster {
          bottom: 6%;
          left: 40%;
          font-size: clamp(1.8rem, 4.5vw, 2.6rem);
        }
      `}</style>
    </div>
  );
}

function Spread1Right() {
  return (
    <div className="page">
      <div className="quoteCard right-align">
        may the flowers remind us why the rain was so necessary.
      </div>
      <div className="ribbonStack">
        <span className="ribbon top" aria-hidden="true">🎀</span>
        {P_SPREAD1_RIGHT.map((src, i) => (
          <span className={`snap stack-${i}`} key={src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </span>
        ))}
        <span className="ribbon bottom" aria-hidden="true">🎀</span>
      </div>
      <span className="stk yarn" aria-hidden="true">🧶</span>
      <span className="lace" aria-hidden="true">
        <span className="star s1">⭐</span>
        <span className="star s2">⭐</span>
      </span>
      <span className="tornCorner" aria-hidden="true" />

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          padding: clamp(16px, 4vw, 30px);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.7rem;
          box-sizing: border-box;
        }
        .tornCorner {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 46%;
          height: 40%;
          background: linear-gradient(135deg, #e8d9b8 0%, #d9c39a 100%);
          clip-path: polygon(100% 100%, 0 100%, 100% 0);
          opacity: 0.8;
        }
        .quoteCard {
          font-family: var(--font-hand);
          font-size: clamp(0.95rem, 2.3vw, 1.2rem);
          color: var(--maroon-deep);
          background: rgba(255, 255, 255, 0.55);
          padding: 0.5rem 0.7rem;
          border-radius: 3px;
          max-width: 20ch;
          line-height: 1.3;
          z-index: 2;
        }
        .right-align {
          align-self: flex-end;
          text-align: right;
        }
        .snap {
          position: relative;
          display: block;
          width: clamp(80px, 20vw, 130px);
          padding: 5px 5px 14px;
          background: #fffdf8;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
        }
        .snap img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }
        .ribbonStack {
          position: relative;
          align-self: flex-end;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 0.3rem;
        }
        .ribbon {
          font-size: 1.4rem;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .stack-0 {
          transform: rotate(3deg);
          margin-top: -6px;
        }
        .stack-1 {
          transform: rotate(-4deg);
          margin-top: -10px;
        }
        .stack-2 {
          transform: rotate(4deg);
          margin-top: -10px;
        }
        .stk {
          position: absolute;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .yarn {
          bottom: 26%;
          left: 10%;
          font-size: clamp(1.8rem, 4.5vw, 2.6rem);
        }
        .lace {
          position: absolute;
          bottom: 6%;
          left: 8%;
          width: clamp(60px, 14vw, 100px);
          height: clamp(60px, 14vw, 100px);
          border-radius: 50%;
          border: 2px dashed rgba(107, 30, 38, 0.4);
        }
        .star {
          position: absolute;
          font-size: 1rem;
        }
        .s1 {
          top: -10px;
          right: -6px;
        }
        .s2 {
          bottom: -8px;
          left: -6px;
        }
      `}</style>
    </div>
  );
}

function Spread2Left() {
  return (
    <div className="page">
      <span className="stk bow" aria-hidden="true">🎀</span>
      <span className="stk star" aria-hidden="true">⭐</span>
      <span className="stk kitten" aria-hidden="true">🐱</span>
      <span className="snap tilt-b">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={P_SPREAD2_LEFT} alt="" />
      </span>
      <span className="stk moon" aria-hidden="true">🌙</span>
      <span className="gingham" aria-hidden="true" />
      <div className="quoteCard hand">
        i don&rsquo;t wanna keep secrets just to keep you <span className="heartTiny">🤍</span>
      </div>

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          padding: clamp(16px, 4vw, 30px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }
        .stk {
          position: absolute;
          font-size: clamp(1.6rem, 4vw, 2.3rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .bow {
          top: 4%;
          left: 6%;
          transform: rotate(-10deg);
        }
        .star {
          top: 6%;
          right: 30%;
          color: #c1394a;
        }
        .kitten {
          top: 22%;
          left: 6%;
          font-size: clamp(2rem, 5vw, 2.8rem);
        }
        .snap {
          align-self: center;
          width: clamp(90px, 22vw, 150px);
          padding: 5px 5px 14px;
          background: #fffdf8;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
        }
        .snap img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }
        .tilt-b {
          transform: rotate(4deg);
        }
        .moon {
          top: 8%;
          right: 8%;
        }
        .gingham {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40%;
          height: 32%;
          background: repeating-linear-gradient(
              45deg,
              #b5333f 0 10px,
              transparent 10px 20px
            ),
            repeating-linear-gradient(-45deg, #b5333f 0 10px, transparent 10px 20px),
            #f7ece2;
          opacity: 0.5;
          clip-path: polygon(0 100%, 0 0, 100% 100%);
        }
        .quoteCard.hand {
          font-family: var(--font-hand);
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          color: var(--maroon-deep);
          background: rgba(255, 255, 255, 0.6);
          padding: 0.5rem 0.7rem;
          border-radius: 3px;
          max-width: 22ch;
          z-index: 2;
        }
        .heartTiny {
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
}

function Spread2Right() {
  return (
    <div className="page">
      <span className="stk catcap" aria-hidden="true">
        <span className="cap">🧢</span>
        <span className="catface">🐱</span>
      </span>
      <div className="photoTrio">
        {P_SPREAD2_RIGHT.map((src, i) => (
          <span className={`snap trio-${i}`} key={src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </span>
        ))}
      </div>
      <span className="stk bouquet" aria-hidden="true">💐</span>
      <span className="tornCorner faint" aria-hidden="true" />

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          padding: clamp(16px, 4vw, 30px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }
        .stk {
          position: absolute;
          font-size: clamp(1.6rem, 4vw, 2.3rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .snap {
          position: relative;
          display: block;
          width: clamp(80px, 20vw, 130px);
          padding: 5px 5px 14px;
          background: #fffdf8;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
        }
        .snap img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }
        .photoTrio {
          position: absolute;
          left: 6%;
          top: 30%;
          width: 60%;
          height: 48%;
        }
        .trio-0 {
          position: absolute;
          left: 0;
          top: 0;
          transform: rotate(-6deg);
          z-index: 3;
        }
        .trio-1 {
          position: absolute;
          left: 42%;
          top: 12%;
          transform: rotate(5deg);
          z-index: 2;
        }
        .trio-2 {
          position: absolute;
          left: 14%;
          top: 40%;
          transform: rotate(-3deg);
          z-index: 1;
        }
        .catcap {
          top: 6%;
          right: 10%;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0.9;
        }
        .catcap .cap {
          font-size: 1.3rem;
          transform: rotate(-8deg) translateY(4px);
        }
        .catcap .catface {
          font-size: clamp(1.8rem, 4.5vw, 2.5rem);
        }
        .bouquet {
          bottom: 14%;
          right: 12%;
          font-size: clamp(2.2rem, 5.5vw, 3rem);
        }
        .tornCorner {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 46%;
          height: 40%;
          background: linear-gradient(135deg, #e8d9b8 0%, #d9c39a 100%);
          clip-path: polygon(100% 100%, 0 100%, 100% 0);
        }
        .faint {
          opacity: 0.35;
        }
      `}</style>
    </div>
  );
}

function ClosingLeft() {
  return (
    <div className="page">
      <span className="vinyl" aria-hidden="true">
        <span className="vinylLabel" />
      </span>
      <span className="stk ribbon" aria-hidden="true">🎀</span>
      <span className="stk flowersBlue" aria-hidden="true">💠</span>

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          box-sizing: border-box;
          padding: clamp(16px, 4vw, 30px);
        }
        .vinyl {
          position: absolute;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          width: clamp(110px, 22vw, 170px);
          height: clamp(110px, 22vw, 170px);
          border-radius: 50%;
          background: repeating-radial-gradient(
            circle,
            #1c1c1c 0px,
            #1c1c1c 3px,
            #2c2c2c 4px,
            #1c1c1c 5px
          );
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.4);
        }
        .vinylLabel {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 32%;
          height: 32%;
          border-radius: 50%;
          background: var(--gold-soft);
          box-shadow: 0 0 0 2px #1c1c1c inset;
        }
        .stk {
          position: absolute;
          font-size: clamp(1.7rem, 4.2vw, 2.4rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .ribbon {
          top: 8%;
          left: 14%;
          transform: rotate(-10deg);
        }
        .flowersBlue {
          bottom: 12%;
          left: 12%;
          color: #4a7fb5;
        }
      `}</style>
    </div>
  );
}

function ClosingRight() {
  return (
    <div className="page">
      <span className="ticket" aria-hidden="true">ADMIT ONE</span>
      <span className="stk cake" aria-hidden="true">🍰</span>
      <span className="heartBadge">
        <span className="heartIcon" aria-hidden="true">❤️</span>
        for {HER_NAME}
      </span>

      <style jsx>{`
        .page {
          position: relative;
          height: 100%;
          box-sizing: border-box;
          padding: clamp(16px, 4vw, 30px);
        }
        .stk {
          position: absolute;
          font-size: clamp(1.7rem, 4.2vw, 2.4rem);
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .cake {
          bottom: 24%;
          right: 16%;
        }
        .ticket {
          position: absolute;
          top: 14%;
          right: 12%;
          transform: rotate(8deg);
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: var(--maroon-deep);
          background: #f3d9c4;
          border: 1px dashed rgba(107, 30, 38, 0.5);
          padding: 6px 10px;
        }
        .heartBadge {
          position: absolute;
          left: 50%;
          bottom: 8%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-hand);
          font-size: clamp(1rem, 2.6vw, 1.3rem);
          color: var(--maroon-deep);
          background: rgba(255, 255, 255, 0.7);
          padding: 6px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .heartIcon {
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
}

const PAGES_DATA = [
  { Left: Spread1Left, Right: Spread1Right },
  { Left: Spread2Left, Right: Spread2Right },
  { Left: ClosingLeft, Right: ClosingRight },
];
