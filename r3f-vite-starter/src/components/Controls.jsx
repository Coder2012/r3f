import React, { useState, useRef } from "react";

export const Controls = ({ onChange }) => {
  const [angle, setAngle] = useState(0);
  const svgRef = useRef(null);

  const handleMouseMove = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const newAngle = Math.max(Math.min((1 - x / rect.width) * 90, 90), 0);
    setAngle(newAngle);
    onChange(newAngle);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="controls">
      <svg
        ref={svgRef}
        width="200"
        height="200"
        viewBox="-10 -10 220 220"
        onMouseDown={handleMouseDown}
        style={{ border: "1px solid black" }}
      >
        <line
          x1="0"
          y1="200"
          x2="200"
          y2="200"
          stroke="black"
          strokeWidth="2"
          style={{
            transformOrigin: "0px 200px",
            transform: `rotate(-${angle}deg)`,
          }}
        />
        <circle
          cx="200"
          cy="200"
          r="8"
          fill="red"
          style={{
            transformOrigin: "0px 200px",
            transform: `rotate(-${angle}deg)`,
          }}
        />
      </svg>
    </div>
  );
};
