"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HER_NAME, PHOTOS, NICKNAMES } from "@/app/config";

// Same crop fix as the other sections — keyed by index in PHOTOS.
// Value is how far from the TOP of the photo to anchor the crop (0 = top, 0.5 = center).
const FOCUS_Y = {
  4: 0.2,
  5: 0.15,
};

// ---- canvas helpers: draw each photo into a rounded "card" texture ----
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCoverImage(ctx, img, x, y, w, h, radius, focusY) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.clip();
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW, drawH, dx, dy;
  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
    dx = x - (drawW - w) * 0.5;
    dy = y;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    dx = x;
    dy = y - (drawH - h) * focusY;
  }
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function makeCardTexture(src, label, focusY) {
  const img = await loadImage(src);
  const W = 512;
  const H = 700;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // frame
  ctx.fillStyle = "#12141c";
  roundRectPath(ctx, 0, 0, W, H, 26);
  ctx.fill();

  // photo, inset with its own rounded corners
  const pad = 20;
  const imgW = W - pad * 2;
  const imgH = H - pad * 2 - 64;
  drawCoverImage(ctx, img, pad, pad, imgW, imgH, 12, focusY);

  // caption
  ctx.fillStyle = "#f4ece0";
  ctx.font = "600 32px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(label, W / 2, H - 26);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function Starfield() {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060f);
    scene.fog = new THREE.FogExp2(0x05060f, 0.00075);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 4000);
    camera.position.set(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const pt1 = new THREE.PointLight(0xffe3b0, 1.1, 3000);
    pt1.position.set(300, 200, 200);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0x8fb0ff, 0.6, 3000);
    pt2.position.set(-400, -150, -300);
    scene.add(pt2);

    // starfield
    const STAR_COUNT = width < 700 ? 2200 : 4200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 400 + Math.random() * 1800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      fog: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // cards group
    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);
    const cardMeshes = [];

    let disposed = false;

    (async () => {
      const names = NICKNAMES || ["you"];

      const cardData = PHOTOS.map((src, i) => {
        const angle = (i * 137.5) % 360; // golden-angle spread, organic not gridlike
        const ring = Math.floor(i / 6);
        const radius = 220 + ring * 140 + (i % 5) * 18;
        const rad = (angle * Math.PI) / 180;
        return {
          src,
          label: names[i % names.length],
          x: Math.cos(rad) * radius + (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 480,
          z: -180 - ring * 220 - (i % 4) * 90,
          rotX: (Math.random() - 0.5) * 0.25,
          rotY: (Math.random() - 0.5) * 0.35,
          rotZ: (Math.random() - 0.5) * 0.2,
          phase: Math.random() * Math.PI * 2,
          focusY: FOCUS_Y[i] !== undefined ? FOCUS_Y[i] : 0.5,
        };
      });

      const textures = await Promise.all(
        cardData.map((c) => makeCardTexture(c.src, c.label, c.focusY))
      );
      if (disposed) return;

      const CARD_W = 42;
      const CARD_H = (CARD_W * 700) / 512;
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);

      cardData.forEach((c, i) => {
        const mat = new THREE.MeshStandardMaterial({
          map: textures[i],
          roughness: 0.85,
          metalness: 0.05,
          side: THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(c.x, c.y, c.z);
        mesh.lookAt(0, 0, 200);
        mesh.rotation.x += c.rotX;
        mesh.rotation.y += c.rotY;
        mesh.rotation.z += c.rotZ;
        mesh.userData = {
          baseX: c.x,
          baseY: c.y,
          baseZ: c.z,
          baseRotX: mesh.rotation.x,
          baseRotY: mesh.rotation.y,
          baseRotZ: mesh.rotation.z,
          phase: c.phase,
          focused: false,
        };
        cardsGroup.add(mesh);
        cardMeshes.push(mesh);
      });

      setReady(true);
    })();

    // ---- interaction: drag to look around ----
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let mouseNormX = 0;
    let mouseNormY = 0;

    const onPointerDown = (e) => {
      dragging = true;
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX;
      lastY = p.clientY;
      mount.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      dragging = false;
      mount.style.cursor = "grab";
    };
    const onPointerMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const rect = mount.getBoundingClientRect();
      mouseNormX = ((p.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormY = ((p.clientY - rect.top) / rect.height) * 2 - 1;

      if (dragging) {
        const dx = p.clientX - lastX;
        const dy = p.clientY - lastY;
        lastX = p.clientX;
        lastY = p.clientY;
        targetYaw -= dx * 0.0032;
        targetPitch -= dy * 0.0032;
        targetPitch = Math.max(-0.55, Math.min(0.55, targetPitch));
      }
    };

    mount.addEventListener("mousedown", onPointerDown);
    mount.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    // ---- scroll to fly deeper (desktop) ----
    let scrollZ = 60;
    const MIN_Z = -1700;
    const MAX_Z = 220;
    const onWheel = (e) => {
      e.preventDefault();
      scrollZ -= e.deltaY * 0.6;
      scrollZ = Math.max(MIN_Z, Math.min(MAX_Z, scrollZ));
    };
    mount.addEventListener("wheel", onWheel, { passive: false });

    // ---- pinch to fly deeper (touch) ----
    let pinchDist = null;
    const touchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };
    const onTouchStartPinch = (e) => {
      if (e.touches.length === 2) {
        pinchDist = touchDist(e.touches);
      }
    };
    const onTouchMovePinch = (e) => {
      if (e.touches.length === 2) {
        const d = touchDist(e.touches);
        if (pinchDist != null) {
          scrollZ += (d - pinchDist) * 1.1;
          scrollZ = Math.max(MIN_Z, Math.min(MAX_Z, scrollZ));
        }
        pinchDist = d;
      }
    };
    const onTouchEndPinch = (e) => {
      if (e.touches.length < 2) pinchDist = null;
    };
    mount.addEventListener("touchstart", onTouchStartPinch, { passive: true });
    mount.addEventListener("touchmove", onTouchMovePinch, { passive: true });
    mount.addEventListener("touchend", onTouchEndPinch);

    // ---- click a card to pull it toward you ----
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onClick = (e) => {
      const rect = mount.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(cardMeshes);
      if (hits.length > 0) {
        const hit = hits[0].object;
        hit.userData.focused = !hit.userData.focused;
      }
    };
    mount.addEventListener("click", onClick);

    mount.style.cursor = "grab";

    // ---- resize ----
    const onResize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // ---- animation loop ----
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      yaw += (targetYaw - yaw) * 0.08;
      pitch += (targetPitch - pitch) * 0.08;
      const parallaxYaw = yaw + mouseNormX * 0.06;
      const parallaxPitch = pitch - mouseNormY * 0.04;

      camera.position.z += (scrollZ - camera.position.z) * 0.06;
      camera.rotation.order = "YXZ";
      camera.rotation.y = parallaxYaw;
      camera.rotation.x = parallaxPitch;

      cardMeshes.forEach((m) => {
        const d = m.userData;
        const bob = Math.sin(t * 0.6 + d.phase) * 4;
        const targetPos = d.focused
          ? {
              x: d.baseX * 0.35,
              y: d.baseY * 0.35 + bob * 0.3,
              z: d.baseZ * 0.35 + camera.position.z * 0.4,
            }
          : { x: d.baseX, y: d.baseY + bob, z: d.baseZ };
        m.position.x += (targetPos.x - m.position.x) * 0.06;
        m.position.y += (targetPos.y - m.position.y) * 0.06;
        m.position.z += (targetPos.z - m.position.z) * 0.06;
        const scaleTarget = d.focused ? 1.6 : 1;
        m.scale.x += (scaleTarget - m.scale.x) * 0.08;
        m.scale.y += (scaleTarget - m.scale.y) * 0.08;
        // gentle continuous tumble on top of the card's base orientation
        m.rotation.x = d.baseRotX + Math.sin(t * 0.35 + d.phase) * 0.06;
        m.rotation.y = d.baseRotY + Math.cos(t * 0.3 + d.phase) * 0.07;
        m.rotation.z = d.baseRotZ + Math.sin(t * 0.25 + d.phase * 1.3) * 0.04;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("mousedown", onPointerDown);
      mount.removeEventListener("touchstart", onPointerDown);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("touchstart", onTouchStartPinch);
      mount.removeEventListener("touchmove", onTouchMovePinch);
      mount.removeEventListener("touchend", onTouchEndPinch);
      mount.removeEventListener("click", onClick);
      cardMeshes.forEach((m) => {
        m.material.map?.dispose();
        m.material.dispose();
      });
      if (cardMeshes.length > 0) geoDisposeSafe(cardMeshes[0].geometry);
      geoDisposeSafe(starGeo);
      starMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="galaxyStage">
      <div ref={mountRef} className="mount" />

      <div className={`overlay ${ready ? "" : "loading"}`}>
        <p className="title">our little galaxy</p>
        <p className="hint">drag to look around &bull; scroll to fly deeper &bull; tap a photo to pull it close</p>
      </div>

      {!ready && (
        <div className="loadingScreen">
          <p>gathering the stars&hellip;</p>
        </div>
      )}

      <div className="closing">
        <p className="closingLine">here&rsquo;s to you, {HER_NAME}.</p>
        <p className="closingSmall">made with love, just for you.</p>
      </div>

      <style jsx>{`
        .galaxyStage {
          position: absolute;
          inset: 0;
          background: #05060f;
          overflow: hidden;
        }
        .mount {
          position: absolute;
          inset: 0;
        }
        .mount :global(canvas) {
          display: block;
        }
        .overlay {
          position: absolute;
          top: 5%;
          left: 5%;
          z-index: 30;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }
        .overlay.loading {
          opacity: 0;
        }
        .title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: clamp(1.3rem, 4vw, 2rem);
          color: var(--cream);
          margin: 0;
          text-shadow: 0 0 20px rgba(207, 159, 63, 0.4);
        }
        .hint {
          font-family: var(--font-body);
          font-size: clamp(0.72rem, 1.8vw, 0.9rem);
          color: var(--gold-soft);
          opacity: 0.8;
          margin: 0.35rem 0 0;
        }
        .loadingScreen {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }
        .loadingScreen p {
          font-family: var(--font-hand);
          font-size: 1.4rem;
          color: var(--gold-soft);
        }
        .closing {
          position: absolute;
          left: 50%;
          bottom: 6%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 30;
          pointer-events: none;
        }
        .closingLine {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: clamp(1.3rem, 4vw, 2.2rem);
          color: var(--cream);
          margin: 0;
          text-shadow: 0 0 24px rgba(207, 159, 63, 0.4);
        }
        .closingSmall {
          font-family: var(--font-hand);
          font-size: 1.1rem;
          color: var(--gold-soft);
          margin: 0.4rem 0 0;
        }
      `}</style>
    </section>
  );
}

function geoDisposeSafe(geo) {
  try {
    geo.dispose();
  } catch (e) {
    // no-op
  }
}
