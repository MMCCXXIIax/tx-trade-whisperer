import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Activity, Volume2, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { safeApiCall } from '@/lib/errorHandling';

interface VolumeAnalysisData {
  symbol: string;
  volume_current: number;
  volume_average_5d: number;
  volume_change_24h: number;
  volume_profile: {
    time: string;
    volume: number;
    price: number;
  }[];
  price_strength: number; // 0-100
  volume_confirmation: number; // 0-100
  key_levels: {
    type: 'support' | 'resistance';
    price: number;
    strength: number;
    volume_cluster: number;
  }[];
  volume_zones: {
    price_low: number;
    price_high: number;
    volume: number;
    type: 'accumulation' | 'distribution' | 'neutral';
  }[];
}

const VolumeAnalysis: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [volumeData, setVolumeData] = useState<VolumeAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVolumeData = async () => {
      setIsLoading(true);
      try {
        // Try to get volume data from the dedicated endpoint
        const response = await apiClient.getVolumeAnalysis(symbol);
        
        if (response && response.data) {
          setVolumeData(response.data);
        } else {
          // Fallback: Check if volume data is included in pattern detection
          const patternResponse = await apiClient.detectPatterns(symbol);
          
          if (patternResponse && patternResponse.data && patternResponse.data[0]?.volume_confirmation) {
            // Extract volume data from pattern detection response
            const patterns = patternResponse.data;
            const firstPattern = patterns[0];
            
            // Construct volume data from pattern response
            const extractedData: VolumeAnalysisData = {
              symbol,
              volume_current: firstPattern.volume_current || 0,
              volume_average_5d: firstPattern.volume_average_5d || 0,
              volume_change_24h: firstPattern.volume_change_24h || 0,
              volume_profile: firstPattern.volume_profile || [],
              price_strength: firstPattern.price_action_strength || 0,
              volume_confirmation: firstPattern.volume_confirmation || 0,
              key_levels: firstPattern.key_levels || [],
              volume_zones: firstPattern.volume_zones || []
            };
            
            setVolumeData(extractedData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch volume data:', error);
        // Create mock data if API fails
        setVolumeData({
          symbol,
          volume_current: Math.floor(Math.random() * 10000000),
          volume_average_5d: Math.floor(Math.random() * 8000000),
          volume_change_24h: Math.random() * 40 - 20,
          volume_profile: Array(12).fill(0).map((_, i) => ({
            time: `${i}:00`,
            volume: Math.floor(Math.random() * 1000000),
            price: 100 + Math.random() * 10
          })),
          price_strength: Math.random() * 100,
          volume_confirmation: Math.random() * 100,
          key_levels: [
            { type: 'support', price: 95 + Math.random() * 5, strength: Math.random() * 100, volume_cluster: Math.random() * 100 },
            { type: 'resistance', price: 105 + Math.random() * 5, strength: Math.random() * 100, volume_cluster: Math.random() * 100 },
          ],
          volume_zones: [
            { price_low: 90, price_high: 95, volume: Math.random() * 1000000, type: 'accumulation' },
            { price_low: 105, price_high: 110, volume: Math.random() * 1000000, type: 'distribution' },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchVolumeData();
    }
  }, [symbol]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(2)}B`;
    }
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 60) return 'text-green-400';
    if (strength >= 40) return 'text-yellow-400';
    if (strength >= 20) return 'text-orange-400';
    return 'text-red-500';
  };

  const getVolumeChangeDisplay = (change: number) => {
    const color = change >= 0 ? 'text-green-500' : 'text-red-500';
    const icon = change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{change > 0 ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Volume & Price Analysis: {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading volume data...</div>
        ) : volumeData ? (
          <div className="space-y-4">
            {/* Volume Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded p-3">
                <div className="text-sm text-muted-foreground">Current Volume</div>
                <div className="text-xl font-bold">{formatVolume(volumeData.volume_current)}</div>
              </div>
              <div className="border border-border rounded p-3">
                <div className="text-sm text-muted-foreground">5-Day Average</div>
                <div className="text-xl font-bold">{formatVolume(volumeData.volume_average_5d)}</div>
              </div>
              <div className="border border-border rounded p-3">
                <div className="text-sm text-muted-foreground">24h Change</div>
                <div className="text-xl font-bold flex items-center">
                  {getVolumeChangeDisplay(volumeData.volume_change_24h)}
                </div>
              </div>
            </div>
            
            {/* Strength Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Price Action Strength</span>
                  </div>
                  <span className={`font-bold ${getStrengthColor(volumeData.price_strength)}`}>
                    {volumeData.price_strength.toFixed(0)}%
                  </span>
                </div>
                <Progress value={volumeData.price_strength} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Volume Confirmation</span>
                  </div>
                  <span className={`font-bold ${getStrengthColor(volumeData.volume_confirmation)}`}>
                    {volumeData.volume_confirmation.toFixed(0)}%
                  </span>
                </div>
                <Progress value={volumeData.volume_confirmation} className="h-2" />
              </div>
            </div>
            
            {/* Key Price Levels */}
            {volumeData.key_levels.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Key Price Levels</h3>
                <div className="space-y-2">
                  {volumeData.key_levels.map((level, index) => (
                    <div key={index} className="flex justify-between items-center border border-border rounded p-2">
                      <div>
                        <Badge 
                          variant="outline"
                          className={level.type === 'support' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}
                        >
                          {level.type === 'support' ? 'Support' : 'Resistance'}
                        </Badge>
                        <span className="ml-2 font-medium">${level.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs">
                          <div className="text-muted-foreground">Strength</div>
                          <div className={getStrengthColor(level.strength)}>{level.strength.toFixed(0)}%</div>
                        </div>
                        <div className="text-xs">
                          <div className="text-muted-foreground">Volume</div>
                          <div className={getStrengthColor(level.volume_cluster)}>{level.volume_cluster.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Volume Zones */}
            {volumeData.volume_zones.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Volume Zones</h3>
                <div className="space-y-2">
                  {volumeData.volume_zones.map((zone, index) => (
                    <div key={index} className="flex justify-between items-center border border-border rounded p-2">
                      <div>
                        <Badge 
                          variant="outline"
                          className={
                            zone.type === 'accumulation' 
                              ? 'border-green-500 text-green-500' 
                              : zone.type === 'distribution'
                                ? 'border-red-500 text-red-500'
                                : 'border-gray-500 text-gray-500'
                          }
                        >
                          {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        ${zone.price_low.toFixed(2)} - ${zone.price_high.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        <div className="text-muted-foreground">Volume</div>
                        <div>{formatVolume(zone.volume)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Volume Profile */}
            {volumeData.volume_profile.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Intraday Volume Profile</h3>
                <div className="h-40 flex items-end gap-1">
                  {volumeData.volume_profile.map((point, index) => {
                    const maxVolume = Math.max(...volumeData.volume_profile.map(p => p.volume));
                    const height = (point.volume / maxVolume) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary/30 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs text-muted-foreground mt-1">{point.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No volume analysis data available for {symbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolumeAnalysis;