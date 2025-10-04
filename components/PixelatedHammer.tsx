"use client";

import React from "react";

interface PixelatedHammerProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

export function PixelatedHammer({ size = "md", animated = true, className = "" }: PixelatedHammerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const animationClass = animated ? "hammer-swing" : "";

  return (
    <div className={`${sizeClasses[size]} ${animationClass} ${className} pixelated`}>
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Hammer Head */}
        <rect x="8" y="2" width="8" height="6" fill="#8B4513" stroke="#000" strokeWidth="0.5"/>
        <rect x="9" y="3" width="6" height="4" fill="#A0522D"/>
        
        {/* Hammer Handle */}
        <rect x="11" y="8" width="2" height="14" fill="#8B4513" stroke="#000" strokeWidth="0.5"/>
        <rect x="11.5" y="8" width="1" height="14" fill="#A0522D"/>
        
        {/* Handle Grip */}
        <rect x="10" y="18" width="4" height="2" fill="#654321" stroke="#000" strokeWidth="0.3"/>
        <rect x="10.5" y="18.5" width="3" height="1" fill="#8B4513"/>
        
        {/* Sound Block */}
        <rect x="6" y="6" width="4" height="3" fill="#696969" stroke="#000" strokeWidth="0.5"/>
        <rect x="6.5" y="6.5" width="3" height="2" fill="#808080"/>
        
        {/* Pixelated Details */}
        <rect x="9" y="4" width="1" height="1" fill="#654321"/>
        <rect x="13" y="4" width="1" height="1" fill="#654321"/>
        <rect x="11" y="5" width="1" height="1" fill="#654321"/>
        <rect x="13" y="5" width="1" height="1" fill="#654321"/>
      </svg>
    </div>
  );
}
