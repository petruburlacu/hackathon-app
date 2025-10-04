"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cross2Icon, ArrowRightIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface WelcomeTourProps {
  isVisible: boolean;
  onClose: () => void;
  userProgress: {
    hasProfile: boolean;
    hasIdeas: boolean;
    hasTeam: boolean;
    teamHasIdea: boolean;
    isComplete: boolean;
  };
}

const tourSteps = [
  {
    id: "welcome",
    title: "🚀 Welcome to Hackathon 2024!",
    content: "Welcome to our retro-themed hackathon! This tour will guide you through the process of participating in the event.",
    action: "Let's get started!",
    showProgress: false,
  },
  {
    id: "ideas",
    title: "💡 Step 1: Submit Your Ideas",
    content: "Start by submitting innovative ideas that could become hackathon projects. You can submit multiple ideas and vote for others' ideas too!",
    action: "Go to Ideas",
    link: "/hackathon/ideas",
    showProgress: true,
  },
  {
    id: "teams",
    title: "👥 Step 2: Form or Join a Team",
    content: "Once you have ideas, form a team or join an existing one. Teams need 1-2 developers and 1-2 non-developers to be balanced.",
    action: "Go to Teams",
    link: "/hackathon/teams",
    showProgress: true,
  },
  {
    id: "assign",
    title: "🎯 Step 3: Assign an Idea to Your Team",
    content: "Team leaders can assign an idea to their team. This helps teams focus on a specific project and shows what they're working on.",
    action: "Browse Ideas",
    link: "/hackathon/ideas",
    showProgress: true,
  },
  {
    id: "compete",
    title: "🏆 Step 4: Compete and Vote",
    content: "Vote for your favorite ideas and teams! The leaderboard shows which teams are most popular. Good luck!",
    action: "View Leaderboard",
    link: "/hackathon/leaderboard",
    showProgress: true,
  },
];

export function WelcomeTour({ isVisible, onClose, userProgress }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour before
    const hasSeenTour = localStorage.getItem("hackathon-tour-completed");
    if (hasSeenTour) {
      onClose();
    }
  }, [onClose]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hackathon-tour-completed", "true");
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("hackathon-tour-completed", "true");
    onClose();
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const progress = userProgress;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm border-cyan-400/30 max-w-2xl w-full">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-400 font-mono text-2xl">
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded ${
                  index <= currentStep 
                    ? 'bg-yellow-400' 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-400 mt-2">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content */}
          <div className="text-center">
            <p className="text-cyan-200 text-lg leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Progress Checklist */}
          {currentStepData.showProgress && (
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-400/20">
              <h4 className="text-yellow-400 font-bold mb-3 text-center">Your Progress</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`flex items-center gap-2 ${progress.hasIdeas ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${progress.hasIdeas ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                    {progress.hasIdeas ? '✓' : '○'}
                  </div>
                  Submit Ideas
                </div>
                <div className={`flex items-center gap-2 ${progress.hasTeam ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${progress.hasTeam ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                    {progress.hasTeam ? '✓' : '○'}
                  </div>
                  Join Team
                </div>
                <div className={`flex items-center gap-2 ${progress.teamHasIdea ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${progress.teamHasIdea ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                    {progress.teamHasIdea ? '✓' : '○'}
                  </div>
                  Team Idea
                </div>
                <div className={`flex items-center gap-2 ${progress.isComplete ? 'text-green-400' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${progress.isComplete ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}>
                    {progress.isComplete ? '✓' : '○'}
                  </div>
                  Complete
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStepData.link ? (
                <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                  <Link href={currentStepData.link}>
                    {currentStepData.action}
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                >
                  {currentStepData.action}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="text-center bg-green-500/20 border border-green-400/30 rounded-lg p-4">
              <h3 className="text-green-400 font-bold text-lg mb-2">🎉 Tour Complete!</h3>
              <p className="text-cyan-200 mb-4">
                You're all set to participate in the hackathon! Remember to check your progress on the dashboard.
              </p>
              <Button
                onClick={handleComplete}
                className="bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                Start Hacking!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
