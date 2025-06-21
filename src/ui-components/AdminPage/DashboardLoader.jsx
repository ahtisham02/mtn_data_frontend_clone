import React from 'react';

export default function DataStreamLoader() {
  const barCount = 10;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex items-end justify-center h-40 w-64 gap-2">
        {Array.from({ length: barCount }).map((_, index) => (
          <div
            key={index}
            // Add h-full here
            className="h-full w-4 bg-gradient-to-t from-accent/20 to-accent rounded-t-lg animate-stream"
            style={{
              animationDelay: `${index * 100}ms`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>
      <p className="mt-8 text-lg font-light text-muted-foreground tracking-widest animate-pulse">
        Building your view...
      </p>
    </div>
  );
}