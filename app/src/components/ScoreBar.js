import React from "react";
import { useSpring, animated } from "react-spring";

function DrawScoreBar({ value, color }) {
  const [props] = useSpring({
    width: `${value.toFixed(1)}%`,
    from: { width: "0%" },
    background: color
  });

  return (
    <div className="pill-wrapper">
      <p> {value.toFixed(1)}% </p>
      <div className="pill-track">
        <animated.div style={props} />
      </div>
    </div>
  );
}

function ScoreBar({ value }) {
  const progressColor =
    value < 50
      ? "linear-gradient(90deg, rgba(242, 95, 95, 0)  0%, #F25F5F 100%), #A62727"
      : "linear-gradient(90deg, rgba(95, 242, 110, 0) 0%, #5FF26E 100%), #27A63B";

  return <DrawScoreBar value={value} color={progressColor} />;
}

export default ScoreBar;
