"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cross2Icon, ArrowRightIcon, ArrowLeftIcon, CheckIcon } from "@radix-ui/react-icons";

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
    action: "Next: Learn about Teams",
    showProgress: true,
  },
  {
    id: "teams",
    title: "👥 Step 2: Form or Join a Team",
    content: "Once you have ideas, form a team or join an existing one. Teams need 1-2 developers and 1-2 non-developers to be balanced.",
    action: "Next: Learn about Idea Assignment",
    showProgress: true,
  },
  {
    id: "assign",
    title: "🎯 Step 3: Assign an Idea to Your Team",
    content: "Team leaders can assign an idea to their team. This helps teams focus on a specific project and shows what they're working on.",
    action: "Next: Learn about Voting",
    showProgress: true,
  },
  {
    id: "voting",
    title: "⭐ Step 4: Vote for Teams",
    content: "Once teams are formed and have ideas, you can vote for your favorite teams on the leaderboard. Each person gets one vote per team.",
    action: "Next: Learn about Navigation",
    showProgress: true,
  },
  {
    id: "navigation",
    title: "🧭 Navigation Tips",
    content: "Use the navigation bar to move between sections. Your personal dashboard shows your progress, and the user menu contains your profile settings.",
    action: "Next: Learn about Your Progress",
    showProgress: true,
  },
  {
    id: "progress",
    title: "📊 Track Your Progress",
    content: "Check your progress in the personalized dashboard. Complete all steps to be fully ready for the hackathon!",
    action: "Complete Tour",
    showProgress: true,
  },
  {
    id: "complete",
    title: "🎉 Tour Complete!",
    content: "You're all set! You now know how to navigate the hackathon platform. Good luck with your projects!",
    action: "Start Hackathon",
    showProgress: false,
  },
];

export function WelcomeTour({ isVisible, onClose, userProgress }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish tour - mark as completed and close
      setIsCompleted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem("hackathon-tour-completed", "true");
      }
      onClose(); // Close the tour
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (!isCompleted) {
      if (typeof window !== 'undefined') {
        localStorage.setItem("hackathon-tour-completed", "true");
      }
    }
    onClose();
  };

  const getProgressStatus = (stepId: string) => {
    switch (stepId) {
      case "ideas":
        return userProgress.hasIdeas;
      case "teams":
        return userProgress.hasTeam;
      case "assign":
        return userProgress.teamHasIdea;
      case "voting":
        return userProgress.isComplete;
      default:
        return false;
    }
  };

  const getProgressText = (stepId: string) => {
    switch (stepId) {
      case "ideas":
        return userProgress.hasIdeas ? "✅ Ideas submitted!" : "⏳ Submit your ideas";
      case "teams":
        return userProgress.hasTeam ? "✅ Team joined!" : "⏳ Join or create a team";
      case "assign":
        return userProgress.teamHasIdea ? "✅ Idea assigned!" : "⏳ Assign an idea to your team";
      case "voting":
        return userProgress.isComplete ? "✅ Ready to vote!" : "⏳ Complete previous steps";
      default:
        return "";
    }
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/90 border-cyan-400/30 text-white">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-yellow-400 font-mono text-xl">
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div
              className="bg-gradient-to-r from-cyan-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
          
          {/* Step Counter */}
          <div className="text-sm text-gray-400 mt-2">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Content */}
          <div className="text-cyan-200 leading-relaxed">
            {currentStepData.content}
          </div>

          {/* Progress Status for Current Step */}
          {currentStepData.showProgress && (
            <div className="p-4 bg-black/40 rounded-lg border border-cyan-400/20">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${
                    getProgressStatus(currentStepData.id) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-black'
                  }`}
                >
                  {getProgressStatus(currentStepData.id) ? (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <span className="mr-1">⏳</span>
                  )}
                  {getProgressText(currentStepData.id)}
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="border-gray-400/30 text-gray-400 hover:bg-gray-400/10"
                >
                  Restart
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className={`font-bold ${
                  isLastStep 
                    ? 'bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                }`}
              >
                {isLastStep ? "🎉 Start Hackathon!" : currentStepData.action}
                {!isLastStep && <ArrowRightIcon className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 pt-4">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-yellow-400'
                    : index < currentStep
                    ? 'bg-green-400'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}