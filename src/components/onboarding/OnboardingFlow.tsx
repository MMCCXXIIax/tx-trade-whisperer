import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, BarChart3, Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to TX Intelligence',
    description: 'AI-powered trading intelligence platform',
    icon: Zap,
    content: 'Discover market patterns, execute paper trades, and build winning strategies with real-time data.',
  },
  {
    title: 'Pattern Detection',
    description: 'AI identifies trading opportunities',
    icon: Target,
    content: 'Our ML models scan markets 24/7 to detect high-probability trading patterns with confidence scores.',
  },
  {
    title: 'Paper Trading',
    description: 'Practice risk-free trading',
    icon: TrendingUp,
    content: 'Execute trades with real market data in a simulated environment. Track performance and refine your strategy.',
  },
  {
    title: 'Performance Analytics',
    description: 'Track and optimize results',
    icon: BarChart3,
    content: 'Comprehensive backtesting, win rates, and portfolio analytics help you make data-driven decisions.',
  },
];

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            onboarding_step: steps.length 
          })
          .eq('id', user.id);
      }
      onComplete();
      toast({
        title: 'Welcome aboard! 🎉',
        description: "You're all set to start trading with TX Intelligence.",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
          </div>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Icon className="h-8 w-8 text-primary" />
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />

          <Card className="p-6 bg-muted/50">
            <p className="text-lg leading-relaxed">{currentStepData.content}</p>
          </Card>

          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
