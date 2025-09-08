import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TXDashboard from '@/components/dashboard/TXDashboard';
import PatternDetection from '@/components/patterns/PatternDetection';
import TradingInterface from '@/components/trading/TradingInterface';
import BacktestingEngine from '@/components/backtesting/BacktestingEngine';
import SentimentAnalysis from '@/components/sentiment/SentimentAnalysis';
import StrategyBuilder from '@/components/strategy/StrategyBuilder';
import { BarChart3, Target, TrendingUp, Lightbulb, Settings, MessageCircle } from 'lucide-react';

export default function TXMainDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-12 sm:h-16 gap-1">
              <TabsTrigger value="overview" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Patterns</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Trading</span>
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm sm:col-start-1 sm:col-start-auto">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="backtest" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Backtest</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Builder</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
          <TabsContent value="overview">
            <TXDashboard />
          </TabsContent>

          <TabsContent value="patterns">
            <PatternDetection />
          </TabsContent>

          <TabsContent value="trading">
            <TradingInterface />
          </TabsContent>

          <TabsContent value="sentiment">
            <SentimentAnalysis />
          </TabsContent>

          <TabsContent value="backtest">
            <BacktestingEngine />
          </TabsContent>

          <TabsContent value="settings">
            <StrategyBuilder />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}