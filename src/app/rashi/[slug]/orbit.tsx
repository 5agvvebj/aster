"use client";

import Image from "next/image";
import { useState } from "react";
import type { PointerEvent } from "react";
import type { CSSProperties } from "react";
import type { Rashi } from "@/lib/rashis";

type CelestialBody = {
  id: string;
  name: string;
  image: string;
  nasaId: string;
  credit: string;
};

const celestialBodies: CelestialBody[] = [
  { id: "sun", name: "Sun", image: "/planets/sun.jpg", nasaId: "PIA26681", credit: "NASA / GSFC / SDO" },
  { id: "mercury", name: "Mercury", image: "/planets/mercury.jpg", nasaId: "PIA12264", credit: "NASA / JPL" },
  { id: "venus", name: "Venus", image: "/planets/venus.jpg", nasaId: "PIA23791", credit: "NASA / JPL-Caltech" },
  { id: "earth", name: "Earth", image: "/planets/earth.jpg", nasaId: "GSFC_20171208_Archive_e001386", credit: "NASA / GSFC" },
  { id: "moon", name: "Moon", image: "/planets/moon.jpg", nasaId: "GSFC_20171208_Archive_e001861", credit: "NASA / GSFC" },
  { id: "mars", name: "Mars", image: "/planets/mars.jpg", nasaId: "PIA00407", credit: "NASA / JPL" },
  { id: "jupiter", name: "Jupiter", image: "/planets/jupiter.jpg", nasaId: "PIA25013", credit: "NASA / JPL-Caltech / SwRI / MSSS" },
  { id: "saturn", name: "Saturn", image: "/planets/saturn.jpg", nasaId: "PIA06193", credit: "NASA / JPL / Space Science Institute" },
  { id: "uranus", name: "Uranus", image: "/planets/uranus.jpg", nasaId: "PIA18182", credit: "NASA / JPL" },
  { id: "neptune", name: "Neptune", image: "/planets/neptune.jpg", nasaId: "PIA01492", credit: "NASA / JPL" },
];

const orbitPositions = [
  [{ left: "50%", top: "0%" }, { left: "100%", top: "50%" }, { left: "50%", top: "100%" }],
  [{ left: "100%", top: "50%" }, { left: "50%", top: "100%" }, { left: "0%", top: "50%" }],
  [{ left: "50%", top: "100%" }, { left: "0%", top: "50%" }, { left: "50%", top: "0%" }],
];

function getFeaturedBody(rashi?: Rashi) {
  if (!rashi) return celestialBodies[0];
  const ruler = rashi.ruler.split("·")[0].trim().toLowerCase();
  return celestialBodies.find((body) => body.name.toLowerCase() === ruler) ?? celestialBodies[0];
}

export function RashiOrbit({ rashi }: { rashi: Rashi }) {
  return <PlanetaryGalaxy rashi={rashi} />;
}

export function PlanetaryGalaxy({ rashi }: { rashi?: Rashi }) {
  const [rotation, setRotation] = useState({ x: -18, y: 0 });
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    rotationX: number;
    rotationY: number;
  } | null>(null);
  const featuredBody = getFeaturedBody(rashi);
  const orbitingBodies = celestialBodies.filter((body) => body.id !== featuredBody.id);
  const orbitLayers = [orbitingBodies.slice(0, 3), orbitingBodies.slice(3, 6), orbitingBodies.slice(6, 9)];

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      rotationX: rotation.x,
      rotationY: rotation.y,
    });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragStart) return;
    setRotation({
      x: Math.max(-65, Math.min(65, dragStart.rotationX + (event.clientY - dragStart.y) * 0.45)),
      y: dragStart.rotationY + (event.clientX - dragStart.x) * 0.45,
    });
  }

  const style = {
    "--rashi-accent": rashi?.palette ?? "#9b82c4",
    "--tilt-x": `${rotation.x}deg`,
    "--tilt-y": `${rotation.y}deg`,
  } as CSSProperties;

  return (
    <figure className={`planetary-galaxy${rashi ? " planetary-galaxy-rashi" : " planetary-galaxy-explorer"}`}>
      <div
        className="rashi-orbit-scene"
        style={style}
        role="img"
        aria-label={`${rashi ? `${rashi.sanskritName} ruler ${featuredBody.name} with NASA planetary images` : "Animated solar system gallery with NASA planetary images"}. Drag to rotate; not to scale.`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => setDragStart(null)}
        onPointerCancel={() => setDragStart(null)}
        onLostPointerCapture={() => setDragStart(null)}
      >
        <div className="rashi-galaxy-nebula" />
        <div className="rashi-star-field" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <span className="rashi-model-label">{rashi ? `${rashi.sanskritName} · RULING BODY` : "THE SOLAR SYSTEM · NASA IMAGERY"}</span>
        {orbitLayers.map((bodies, layerIndex) => (
          <div className={`rashi-orbit-track rashi-orbit-track-${layerIndex + 1}`} key={layerIndex}>
            {bodies.map((body, bodyIndex) => {
              const position = orbitPositions[layerIndex][bodyIndex];
              return (
                <span
                  className="rashi-orbiting-body"
                  key={body.id}
                  style={{ left: position.left, top: position.top } as CSSProperties}
                  title={body.name}
                >
                  <Image src={body.image} alt="" fill sizes="42px" unoptimized />
                </span>
              );
            })}
          </div>
        ))}
        <div className={`rashi-planet rashi-planet-${featuredBody.id}`}>
          <Image
            src={featuredBody.image}
            alt=""
            fill
            sizes="(max-width: 760px) 140px, 180px"
            unoptimized
          />
        </div>
        <div className="rashi-galaxy-caption" aria-hidden="true">
          <strong>{featuredBody.name}</strong>
          <span>{rashi ? `Traditional ruler of ${rashi.sanskritName}` : "A small corner of our solar system"}</span>
        </div>
        <span className="rashi-drag-hint">Drag to explore · not to scale</span>
      </div>
      <details className="planetary-image-credits">
        <summary>NASA image credits</summary>
        <ul>
          {celestialBodies.map((body) => (
            <li key={body.id}>
              <a href={`https://images.nasa.gov/details/${body.nasaId}`} target="_blank" rel="noreferrer">
                {body.name} · {body.nasaId}
              </a>
              <span>{body.credit}</span>
            </li>
          ))}
        </ul>
        <p>Photographs are arranged in an artistic, animated view; orbital distances and sizes are not to scale.</p>
      </details>
    </figure>
  );
}
