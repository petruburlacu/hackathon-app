"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HackathonCountdown } from "@/components/HackathonCountdown";
import {
  PersonIcon,
  RocketIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { ReactNode } from "react";

export const HackathonHome = () => {
  return (
    <div className="flex grow flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
      {/* Hero Section */}
      <div className="container mb-20 flex grow flex-col justify-center">
        <div className="text-center mb-16">
          {/* <div className="inline-block px-6 py-3 bg-yellow-400 text-black font-bold text-xl rounded-lg mb-8 transform -rotate-2 shadow-lg hackathon-title">
            🚀 Hackathon 2025 🚀
          </div> */}
          <h1 className="mb-8 mt-16 flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 text-center text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-none tracking-tight text-white px-4">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent hackathon-title">
            &lt;/&gt; TRIAL BY CODE &lt;/&gt;
            </span>
            {/* <span className="text-2xl sm:text-3xl lg:text-5xl text-cyan-300 font-mono countdown-font">
              &lt;/&gt; HACKATHON &lt;/&gt;
            </span> */}
          </h1>
          <div className="mb-12 text-center text-lg sm:text-xl lg:text-2xl text-cyan-200 font-mono hackathon-text px-4">
          Cross-functional teams, fresh ideas, and good vibes 🎮✨
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-16 flex justify-center">
          <div className="w-full max-w-4xl">
            <HackathonCountdown />
          </div>
        </div>

        {/* Features Banner */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-cyan-400/20 mx-4">
          <h2 className="mb-4 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 font-mono hackathon-title">
            FEATURES
          </h2>
          <div className="text-center text-base sm:text-lg text-cyan-200 mb-8 hackathon-text">
            Everything you need for an epic experience
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-black/20 rounded-lg border border-cyan-400/20">
              <div className="mx-auto mb-3 p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center w-12 h-12">
                <RocketIcon className="h-6 w-6" />
              </div>
              <h3 className="text-yellow-400 font-bold hackathon-title text-lg mb-2">Submit Ideas</h3>
              <p className="text-cyan-200 text-sm hackathon-text">Share your ideas and get votes from the community in real-time.</p>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-purple-400/20">
              <div className="mx-auto mb-3 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center w-12 h-12">
                <PersonIcon className="h-6 w-6" />
              </div>
              <h3 className="text-yellow-400 font-bold hackathon-title text-lg mb-2">Form Teams</h3>
              <p className="text-cyan-200 text-sm hackathon-text">Create or join teams of up to 6 people (any mix).</p>
            </div>
            <div className="text-center p-4 bg-black/20 rounded-lg border border-yellow-400/20">
              <div className="mx-auto mb-3 p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center w-12 h-12">
                <StarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-yellow-400 font-bold hackathon-title text-lg mb-2">Vote & Compete</h3>
              <p className="text-cyan-200 text-sm hackathon-text">Vote for your favorite ideas and teams. Track popularity and see who's leading the pack.</p>
            </div>
          </div>
        </div>

        {/* Judging Criteria Section */}
        <div className="mt-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-yellow-400/20 mx-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-yellow-300 mb-6 font-mono">
            JUDGING CRITERIA
          </h3>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <div className="text-center bg-black/20 rounded-lg border border-green-400/20 overflow-hidden">
              <div className="h-6 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">33%</span>
              </div>
              <div className="p-3 sm:p-4">
                <div className="mx-auto mb-3 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-green-400 font-bold hackathon-title text-sm sm:text-base mb-1">Viability of POC</div>
                <div className="text-cyan-200 text-xs sm:text-sm hackathon-text">How well can this idea be built into a working proof of concept?</div>
              </div>
            </div>
            <div className="text-center bg-black/20 rounded-lg border border-blue-400/20 overflow-hidden">
              <div className="h-6 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">33%</span>
              </div>
              <div className="p-3 sm:p-4">
                <div className="mx-auto mb-3 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-blue-400 font-bold hackathon-title text-sm sm:text-base mb-1">Cross-team Collaboration</div>
                <div className="text-cyan-200 text-xs sm:text-sm hackathon-text">How effectively did dev and non-dev team members work together?</div>
              </div>
            </div>
            <div className="text-center bg-black/20 rounded-lg border border-purple-400/20 overflow-hidden">
              <div className="h-6 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">33%</span>
              </div>
              <div className="p-3 sm:p-4">
                <div className="mx-auto mb-3 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="text-purple-400 font-bold hackathon-title text-sm sm:text-base mb-1">Business Alignment</div>
                <div className="text-cyan-200 text-xs sm:text-sm hackathon-text">How well does this solution align with business goals and needs?</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-pink-400/20 mx-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-pink-300 mb-6 font-mono">
            GENERAL RULES
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <RuleCard
              title="Team Formation"
              rules={[
                "Teams can have up to 6 members total",
                "Each person can only join 1 team",
                "Teams must select an idea to be assembled"
              ]}
            />
            <RuleCard
              title="Voting & Awards"
              rules={[
                "Vote for ideas (1 vote per idea)",
                "Vote for teams (only 1 vote per user)",
                "🏆 Judge Awards: 1st place",
                "👥 Audience Choice Award: Most voted team"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Retro Footer */}
      <div className="px-4 sm:px-8 lg:px-20 pb-8 sm:pb-12 lg:pb-20">
        <div className="container">
          <div className="text-center mb-8">
            <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold text-lg sm:text-xl rounded-lg transform rotate-1 shadow-lg">
              READY TO HACK? 🚀
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


function RuleCard({
  title,
  rules,
}: {
  title: string;
  rules: string[];
}) {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-pink-400/20">
      <CardHeader>
        <CardTitle className="text-pink-300 font-mono text-lg hackathon-title">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {rules.map((rule, index) => (
            <li key={index} className="text-cyan-200 text-sm flex items-start hackathon-text">
              <span className="text-yellow-400 mr-2">▶</span>
              {rule}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

