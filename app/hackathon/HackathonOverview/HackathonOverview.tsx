"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  StarIcon,
  AvatarIcon,
  BadgeIcon,
} from "@radix-ui/react-icons";
import { Id } from "@/convex/_generated/dataModel";
import type { EventTimes, Phase } from "@/lib/eventPhase";
import { useEventPhase } from "@/lib/useEventPhase";
import { formatUkDayTime } from "@/lib/ukTime";
import { AnnouncementBody } from "@/components/AnnouncementBody";
import { plural } from "@/lib/plural";

interface HackathonUser {
  _id: string;
  userId: string;
  role: "dev" | "non-dev" | "admin";
  companyEmail?: string;
  teamId?: string;
}

// Type for idea object
type Idea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  authorId: Id<"users">;
  createdAt: number;
  votes: number;
  isSelected: boolean;
  category?: string;
  tags?: string[];
};

// Type for team object
type Team = {
  _id: Id<"teams">;
  name: string;
  description?: string;
  leaderId: Id<"users">;
  ideaId?: Id<"ideas">;
  status?: "forming" | "idea-browsing" | "assembled" | "ready";
  isAssembled?: boolean;
  maxDevs: number;
  maxNonDevs: number;
  currentDevs: number;
  currentNonDevs: number;
  createdAt: number;
};

const HERO_TITLE: Record<Phase, string> = {
  before: "Get Ready to Hack!",
  submissions: "The hackathon is on!",
  voting: "Time to vote!",
  closed: "That's a wrap!",
};

