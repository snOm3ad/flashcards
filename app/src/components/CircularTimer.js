// Import module and default styles
import React, { useEffect, useState, useRef } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function CircularTimer({ finished, time, setTime, timeLimit }) {
  const [value, setValue] = useState(100);
  const isMounted = useRef(true);

  useEffect(() => {
    // run this only if the user has not asked for the answer
    // to the question. We don't care if the timer has run out
    // or not.
    if (!finished) {
      setTimeout(() => {
        if (isMounted.current && time > 0) {
          setTime(time - 1);
        }
      }, 1000);

      if (isMounted.current && time > 0) {
        setValue(Math.floor(((time - 1) / timeLimit) * 100));
      }
    }
  }, [time, timeLimit, setTime, setValue, finished]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <CircularProgressbar
      value={value}
      strokeWidth={20}
      styles={buildStyles({
        strokeLinecap: "butt",
        pathColor: value > 25 ? "white" : "red",
        trailColor: "#234C63"
      })}
    />
  );
}

export default CircularTimer;
