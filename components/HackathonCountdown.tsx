"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function HackathonCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Target date: December 8th, 2025 at 10:00 AM UTC (definitely in the future)
    const targetDate = new Date("2025-12-08T10:00:00Z").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) {
    return (
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm border-red-400/30 p-8 rounded-2xl">
        <CardContent className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-red-400 font-mono mb-2">
            HACKATHON STARTED!
          </h2>
          <p className="text-red-200 text-lg">
            The event has begun! Join the action now!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative countdown-pulse">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-xl scale-110"></div>
      
      <Card className="relative bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-sm border-yellow-400/50 p-4 sm:p-8 lg:p-12 rounded-3xl countdown-glow shadow-2xl">
        <CardContent className="text-center">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">⏰</div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-yellow-400 font-mono mb-2 sm:mb-4 retro-gradient-text countdown-font px-2">
            COUNTDOWN TO EVENT
          </h2>
          <p className="text-yellow-200 text-sm sm:text-lg lg:text-2xl mb-6 sm:mb-10 font-mono hackathon-text px-2">
            December 9th, 2025 at 10:00 AM UTC
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-10">
            <TimeUnit value={timeLeft.days} label="DAYS" />
            <TimeUnit value={timeLeft.hours} label="HOURS" />
            <TimeUnit value={timeLeft.minutes} label="MINUTES" />
            <TimeUnit value={timeLeft.seconds} label="SECONDS" />
          </div>
          
          <div className="mt-4 sm:mt-8 text-center">
            <Link href="/hackathon" className="inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm sm:text-lg lg:text-2xl rounded-xl transform -rotate-1 shadow-xl hover:scale-105 transition-all hackathon-title cursor-pointer">
              🚀 Enter Hackathon 🚀
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3 sm:p-4 lg:p-6 hover:border-yellow-400/60 transition-all hover:scale-110 hover:shadow-lg">
      <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-yellow-400 font-mono mb-2 sm:mb-3 retro-glow countdown-font break-words">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-cyan-300 text-xs sm:text-sm lg:text-lg font-mono uppercase tracking-wider hackathon-text">
        {label}
      </div>
    </div>
  );
}
