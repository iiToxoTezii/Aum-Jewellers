import React, { useEffect, useState } from 'react';

const SparkleElement = ({ active, children }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const newSparkles = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 6,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: Math.random() * 1.5 + 1.0,
    }));

    setSparkles(newSparkles);

    const interval = setInterval(() => {
      setSparkles(prev => prev.map(sparkle => ({
        ...sparkle,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      })));
    }, 2500);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative w-full h-full" style={{ position: 'relative' }}>
      {children}
      {active && sparkles.map(sparkle => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none sparkle-star"
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            zIndex: 5
          }}
        />
      ))}
    </div>
  );
};

export default SparkleElement;
