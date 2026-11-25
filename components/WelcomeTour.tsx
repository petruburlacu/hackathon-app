"use client";

import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
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
  };
}

const tourSteps = [
  {
    id: "welcome",
    title: "🚀 Welcome to the Hackathon!",
    content: "This tour shows how to take part in the event. Just here to vote? You don't need a team, so you can jump straight to voting.",
    action: "Let's get started!",
    showProgress: false,
  },
  {
    id: "ideas",
    title: "💡 Submit your ideas",
    content: "Start by submitting ideas that could become hackathon projects. You can submit several ideas and upvote other people's ideas too.",
    action: "Next: Teams",
    showProgress: true,
  },
  {
    id: "teams",
    title: "👥 Form or join a team",
    content: "Teams can have up to 4 members. A mix of roles is strongly encouraged!",
    action: "Next: Picking an idea",
    showProgress: true,
  },
  {
    id: "assign",
    title: "🎯 Pick an idea for your team",
    content: "Team leaders choose one idea for their team. It shows everyone what the team is working on.",
    action: "Next: Voting",
    showProgress: true,
  },
  {
    id: "voting",
    title: "⭐ Vote",
    content: "Everyone can vote, team or no team. After the submission deadline, open Vote in the header and give 5, 4, 3, 2 and 1 points to your five favourite projects. Upvotes on ideas only help teams pick an idea; they don't count in the vote.",
    action: "Next: Getting around",
    showProgress: false,
  },
  {
    id: "navigation",
    title: "🧭 Getting around",
    content: "Use the navigation bar to move between sections. The Dashboard shows what's happening now, and the menu under your name has your profile settings.",
    action: "Finish tour",
    showProgress: false,
  },
  {
    id: "complete",
    title: "🎉 You're all set!",
    content: "That's everything. Good luck with your projects!",
    action: "Done",
    showProgress: false,
  },
];

const VOTING_STEP = tourSteps.findIndex((step) => step.id === "voting");

export function WelcomeTour({ isVisible, onClose, userProgress }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    localStorage.setItem("hackathon-tour-step", step.toString());
  };

  const handleClose = useCallback(() => {
    localStorage.setItem("hackathon-tour-seen", "true");
    localStorage.setItem("hackathon-tour-step", currentStep.toString());
    onClose();
  }, [currentStep, onClose]);

  useEffect(() => {
    if (isVisible) {
      const savedStep = parseInt(localStorage.getItem("hackathon-tour-step") || "0", 10);
      setCurrentStep(savedStep >= 0 && savedStep < tourSteps.length ? savedStep : 0);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      localStorage.setItem("hackathon-tour-completed", "true");
      localStorage.setItem("hackathon-tour-seen", "true");
      localStorage.removeItem("hackathon-tour-step");
      onClose();
    }
  };

  const getProgressStatus = (stepId: string) => {
    switch (stepId) {
      case "ideas":
        return userProgress.hasIdeas;
      case "teams":
        return userProgress.hasTeam;
      case "assign":
        return userProgress.teamHasIdea;
      default:
        return false;
    }
  };

  const getProgressText = (stepId: string) => {
    switch (stepId) {
      case "ideas":
        return userProgress.hasIdeas ? "Ideas submitted!" : "Submit your ideas";
      case "teams":
        return userProgress.hasTeam ? "Team joined!" : "Join or create a team";
      case "assign":
        return userProgress.teamHasIdea ? "Idea picked!" : "Pick an idea for your team";
      default:
        return "";
    }
  };

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const done = getProgressStatus(currentStepData.id);

  return (
    <Dialog.Root open={isVisible} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-xs z-9999" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-9999 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-400/30 bg-black/90 text-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <Dialog.Title className="text-yellow-400 font-mono text-lg sm:text-xl leading-tight flex-1 font-semibold">
                {currentStepData.title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full p-2 shrink-0"
                  aria-label="Close tour"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
              <div
                className="bg-linear-to-r from-cyan-400 to-yellow-400 h-2 rounded-full transition-[width] duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            <div className="text-sm text-gray-400 mt-2">
              Step {currentStep + 1} of {tourSteps.length}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
            <Dialog.Description className="text-cyan-200 leading-relaxed text-sm sm:text-base">
              {currentStepData.content}
            </Dialog.Description>

            {currentStepData.showProgress && (
              <div className="p-3 sm:p-4 bg-black/40 rounded-lg border border-cyan-400/20">
                <Badge
                  variant="secondary"
                  className={`text-xs sm:text-sm whitespace-normal ${
                    done ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                  }`}
                >
                  {done ? <CheckIcon className="h-3 w-3 mr-1" /> : <span className="mr-1">⏳</span>}
                  {getProgressText(currentStepData.id)}
                </Badge>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50 py-2 text-sm sm:text-base order-2 sm:order-1"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                {currentStep === 0 && (
                  <Button
                    variant="outline"
                    onClick={() => goToStep(VOTING_STEP)}
                    className="border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 py-2 text-sm sm:text-base"
                  >
                    Just voting? Jump to Vote
                  </Button>
                )}
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => goToStep(0)}
                    className="border-gray-400/30 text-gray-400 hover:bg-gray-400/10 py-2 text-sm sm:text-base"
                  >
                    Restart
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className={`font-bold py-3 sm:py-2 text-sm sm:text-base ${
                    isLastStep
                      ? "bg-green-500 hover:bg-green-600 text-white px-4 sm:px-8"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6"
                  }`}
                >
                  <span className="hidden sm:inline">{currentStepData.action}</span>
                  <span className="sm:hidden">{isLastStep ? "Done" : "Next"}</span>
                  {!isLastStep && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-1 sm:gap-2 pt-2 sm:pt-4">
              {tourSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-yellow-400"
                      : index < currentStep
                        ? "bg-green-400"
                        : "bg-gray-600"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                  aria-current={index === currentStep ? "step" : undefined}
                />
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
