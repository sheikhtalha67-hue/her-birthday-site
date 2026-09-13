"use client";

import { useRef, useState } from "react";
import FireNumberReveal from "@/components/FireNumberReveal";
import BirthdayBalloons from "@/components/BirthdayBalloons";
import SketchbookIntro from "@/components/SketchbookIntro";
import PhotoGallery from "@/components/PhotoGallery";
import PolaroidBoard from "@/components/PolaroidBoard";
import Starfield from "@/components/Starfield";

// To personalize the site (name, nicknames, age, photos), edit app/config.js

// Path to your music file. Drop an mp3 (or similar) into public/audio/
// and update this path if you name it something else.
const MUSIC_SRC = "/audio/birthday-song.mp3";

const SECTIONS = [
  FireNumberReveal,
  BirthdayBalloons,
  SketchbookIntro,
  PhotoGallery,
  PolaroidBoard,
  Starfield,
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  const next = () => setStep((s) => Math.min(s + 1, SECTIONS.length - 1));

  const startMusic = () => {
    if (musicOn) return;
    setMusicOn(true);
    audioRef.current?.play().catch(() => {
      // Autoplay can still be blocked on some browsers until another tap happens;
      // the mute/unmute button below will also retry play() when tapped.
    });
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      if (!next) audioRef.current?.play().catch(() => {});
      return next;
    });
  };

  const Section = SECTIONS[step];

  return (
    <main className="stage">
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />

      {musicOn && (
        <button
          className="muteBtn"
          onClick={toggleMute}
          aria-label={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}

      <div className="progressDots" aria-hidden="true">
        {SECTIONS.map((_, i) => (
          <span key={i} className={i === step ? "active" : ""} />
        ))}
      </div>
      <Section onNext={next} onStartMusic={startMusic} isLast={step === SECTIONS.length - 1} />

      <style jsx>{`
        .muteBtn {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 100;
          width: 2.6rem;
          height: 2.6rem;
          border-radius: 50%;
          border: 1px solid rgba(244, 233, 214, 0.35);
          background: rgba(10, 10, 20, 0.45);
          backdrop-filter: blur(6px);
          color: var(--cream);
          font-size: 1.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .muteBtn:hover {
          background: rgba(10, 10, 20, 0.65);
          transform: scale(1.06);
        }
        .muteBtn:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        @media (max-width: 480px) {
          .muteBtn {
            top: 0.75rem;
            right: 0.75rem;
            width: 2.3rem;
            height: 2.3rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