function LatestAnnouncement() {
  const announcements = useQuery(api.announcements.list);
  const latest = announcements?.[0];
  if (!latest) return null;

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-yellow-400/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-yellow-400 hackathon-title flex items-center justify-between gap-3 text-lg">
          <span>📌 {latest.title}</span>
          <span className="text-xs font-normal text-gray-400 hackathon-text shrink-0">
            {formatUkDayTime(latest.createdAt)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnnouncementBody body={latest.body} className="text-cyan-100 text-sm hackathon-text line-clamp-4" />
        <Button asChild variant="outline" size="sm" className="border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black hackathon-text">
          <Link href="/hackathon/announcements">
            {announcements.length > 1 ? `See all ${announcements.length} announcements` : "Open the bulletin board"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PhaseHero({
  phase,
  times,
  hasTeam,
}: {
  phase: Phase;
  times: EventTimes;
  hasTeam: boolean;
}) {
  const primary =
    "w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-bold hackathon-title text-base sm:text-lg px-6 py-6";
  const secondary =
    "w-full sm:w-auto border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black hackathon-text";

  let text: string;
  let actions: React.ReactNode;
  switch (phase) {
    case "before":
      text = hasTeam
        ? `The hackathon starts ${formatUkDayTime(times.eventStartAt)}. Before then, browse the ideas and get your team ready.`
        : `The hackathon starts ${formatUkDayTime(times.eventStartAt)}. Taking part? Form or join a team. Just here to vote? You don't need a team: voting opens ${formatUkDayTime(times.submissionsCloseAt)} under Vote.`;
      actions = (
        <>
          <Button asChild className={primary}>
            <Link href={hasTeam ? "/hackathon/my-dashboard" : "/hackathon/teams"}>
              {hasTeam ? "See your team" : "Form or join a team"}
            </Link>
          </Button>
          <Button asChild variant="outline" className={secondary}>
            <Link href="/hackathon/ideas">Browse ideas</Link>
          </Button>
        </>
      );
      break;
    case "submissions":
      text = hasTeam
        ? `Each team writes one submission about what they built. Any team member can write it. Submissions close ${formatUkDayTime(times.submissionsCloseAt)}.`
        : `Teams are building now. You don't need a team to vote: voting opens ${formatUkDayTime(times.submissionsCloseAt)}, and you can read submissions as teams write them.`;
      actions = hasTeam ? (
        <Button asChild className={primary}>
          <Link href="/hackathon/submission">Write your team&apos;s submission</Link>
        </Button>
      ) : (
        <>
          <Button asChild className={primary}>
            <Link href="/hackathon/submissions">Read submissions so far</Link>
          </Button>
          <Button asChild variant="outline" className={secondary}>
            <Link href="/hackathon/teams">Join a team</Link>
          </Button>
        </>
      );
      break;
    case "voting":
      text = `Read the submissions and give your 5, 4, 3, 2 and 1 points to your five favourites. Voting closes ${formatUkDayTime(times.votingClosesAt)}.`;
      actions = (
        <>
          <Button asChild className={primary}>
            <Link href="/hackathon/submissions">
              Vote now: give 5, 4, 3, 2 and 1 points
            </Link>
          </Button>
          <Button asChild variant="outline" className={secondary}>
            <Link href="/hackathon/leaderboard">See the leaderboard</Link>
          </Button>
        </>
      );
      break;
    case "closed":
      text = "Voting has closed. Winners, the judges' favourites and the special prize are announced on Monday.";
      actions = (
        <Button asChild className={primary}>
          <Link href="/hackathon/leaderboard">See the final results</Link>
        </Button>
      );
      break;
  }

  return (
    <Card className="bg-linear-to-br from-yellow-500/25 to-orange-500/20 backdrop-blur-xs border-yellow-400/50">
      <CardContent className="p-5 sm:p-8 text-center space-y-5">
        <p className="text-base sm:text-lg text-cyan-100 hackathon-text">{text}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}

export function HackathonOverview({ hackathonUser }: { hackathonUser: HackathonUser | null | undefined }) {
  const ideas = useQuery(api.hackathon.getIdeas) || [];
  const teams = useQuery(api.hackathon.getTeams) || [];
  const myIdeas = useQuery(api.hackathon.getMyIdeas) || [];
  const myTeamDetails = useQuery(api.hackathon.getMyTeamDetails);
  const myVotesGiven = useQuery(api.hackathon.getMyVotesGiven) || { ideaVotes: 0 };
  const times = useQuery(api.eventClock.getEventTimes);
  const phase = useEventPhase(times);

  if (!hackathonUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20 p-8">
          <CardContent className="text-center">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 hackathon-title">Registration Required</h3>
            <p className="text-cyan-200 mb-4 hackathon-text">
              You need to register for the hackathon to access this dashboard.
            </p>
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold hackathon-title">
              <Link href="/signin">Sign In / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topIdeas = [...ideas].sort((a: Idea, b: Idea) => b.votes - a.votes).slice(0, 3);
  const userTeam = teams.find((team: Team) => team._id === hackathonUser.teamId);
  
  // Determine user state for personalized content
  const hasIdeas = myIdeas.length > 0;
  const hasTeam = !!myTeamDetails;
  const hasVotedForIdeas = myVotesGiven.ideaVotes > 0;
  const hasParticipated = hasIdeas || hasVotedForIdeas; // Combined participation check
  
  // Calculate user progress
  const ideasPhase = phase === "before";
  const userProgress = { hasParticipated, hasTeam };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Personalized Welcome Section */}
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-4 sm:mb-6 hackathon-title">
            {phase ? HERO_TITLE[phase] : "\u00a0"}
          </h1>
          {userTeam && (
            <Badge className="px-4 py-2 text-lg bg-green-500 text-white hackathon-text">
              👥 Team: {userTeam.name}
            </Badge>
          )}
        </div>

        {phase && times && <PhaseHero phase={phase} times={times} hasTeam={hasTeam} />}

        <LatestAnnouncement />

        {ideasPhase && (<>
        {/* Progress Checklist */}
        <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
            <BadgeIcon className="h-5 w-5" /> Your Hackathon Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasParticipated ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasParticipated ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasParticipated ? '✓' : '1'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hackathon-text">Engage With Ideas</div>
                  <div className="text-xs text-gray-400 hackathon-text">
                    {hasParticipated ? 
                      `${hasIdeas ? plural(myIdeas.length, 'idea') : ''}${hasIdeas && hasVotedForIdeas ? ', ' : ''}${hasVotedForIdeas ? plural(myVotesGiven.ideaVotes, 'upvote') : ''}` : 
                      'Not started'
                    }
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${userProgress.hasTeam ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${userProgress.hasTeam ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                  {userProgress.hasTeam ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hackathon-text">Join Team</div>
                  <div className="text-xs text-gray-400 hackathon-text">{hasTeam ? 'Complete' : 'Not started'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20 hover:border-cyan-400/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <StarIcon className="h-5 w-5" /> Ideas Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">{ideas.length}</div>
              <p className="text-gray-400 text-sm hackathon-text">Total ideas in the pool</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20 hover:border-cyan-400/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <AvatarIcon className="h-5 w-5" /> Teams Formed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">{teams.length}</div>
              <p className="text-gray-400 text-sm hackathon-text">Teams ready to compete</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20 hover:border-cyan-400/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2 text-lg">
                <BadgeIcon className="h-5 w-5" /> Idea Upvotes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-cyan-300 hackathon-title mb-2">
                {ideas.reduce((sum: number, idea: Idea) => sum + idea.votes, 0)}
              </div>
              <p className="text-gray-400 text-sm hackathon-text">Upvotes given to ideas</p>
            </CardContent>
          </Card>
        </div>


        </>)}

        {/* Personalized Action Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1">
          {/* Idea voting only matters while teams pick ideas; afterwards it could be mistaken for the hackathon vote. */}
          {ideasPhase && (
          <Card className="bg-linear-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xs border-green-400/30">
            <CardHeader>
              <CardTitle className="text-green-400 hackathon-title flex items-center gap-2">
              <StarIcon className="h-5 w-5" /> Browse & Upvote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-cyan-200 text-sm hackathon-text">
                  {!hasIdeas && !hasTeam ? 
                    "Not ready to participate? You can still browse and upvote ideas!" :
                    "Help teams pick by upvoting ideas!"
                  }
                </p>
                <div className="space-y-2">
                  <Button asChild size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white hackathon-text">
                    <Link href="/hackathon/ideas">Upvote Ideas</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

        </div>


        {/* Top Ideas Preview */}
        {ideasPhase && topIdeas.length > 0 && (
          <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 hackathon-title flex items-center gap-2">
              <StarIcon className="h-5 w-5" /> Top Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {topIdeas.map((idea: Idea, index: number) => (
                  <div key={idea._id} className="bg-black/20 p-4 rounded-lg border border-cyan-400/10">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-yellow-400 hackathon-title text-sm font-bold">#{index + 1}</span>
                      <span className="text-pink-300 text-xs hackathon-text">{plural(idea.votes, "upvote")}</span>
                    </div>
                    <h3 className="text-cyan-300 font-bold mb-2 hackathon-title">{idea.title}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 hackathon-text">{idea.description}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hackathon-text">
                  <Link href="/hackathon/ideas">View All Ideas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
