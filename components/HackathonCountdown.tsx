"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatUkDayTime } from "@/lib/ukTime";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function HackathonCountdown() {
  const times = useQuery(api.eventClock.getEventTimes);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(timer);
  }, []);

  if (times === undefined) return null;

  const difference = times.eventStartAt - now;
  const isExpired = difference <= 0;
  const timeLeft = {
    days: Math.max(0, Math.floor(difference / DAY)),
    hours: Math.max(0, Math.floor((difference % DAY) / HOUR)),
    minutes: Math.max(0, Math.floor((difference % HOUR) / MINUTE)),
    seconds: Math.max(0, Math.floor((difference % MINUTE) / SECOND)),
  };

  if (isExpired) {
    return (
      <Card className="bg-linear-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xs border-red-400/30 p-8 rounded-2xl">
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
      <div className="absolute inset-0 bg-linear-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-xl scale-110"></div>
      
      <Card className="relative bg-linear-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-xs border-yellow-400/50 p-4 sm:p-8 lg:p-12 rounded-3xl countdown-glow shadow-2xl">
        <CardContent className="text-center">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">⏰</div>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-yellow-400 font-mono mb-2 sm:mb-4 retro-gradient-text countdown-font px-2">
            COUNTDOWN TO EVENT
          </h2>
          <p className="text-yellow-200 text-sm sm:text-lg lg:text-2xl mb-6 sm:mb-10 font-mono hackathon-text px-2">
            {formatUkDayTime(times.eventStartAt)} (UK time)
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-10">
            <TimeUnit value={timeLeft.days} label="DAYS" />
            <TimeUnit value={timeLeft.hours} label="HOURS" />
            <TimeUnit value={timeLeft.minutes} label="MINUTES" />
            <TimeUnit value={timeLeft.seconds} label="SECONDS" />
          </div>
          
          <div className="mt-4 sm:mt-8 text-center">
            <Link href="/hackathon" className="inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-bold text-sm sm:text-lg lg:text-2xl rounded-xl transform -rotate-1 shadow-xl hover:scale-105 transition-all hackathon-title cursor-pointer">
              🚀 Hack or vote 🚀
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-black/50 backdrop-blur-xs border border-yellow-400/30 rounded-xl p-3 sm:p-4 lg:p-6 hover:border-yellow-400/60 transition-all hover:scale-110 hover:shadow-lg">
      <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-yellow-400 font-mono mb-2 sm:mb-3 retro-glow countdown-font wrap-break-word">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-cyan-300 text-xs sm:text-sm lg:text-lg font-mono uppercase tracking-wider hackathon-text">
        {label}
      </div>
    </div>
  );
}
