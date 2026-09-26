"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/** A separate decorative asset; the original hero photograph is never transformed or replaced. */
export function TruckAnimation() {
  const [paused, setPaused] = useState(false);
  return <div className="truck-motion-strip">
    <div className="container truck-motion-inner">
      <div className="motion-copy">
        <span>Always moving forward.</span>
        <strong>California roots. Open-road ambition.</strong>
      </div>
      <div className={`truck-motion-track ${paused ? "is-paused" : ""}`} aria-hidden="true">
        <div className="truck-motion-traveler">
          <img src="/images/range-truck-sprite.webp" width={800} height={267} alt="" />
        </div>
        <span className="motion-baseline" />
      </div>
      <button className="motion-toggle" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play truck animation" : "Pause truck animation"} aria-pressed={paused}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
    </div>
  </div>;
}
