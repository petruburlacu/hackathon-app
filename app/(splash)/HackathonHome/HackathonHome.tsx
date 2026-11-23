"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HackathonCountdown } from "@/components/HackathonCountdown";
import { PersonIcon, RocketIcon, StarIcon } from "@radix-ui/react-icons";
import { MAX_TEAM_SIZE } from "@/lib/event";
import Link from "next/link";
import { ReactNode } from "react";

type ScheduleItem = { time: string; text: string };

const SCHEDULE: {
  day: string;
  title: string;
  travel?: boolean;
  items: ScheduleItem[];
}[] = [
  {
    day: "Tue 1 Dec",
    title: "Travel day",
    travel: true,
    items: [{ time: "", text: "For anyone who needs to travel in." }],
  },
  {
    day: "Wed 2 Dec",
    title: "Day one",
    items: [
      {
        time: "9:30am",
        text: "Please aim to arrive by now. New to the office? Come in as early as you like to get settled.",
      },
      {
        time: "10:00am",
        text: "🏁 Hackathon kicks off! Teams start work on their ideas.",
      },
      {
        time: "All day",
        text: "Hacking continues. Lunch and snacks provided.",
      },
      {
        time: "Evening",
        text: "🍕 Optional pizza party in the office. Relax and socialise, or keep hacking if you're on a roll.",
      },
    ],
  },
  {
    day: "Thu 3 Dec",
    title: "Day two",
    items: [
      { time: "Morning", text: "Teams continue working on their ideas." },
      {
        time: "4:00pm",
        text: "⏰ Submission deadline. All projects must be submitted.",
      },
      { time: "After", text: "A brief wrap-up session." },
      { time: "Evening", text: "🎉 Party at Boom Bar!" },
    ],
  },
  {
    day: "Fri 4 Dec",
    title: "Travel day",
    travel: true,
    items: [
      {
        time: "",
        text: "You're welcome to work from the office before heading home.",
      },
    ],
  },
];

