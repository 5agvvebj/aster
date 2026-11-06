"use client";

import { useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, KeyboardEvent } from "react";
import { zodiacConstellations } from "@/lib/sky-data";

type SkyCustomProperties = CSSProperties & Record<`--${string}`, string | number>;

type Props = {
  selectedSlug: string;
  onSelect: (slug: string) => void;
};

type Point3D = { x: number; y: number; z: number };

function rounded(value: number, precision = 3) {
  return Number(value.toFixed(precision));
}

function coordinates(ra: number, dec: number): Point3D {
  const rightAscension = (ra * Math.PI) / 180;
  const declination = (dec * Math.PI) / 180;
  const radius = 43;
  return {
    x: Math.cos(declination) * Math.sin(rightAscension) * radius,
    y: -Math.sin(declination) * radius,
    z: Math.cos(declination) * Math.cos(rightAscension) * radius,
  };
}

export function SkyGlobe({ selectedSlug, onSelect }: Props) {
  const [rotation, setRotation] = useState({ x: -12, y: -25 });
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const selected = zodiacConstellations.find((item) => item.slug === selectedSlug) ?? zodiacConstellations[0];
  const fieldStars = useMemo(() => zodiacConstellations.flatMap((constellation) =>
    constellation.stars.map((star) => ({
      ...star,
      slug: constellation.slug,
      color: constellation.palette,
    })),
  ), []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".sky-star-button")) return;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    setRotation((current) => ({
      x: Math.max(-65, Math.min(65, current.x + deltaY * 0.36)),
      y: current.y + deltaX * 0.36,
    }));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const amount = event.shiftKey ? 14 : 6;
    if (event.key === "ArrowLeft") setRotation((current) => ({ ...current, y: current.y - amount }));
    else if (event.key === "ArrowRight") setRotation((current) => ({ ...current, y: current.y + amount }));
    else if (event.key === "ArrowUp") setRotation((current) => ({ ...current, x: Math.max(-65, current.x - amount) }));
    else if (event.key === "ArrowDown") setRotation((current) => ({ ...current, x: Math.min(65, current.x + amount) }));
    else return;
    event.preventDefault();
  }

  const sphereStyle = { transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` };

  return (
    <div className="sky-scene-wrap">
      <div
        className="sky-scene"
        role="application"
        aria-label="Interactive three-dimensional star globe. Use arrow keys or drag to rotate."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="sky-backdrop">
          <span className="sky-nebula sky-nebula-one" />
          <span className="sky-nebula sky-nebula-two" />
          {Array.from({ length: 68 }, (_, index) => (
            <i
              className="sky-background-star"
              key={index}
              style={{
                left: `${(index * 47 + 13) % 97}%`,
                top: `${(index * 71 + 9) % 95}%`,
                opacity: String(rounded(0.23 + ((index * 13) % 55) / 100)),
                transform: `scale(${rounded(0.5 + ((index * 7) % 12) / 10)})`,
              }}
            />
          ))}
        </div>
        <div className="sky-sphere" style={sphereStyle}>
          <span className="sky-sphere-ring sky-sphere-ring-one" />
          <span className="sky-sphere-ring sky-sphere-ring-two" />
          <span className="sky-sphere-axis" />
          {fieldStars.map((star, index) => {
            const point = coordinates(star.ra, star.dec);
            const isSelected = star.slug === selectedSlug;
            const size = Math.max(4, 10 - star.magnitude * 1.45);
            const starStyle: SkyCustomProperties = {
              left: `${rounded(50 + point.x)}%`,
              top: `${rounded(50 + point.y)}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) translateZ(${rounded(point.z * 3.1)}px)`,
              zIndex: String(Math.round(point.z + 50)),
              opacity: isSelected ? "1" : "0.38",
              "--star-color": star.color,
              "--star-index": String(index),
            };
            return (
              <button
                type="button"
                key={`${star.slug}-${star.name}`}
                className={`sky-star-button ${isSelected ? "sky-star-selected" : ""}`}
                aria-label={`${star.name}, ${zodiacConstellations.find((item) => item.slug === star.slug)?.name} constellation`}
                title={`${star.name} · ${star.magnitude.toFixed(1)} mag`}
                onClick={() => onSelect(star.slug)}
                style={starStyle}
              >
                <span className="sky-star-glow" />
                <span
                  className={`sky-star-label sky-star-label-${selected.stars.findIndex((item) => item.name === star.name) % 3}`}
                >
                  {star.name}
                </span>
              </button>
            );
          })}
          {selected.connections.map(([startIndex, endIndex], index) => {
            const start = coordinates(selected.stars[startIndex].ra, selected.stars[startIndex].dec);
            const end = coordinates(selected.stars[endIndex].ra, selected.stars[endIndex].dec);
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dz = end.z - start.z;
            const length = Math.hypot(dx, dy, dz);
            const horizontal = Math.hypot(dx, dz);
            const rotateY = rounded(-(Math.atan2(dz, dx) * 180) / Math.PI);
            const rotateZ = rounded((Math.atan2(dy, horizontal) * 180) / Math.PI);
            const lineStyle: SkyCustomProperties = {
              left: `${rounded(50 + start.x)}%`,
              top: `${rounded(50 + start.y)}%`,
              width: `${rounded(length)}%`,
              transform: `translateZ(${rounded(start.z * 3.1)}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              "--line-order": String(index),
            };
            return (
              <span
                className="sky-constellation-line"
                key={`${startIndex}-${endIndex}`}
                aria-hidden="true"
                style={lineStyle}
              />
            );
          })}
        </div>
        <span className="sky-coordinate-label sky-coordinate-north">N</span>
        <span className="sky-coordinate-label sky-coordinate-south">S</span>
        <span className="sky-coordinate-label sky-coordinate-east">E</span>
        <span className="sky-coordinate-label sky-coordinate-west">W</span>
        <span className="sky-scene-vignette" />
      </div>
      <div className="sky-globe-footer">
        <span className="sky-globe-indicator"><i /> {selected.name} · {selected.stars.length} stars shown</span>
        <span className="sky-drag-hint">✦ drag to rotate</span>
      </div>
    </div>
  );
}
