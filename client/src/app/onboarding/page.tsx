"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { InterestsStep } from "@/components/onboarding/interests-step";
import { GmailStep } from "@/components/onboarding/gmail-step";
import { CalendarStep } from "@/components/onboarding/calendar-step";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { CompleteStep } from "@/components/onboarding/complete-step";
import { useToast } from "@/hooks/use-toast";

export interface OnboardingData {
  interests: string[];
  gmailConnected: boolean;
  calendarConnected: boolean;
}

const steps = [
  { id: "welcome", title: "Welcome", description: "Get started with Podgenius" },
  { id: "interests", title: "Interests", description: "Choose your topics" },
  { id: "gmail", title: "Gmail", description: "Connect your email" },
  { id: "calendar", title: "Calendar", description: "Sync your schedule" },
  { id: "complete", title: "Complete", description: "You're all set!" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    interests: [],
    gmailConnected: false,
    calendarConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user/onboarding-status', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const data = await response.json();
      
      if (data.completed) {
        router.push('/dashboard');
      } else if (data.step) {
        setCurrentStep(data.step);
        setOnboardingData(data.data || onboardingData);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, [user?.id, router, onboardingData]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user, checkOnboardingStatus]);

  const updateOnboardingData = (key: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const saveProgress = async () => {
    try {
      await fetch('/api/user/onboarding-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          step: currentStep,
          data: onboardingData,
        }),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(onboardingData),
      });
      
      toast({
        title: "Onboarding Complete!",
        description: "Welcome to Podgenius. You're all set to start generating podcasts.",
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      await saveProgress();
    } else {
      await completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return <WelcomeStep />;
      case "interests":
        return (
          <InterestsStep
            interests={onboardingData.interests}
            onInterestsChange={(interests: string[]) => updateOnboardingData('interests', interests)}
          />
        );
      case "gmail":
        return (
          <GmailStep
            connected={onboardingData.gmailConnected}
            onConnectionChange={(connected) => updateOnboardingData('gmailConnected', connected)}
          />
        );
      case "calendar":
        return (
          <CalendarStep
            connected={onboardingData.calendarConnected}
            onConnectionChange={(connected) => updateOnboardingData('calendarConnected', connected)}
          />
        );
      case "complete":
        return <CompleteStep data={onboardingData} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return true;
      case "interests":
        return onboardingData.interests.length > 0;
      case "gmail":
        return true; // Optional step
      case "calendar":
        return true; // Optional step
      case "complete":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to Podgenius</h1>
            <p className="text-muted-foreground">Let&apos;s set up your personalized podcast experience</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      index < currentStep
                        ? "border-green-500 bg-green-500 text-white"
                        : index === currentStep
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 bg-background text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 