export const HackathonHome = () => {
  return (
    <div className="flex grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
      <div className="container mb-20 flex grow flex-col justify-center">
        <div className="text-center mb-16">
          <h1 className="mb-8 mt-16 flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 text-center text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-none tracking-tight text-white px-4">
            <span className="bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent hackathon-title">
              &lt;/&gt; TRIAL BY CODE &lt;/&gt;
            </span>
          </h1>
          <div className="mb-4 text-center text-xl sm:text-2xl lg:text-3xl text-yellow-300 font-bold hackathon-title px-4">
            Opus 2 Hackathon 2026 · Wed 2 – Thu 3 December
          </div>
          <div className="mb-12 text-center text-lg sm:text-xl lg:text-2xl text-cyan-200 font-mono hackathon-text px-4">
            Two days of building, learning and working with colleagues from
            across the business, with some food and fun along the way 🎮✨
          </div>
        </div>

        <div className="mb-16 flex justify-center">
          <div className="w-full max-w-4xl">
            <HackathonCountdown />
          </div>
        </div>

        <Section
          title="BEFORE THE EVENT"
          subtitle="Three things to do before 2 December"
          className="from-cyan-500/20 to-blue-500/20 border-cyan-400/20"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              icon={<PersonIcon className="h-6 w-6" />}
              gradient="from-blue-500 to-cyan-500"
              title="1. Sign up"
            >
              <Link
                href="/signin"
                className="text-yellow-300 underline underline-offset-2 hover:text-yellow-400"
              >
                Create your account
              </Link>{" "}
              on this site.
            </StepCard>
            <StepCard
              icon={<StarIcon className="h-6 w-6" />}
              gradient="from-purple-500 to-pink-500"
              title="2. Share ideas"
            >
              Submit your ideas and browse what others have suggested.
            </StepCard>
            <StepCard
              icon={<RocketIcon className="h-6 w-6" />}
              gradient="from-yellow-500 to-orange-500"
              title="3. Form your team"
            >
              Teams of up to {MAX_TEAM_SIZE}. Mix your roles: some of the best
              ideas come from combining different skills and perspectives.
            </StepCard>
          </div>
        </Section>

        <Section
          title="SCHEDULE"
          subtitle="All times UK"
          className="mt-16 from-purple-500/20 to-indigo-500/20 border-purple-400/20"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SCHEDULE.map((day) => (
              <Card
                key={day.day}
                className={`bg-black/40 backdrop-blur-xs ${day.travel ? "border-gray-400/20" : "border-yellow-400/40"}`}
              >
                <CardHeader className="pb-3">
                  <div className="text-xs uppercase tracking-wider text-cyan-300 hackathon-text">
                    {day.day}
                  </div>
                  <CardTitle
                    className={`hackathon-title text-lg ${day.travel ? "text-gray-300" : "text-yellow-400"}`}
                  >
                    {day.travel ? "✈️ " : ""}
                    {day.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {day.items.map((item) => (
                      <li key={item.text} className="text-sm hackathon-text">
                        {item.time && (
                          <div className="text-pink-300 font-bold">
                            {item.time}
                          </div>
                        )}
                        <div className="text-cyan-100">{item.text}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="🏆 JUDGING: NEW FOR 2026"
          subtitle="More than one way to be recognised"
          className="mt-16 from-yellow-500/20 to-orange-500/20 border-yellow-400/30"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard title="Submit">
              Each team writes up its project here and links its GitHub repo,
              with:
              <ul className="mt-2 space-y-1">
                <li>📄 Documentation</li>
                <li>💡 An explanation of your solution</li>
                <li>🎥 A demonstration video</li>
              </ul>
            </InfoCard>
            <InfoCard title="Vote">
              After the event, everyone at Opus 2 has a few days to review the
              submissions and vote for their favourites. Our judges vote too,
              and also pick their own favourites, which may differ from the
              overall winners.
            </InfoCard>
            <InfoCard title="Prizes">
              Prizes for the 🥇 1st, 🥈 2nd and 🥉 3rd placed teams, plus a ✨
              special prize ✨ up for grabs 👀
            </InfoCard>
          </div>
        </Section>

        <div className="mt-16 bg-linear-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-xs p-6 sm:p-8 rounded-2xl border border-pink-400/20 mx-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-pink-300 mb-6 font-mono">
            GENERAL RULES
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <RuleCard
              title="Team Formation"
              rules={[
                `Teams can have up to ${MAX_TEAM_SIZE} members`,
                "A mix of roles in each team is strongly encouraged",
                "Each person can only join 1 team",
                "Teams must select an idea to be assembled",
              ]}
            />
            <RuleCard
              title="Voting"
              rules={[
                "Before the event: vote for the ideas you like (1 vote per idea)",
                "After the event: give 5, 4, 3, 2 and 1 points to your five favourite submissions",
              ]}
            />
          </div>
        </div>

        <div className="mt-16 mx-4 text-center bg-black/30 border border-cyan-400/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 hackathon-title mb-2">
            🏨 Accommodation
          </h3>
          <p className="text-cyan-200 hackathon-text">
            Travelling in? You&apos;ll be staying at the YOTEL, just around the
            corner from the office.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-20 pb-8 sm:pb-12 lg:pb-20">
        <div className="container">
          <div className="text-center mb-8">
            <Link
              href="/hackathon"
              className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-yellow-400 to-pink-500 text-black font-bold text-lg sm:text-xl rounded-lg transform rotate-1 shadow-lg"
            >
              READY TO HACK? 🚀
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function Section({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`bg-linear-to-r backdrop-blur-xs p-6 sm:p-8 rounded-2xl border mx-4 ${className}`}
    >
      <h2 className="mb-4 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 font-mono hackathon-title">
        {title}
      </h2>
      <div className="text-center text-base sm:text-lg text-cyan-200 mb-8 hackathon-text">
        {subtitle}
      </div>
      {children}
    </section>
  );
}

function StepCard({
  icon,
  gradient,
  title,
  children,
}: {
  icon: ReactNode;
  gradient: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="text-center p-4 bg-black/20 rounded-lg border border-cyan-400/20">
      <div
        className={`mx-auto mb-3 p-3 rounded-full bg-linear-to-r ${gradient} text-white flex items-center justify-center w-12 h-12`}
      >
        {icon}
      </div>
      <h3 className="text-yellow-400 font-bold hackathon-title text-lg mb-2">
        {title}
      </h3>
      <p className="text-cyan-200 text-sm hackathon-text">{children}</p>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="bg-black/40 backdrop-blur-xs border-yellow-400/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-yellow-400 hackathon-title text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-cyan-200 text-sm hackathon-text">
        {children}
      </CardContent>
    </Card>
  );
}

function RuleCard({ title, rules }: { title: string; rules: string[] }) {
  return (
    <Card className="bg-black/40 backdrop-blur-xs border-pink-400/20">
      <CardHeader>
        <CardTitle className="text-pink-300 font-mono text-lg hackathon-title">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li
              key={rule}
              className="text-cyan-200 text-sm flex items-start hackathon-text"
            >
              <span className="text-yellow-400 mr-2">▶</span>
              {rule}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
