import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WelcomeProps {
  onComplete: (userData: {
    name: string;
    email: string;
    mode: 'demo' | 'broker';
  }) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mode: '' as 'demo' | 'broker' | ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.mode) {
      onComplete(formData as any);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* TX Logo */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary font-mono tracking-tight">
            TX INTELLIGENCE
          </h1>
          <p className="text-muted-foreground">
            Your AI Trading Co-Pilot
          </p>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            🧠 Powered by GPT-4 Pattern Recognition
          </Badge>
        </div>

        {/* Welcome Form */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Welcome to TX</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Choose your trading mode:</p>
                
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, mode: 'demo'})}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      formData.mode === 'demo' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-primary">📊 Demo Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Paper trading with TradingView charts
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, mode: 'broker'})}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      formData.mode === 'broker' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-primary">🔗 Broker Connection</div>
                    <div className="text-sm text-muted-foreground">
                      Connect your Binance/Interactive Brokers account
                    </div>
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!formData.name || !formData.email || !formData.mode}
              >
                Enter TX Trading Floor →
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">What you'll get:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">🚨 Real-time Alerts</Badge>
            <Badge variant="outline">📈 Pattern Detection</Badge>
            <Badge variant="outline">🔊 Sound Notifications</Badge>
            <Badge variant="outline">📱 Multi-device Sync</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;