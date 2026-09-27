import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
}

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const AnimatedNumber = ({ value, durationMs = 900 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const startValue = previousValueRef.current;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, durationMs]);

  return <span className="tabular-nums">{displayValue}</span>;
};
