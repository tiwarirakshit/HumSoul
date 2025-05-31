import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionStep {
  id: number;
  title: string;
  subtitle?: string;
  type: 'options' | 'interests' | 'notifications';
  options?: string[];
  interests?: Array<{
    title: string;
    image: string;
    description?: string;
  }>;
}

const questions: QuestionStep[] = [
  {
    id: 1,
    title: "What best describes your positive affirmation practice?",
    subtitle: "Help us personalize your experience",
    type: "options",
    options: [
      "I'm new to positive affirmations",
      "I practiced in the past",
      "I practice regularly",
      "I never miss a day"
    ]
  },
  {
    id: 2,
    title: "Get reminded to repeat your favorite affirmations",
    subtitle: "People who turn on notifications are 2.5x more likely to achieve their goals",
    type: "notifications"
  },
  {
    id: 3,
    title: "What are your interests?",
    subtitle: "Let's build your personalized affirmation playlist",
    type: "interests",
    interests: [
      {
        title: "Confidence",
        image: "/images/confidence.jpeg",
        description: "Build unshakeable self-confidence"
      },
      {
        title: "Self Love",
        image: "/images/Self-Love.webp",
        description: "Nurture your relationship with yourself"
      },
      {
        title: "Abundance",
        image: "/images/Abundance.jpeg",
        description: "Attract wealth and prosperity"
      },
      {
        title: "Happiness",
        image: "/images/happiness.jpeg",
        description: "Cultivate lasting joy and contentment"
      },
      {
        title: "Health",
        image: "/images/health.webp",
        description: "Enhance your physical and mental wellbeing"
      },
      {
        title: "Motivation",
      image: "/images/motivation.jpg",
        description: "Stay driven and focused on your goals"
      }
    ]
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({});
  const [, setLocation] = useLocation();
  const { completeOnboarding } = useAuth();

  useEffect(() => {
    // Reload the page once when component mounts
    if (!sessionStorage.getItem('onboardingReloaded')) {
      sessionStorage.setItem('onboardingReloaded', 'true');
      window.location.reload();
    }
  }, []);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
      window.location.href = '/';
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestion.id]: [option]
    }));
  };

  const handleInterestSelect = (interest: string) => {
    const currentSelections = selectedOptions[currentQuestion.id] || [];
    const newSelections = currentSelections.includes(interest)
      ? currentSelections.filter(i => i !== interest)
      : [...currentSelections, interest];
    
    setSelectedOptions(prev => ({
      ...prev,
      [currentQuestion.id]: newSelections
    }));
  };

  const isOptionSelected = (option: string) => {
    return selectedOptions[currentQuestion.id]?.includes(option) || false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              HumSoul
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-28 px-6 pb-28 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : index < currentStep 
                        ? 'w-2 bg-primary/50' 
                        : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Question Header */}
            <div className="text-center space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent"
              >
                {currentQuestion.title}
              </motion.h1>
              {currentQuestion.subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  className="text-muted-foreground text-lg max-w-md mx-auto"
                >
                  {currentQuestion.subtitle}
                </motion.p>
              )}
            </div>

            {/* Question Content */}
            <div className="space-y-4 mt-8">
              {currentQuestion.type === 'options' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full p-5 rounded-xl border text-lg transition-all duration-200 ${
                        isOptionSelected(option)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'interests' && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.interests?.map((interest, index) => (
                    <motion.button
                      key={interest.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleInterestSelect(interest.title)}
                      className={`relative aspect-square rounded-xl overflow-hidden group ${
                        isOptionSelected(interest.title)
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                    >
                      <img
                        src={interest.image}
                        alt={interest.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-semibold text-lg">{interest.title}</h3>
                        {interest.description && (
                          <p className="text-sm text-white/70 mt-1">{interest.description}</p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-3xl">🔔</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium">Daily Reminders</h3>
                        <p className="text-muted-foreground mt-1">Get notified at your preferred time</p>
                      </div>
                    </div>
                    <Button variant="outline" size="lg" onClick={handleNext}>Enable</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white h-14 text-lg rounded-xl"
          >
            {currentStep === questions.length - 1 ? (
              'Complete'
            ) : (
              <div className="flex items-center">
                Continue
                <ChevronRight className="ml-2 h-6 w-6" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 