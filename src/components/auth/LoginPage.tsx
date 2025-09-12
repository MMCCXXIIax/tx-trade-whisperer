import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './AuthProvider';
import { TrendingUp, BarChart3, Target, Zap, Shield, CheckCircle, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = mode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else if (mode === 'signup') {
        setError('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setEmail('demo@tx-trading.com');
    setPassword('demo123456');
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      // For demo purposes, we'll just proceed
      window.location.reload();
    }, 1500);
  };

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Real-time Pattern Detection',
      description: '20+ candlestick patterns with AI confidence scoring'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Backtesting',
      description: 'Test strategies with comprehensive performance metrics'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Smart Entry/Exit Signals',
      description: 'AI-powered trading signals with risk management'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Live Market Alerts',
      description: 'Instant notifications for pattern confirmations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding & Features */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">TX Trading Platform</h1>
                <p className="text-blue-600 font-semibold">Intelligence Made Simple</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Trading Intelligence
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Professional-grade pattern detection, sentiment analysis, and automated trading signals.
            </p>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">Live Alerts</Badge>
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Pattern Detection</Badge>
              <Badge className="bg-purple-100 text-purple-800 px-3 py-1">Backtesting</Badge>
              <Badge className="bg-orange-100 text-orange-800 px-3 py-1">Paper Trading</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg border">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Authentication */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your trading dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'signin' | 'signup')} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    {error && (
                      <div className={`text-sm p-3 rounded-lg ${
                        error.includes('Check your email') 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password</span>
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                    
                    {error && (
                      <div className={`text-sm p-3 rounded-lg ${
                        error.includes('Check your email') 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button 
                onClick={demoLogin}
                variant="outline" 
                className="w-full h-11"
                disabled={loading}
              >
                <User className="h-4 w-4 mr-2" />
                Try Demo Account
              </Button>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure SSL encrypted connection</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}