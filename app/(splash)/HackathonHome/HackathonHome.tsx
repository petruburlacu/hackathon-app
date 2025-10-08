"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HackathonCountdown } from "@/components/HackathonCountdown";
import {
  CodeIcon,
  PersonIcon,
  RocketIcon,
  StarIcon,
  BadgeIcon,
  LightningBoltIcon,
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

        {/* Features Grid */}
        <div className="flex flex-col gap-8 bg-black/20 backdrop-blur-sm p-6 sm:p-8 lg:p-12 rounded-2xl border border-cyan-400/20 mx-4">
          <h2 className="mb-4 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 font-mono hackathon-title">
            FEATURES
          </h2>
          <div className="text-center text-base sm:text-lg text-cyan-200 mb-8 hackathon-text">
            Everything you need for an epic experience
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<RocketIcon className="h-8 w-8" />}
              title="Submit Ideas"
              description="Share your ideas and get votes from the community in real-time."
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<PersonIcon className="h-8 w-8" />}
              title="Form Teams"
              description="Create or join teams with balanced dev/non-dev roles."
              color="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<StarIcon className="h-8 w-8" />}
              title="Vote & Compete"
              description="Vote for your favorite ideas and teams. Track popularity and see who's leading the pack"
              color="from-yellow-500 to-orange-500"
            />
          </div>
        </div>

        {/* Rules Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-pink-400/20 mx-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-pink-300 mb-6 font-mono">
            🎮 GENERAL RULES 🎮
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <RuleCard
              title="Team Formation"
              rules={[
                "Teams need 1-2 Developers",
                "Teams need 1-2 Non-Developers", 
                "Each person can only join 1 team",
                "Teams must select an idea to be assembled"
              ]}
            />
            <RuleCard
              title="Voting System"
              rules={[
                "Vote for ideas (1 vote per idea)",
                "Vote for teams (only 1 vote per user)",
                "Most voted team wins the popularity contest!"
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

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:scale-105">
      <CardHeader className="text-center flex flex-col items-center">
        <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-r ${color} text-white flex items-center justify-center`}>
          {icon}
        </div>
        <CardTitle className="text-yellow-400 font-mono text-xl hackathon-title text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-cyan-200 text-center hackathon-text">{description}</p>
      </CardContent>
    </Card>
  );
}

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
