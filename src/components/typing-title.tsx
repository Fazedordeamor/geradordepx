"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingTitleProps {
  text: string;
  className?: string;
}

const TypingTitle: React.FC<TypingTitleProps> = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        setIsComplete(true);
      }
    }, 100); // Adjust typing speed here

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <h1 className={cn("font-orbitron text-2xl md:text-3xl font-bold text-primary relative", className)}>
      {displayedText}
      <span className={cn(
        "inline-block w-1 h-8 ml-1 bg-primary",
        isComplete ? "animate-blink" : ""
      )}></span>
    </h1>
  );
};

export default TypingTitle;