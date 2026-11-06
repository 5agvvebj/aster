"use client";

import { useState } from "react";
import type { PointerEvent } from "react";
import type { CSSProperties } from "react";
import { houses } from "@/lib/chart-learning";

type Props = {
  selectedId: string;
  selectedSymbol: string;
  selectedName: string;
  onSelect: (id: string) => void;
  planetPlacements?: Array<{ name: string; symbol: string; house: number }>;
  highlightedHouse?: number;
};

export function ChartOrbitScene({
  selectedId,
  selectedSymbol,
  selectedName,
  onSelect,
  planetPlacements = [],
  highlightedHouse,
}: Props) {
  const [rotation, setRotation] = useState({ x: 58, y: -12 });
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    rotationX: number;
    rotationY: number;
  } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button")) return;
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
      x: Math.max(34, Math.min(74, dragStart.rotationX + (event.clientY - dragStart.y) * 0.35)),
      y: dragStart.rotationY + (event.clientX - dragStart.x) * 0.35,
    });
  }

  const style = {
    "--chart-tilt-x": `${rotation.x}deg`,
    "--chart-tilt-y": `${rotation.y}deg`,
  } as CSSProperties;

  return (
    <div
      className="chart-orbit-viewport"
      style={style}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={() => setDragStart(null)}
      onPointerCancel={() => setDragStart(null)}
      onLostPointerCapture={() => setDragStart(null)}
    >
      <div className="chart-orbit-stars" aria-hidden="true" />
      <div className="chart-3d-wheel" aria-label="Interactive three-dimensional chart concepts">
        <div className="chart-orbit-ring chart-orbit-ring-outer" aria-hidden="true" />
        <div className="chart-orbit-ring chart-orbit-ring-inner" aria-hidden="true" />
        <div className="chart-house-orbit">
          {houses.map((house, index) => {
            const houseNumber = index + 1;
            const occupants = planetPlacements.filter((placement) => placement.house === houseNumber);
            const isSelected = selectedId === house.id;
            return (
              <button
                className={`chart-house house-orbit-${houseNumber} ${isSelected ? "chart-house-active" : ""} ${highlightedHouse === houseNumber ? "chart-house-highlighted" : ""}`}
                key={house.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Select ${house.name}${occupants.length ? `, contains ${occupants.map((placement) => placement.name).join(", ")}` : ""}`}
                onClick={() => onSelect(house.id)}
              >
                <span>{house.symbol}</span>
                {occupants.length > 0 && (
                  <span className="chart-house-occupants" aria-hidden="true">
                    {occupants.slice(0, 3).map((placement) => (
                      <span key={placement.name}>{placement.symbol}</span>
                    ))}
                    {occupants.length > 3 && <span>+{occupants.length - 3}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="chart-planet-core" aria-hidden="true">
          <span className="chart-planet-symbol">{selectedSymbol}</span>
          <span className="chart-planet-name">{selectedName}</span>
          <span className="chart-planet-highlight" />
        </div>
      </div>
      <p className="chart-drag-hint">Drag the scene · select a house or Graha</p>
    </div>
  );
}
