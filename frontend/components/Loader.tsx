import React, { useEffect, useState } from 'react';

const steps = ['C', 'Co', 'Cod', 'Code', 'Coder'];
const interval = 180; // ms per step

export default function Loader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % steps.length);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <span className="text-4xl font-bold text-blue-400 select-none tracking-widest transition-all duration-200">
        {steps[index]}
      </span>
    </div>
  );
} 