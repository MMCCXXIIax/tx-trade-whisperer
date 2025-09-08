import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Plus, Minus, Play, Save, Copy, Trash2, Settings, Target, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { txApi, Strategy, BacktestResult } from '@/lib/txApi';

interface StrategyCondition {
  id: string;
  type: 'pattern' | 'indicator' | 'price' | 'volume' | 'sentiment';
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'above' | 'below';
  value: string | number;
  logicOperator?: 'AND' | 'OR';
}

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: StrategyCondition[];
  riskManagement: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  performance: {
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
  };
}

export default function StrategyBuilder() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<BacktestResult | null>(null);
  
  // Strategy building form
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [conditions, setConditions] = useState<StrategyCondition[]>([]);
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);
  const [positionSize, setPositionSize] = useState(1000);

  const patterns = [
    'Bullish Engulfing', 'Bearish Engulfing', 'Morning Star', 'Evening Star',
    'Hammer', 'Shooting Star', 'Doji', 'Marubozu', 'Piercing Line', 
    'Dark Cloud Cover', 'Three White Soldiers', 'Three Black Crows'
  ];

  const indicators = ['RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Stochastic'];

  useEffect(() => {
    loadStrategies();
    loadTemplates();
  }, []);

  const loadStrategies = async () => {
    try {
      const response = await txApi.getUserStrategies();
      if (response.success) {
        setStrategies(response.data);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await txApi.getStrategyTemplates();
      if (response.success) {
        setStrategies(response.data);
      }
      
      // Mock templates for demo
      const mockTemplates: StrategyTemplate[] = [
        {
          id: 'template-1',
          name: 'Bullish Pattern Hunter',
          description: 'Detect strong bullish reversal patterns with high confidence',
          category: 'Pattern Recognition',
          conditions: [
            {
              id: '1',
              type: 'pattern',
              operator: 'equals',
              value: 'Bullish Engulfing',
              logicOperator: 'AND'
            },
            {
              id: '2',
              type: 'indicator',
              operator: 'above',
              value: 70,
              logicOperator: 'AND'
            }
          ],
          riskManagement: {
            stopLoss: 5,
            takeProfit: 15,
            positionSize: 1000
          },
          performance: {
            winRate: 78.5,
            avgReturn: 8.2,
            maxDrawdown: -12.3
          }
        },
        {
          id: 'template-2',
          name: 'Sentiment Momentum',
          description: 'Trade based on sentiment shifts and volume confirmation',
          category: 'Sentiment Analysis',
          conditions: [
            {
              id: '1',
              type: 'sentiment',
              operator: 'greater',
              value: 70,
              logicOperator: 'AND'
            },
            {
              id: '2',
              type: 'volume',
              operator: 'above',
              value: 1.5,
              logicOperator: 'AND'
            }
          ],
          riskManagement: {
            stopLoss: 3,
            takeProfit: 8,
            positionSize: 2000
          },
          performance: {
            winRate: 65.2,
            avgReturn: 5.8,
            maxDrawdown: -8.7
          }
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const addCondition = () => {
    const newCondition: StrategyCondition = {
      id: Date.now().toString(),
      type: 'pattern',
      operator: 'equals',
      value: patterns[0],
      logicOperator: conditions.length > 0 ? 'AND' : undefined
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof StrategyCondition, value: any) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const saveStrategy = async () => {
    if (!strategyName.trim()) return;

    const newStrategy: Omit<Strategy, 'id'> = {
      name: strategyName,
      description: strategyDescription,
      patterns: conditions.filter(c => c.type === 'pattern').map(c => c.value as string),
      conditions: conditions,
      isActive: false
    };

    try {
      const response = await txApi.createStrategy(newStrategy);
      if (response.success) {
        setStrategies([...strategies, response.data]);
        setStrategyName('');
        setStrategyDescription('');
        setConditions([]);
        setIsBuilding(false);
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
    }
  };

  const testStrategy = async (strategy: Strategy) => {
    setIsTesting(true);
    try {
      const response = await txApi.backtestStrategy(strategy.id);
      if (response.success) {
        setTestResults(response.data);
      }
    } catch (error) {
      console.error('Error testing strategy:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const useTemplate = (template: StrategyTemplate) => {
    setStrategyName(template.name);
    setStrategyDescription(template.description);
    setConditions(template.conditions);
    setStopLoss(template.riskManagement.stopLoss);
    setTakeProfit(template.riskManagement.takeProfit);
    setPositionSize(template.riskManagement.positionSize);
    setIsBuilding(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Strategy Builder</h2>
          <p className="text-gray-600">Create no-code trading strategies with visual builder</p>
        </div>
        <Button onClick={() => setIsBuilding(!isBuilding)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {isBuilding ? 'Cancel' : 'New Strategy'}
        </Button>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="strategies">My Strategies</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {isBuilding ? (
            <div className="space-y-6">
              {/* Strategy Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Strategy Name</Label>
                      <Input
                        id="name"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        placeholder="Enter strategy name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue="custom">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Strategy</SelectItem>
                          <SelectItem value="pattern">Pattern Recognition</SelectItem>
                          <SelectItem value="sentiment">Sentiment Based</SelectItem>
                          <SelectItem value="technical">Technical Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={strategyDescription}
                      onChange={(e) => setStrategyDescription(e.target.value)}
                      placeholder="Describe your trading strategy"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Conditions Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Trading Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={condition.id} className="border rounded-lg p-4 space-y-3">
                      {index > 0 && (
                        <div className="flex items-center space-x-2">
                          <Select
                            value={condition.logicOperator}
                            onValueChange={(value) => updateCondition(condition.id, 'logicOperator', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Select
                          value={condition.type}
                          onValueChange={(value) => updateCondition(condition.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pattern">Pattern</SelectItem>
                            <SelectItem value="indicator">Indicator</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                            <SelectItem value="sentiment">Sentiment</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="greater">Greater than</SelectItem>
                            <SelectItem value="less">Less than</SelectItem>
                            <SelectItem value="above">Above</SelectItem>
                            <SelectItem value="below">Below</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>

                        {condition.type === 'pattern' ? (
                          <Select
                            value={condition.value as string}
                            onValueChange={(value) => updateCondition(condition.id, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {patterns.map(pattern => (
                                <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : condition.type === 'indicator' ? (
                          <Select
                            value={condition.value as string}
                            onValueChange={(value) => updateCondition(condition.id, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {indicators.map(indicator => (
                                <SelectItem key={indicator} value={indicator}>{indicator}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, 'value', parseFloat(e.target.value))}
                            placeholder="Value"
                          />
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addCondition} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </CardContent>
              </Card>

              {/* Risk Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                      <Input
                        id="stopLoss"
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="takeProfit">Take Profit (%)</Label>
                      <Input
                        id="takeProfit"
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="positionSize">Position Size ($)</Label>
                      <Input
                        id="positionSize"
                        type="number"
                        value={positionSize}
                        onChange={(e) => setPositionSize(parseFloat(e.target.value))}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button onClick={saveStrategy} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Strategy
                </Button>
                <Button variant="outline" onClick={() => setIsBuilding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start Building Your Strategy</h3>
              <p className="text-gray-600 mb-4">Create custom trading strategies with our no-code builder</p>
              <Button onClick={() => setIsBuilding(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Strategy
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                    </div>
                    <Badge variant={strategy.isActive ? "default" : "secondary"}>
                      {strategy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Patterns: {strategy.patterns.length}</p>
                    <div className="flex flex-wrap gap-1">
                      {strategy.patterns.slice(0, 2).map((pattern, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                      {strategy.patterns.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{strategy.patterns.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testStrategy(strategy)}
                      disabled={isTesting}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Clone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{template.performance.winRate}%</div>
                      <div className="text-gray-600">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{template.performance.avgReturn}%</div>
                      <div className="text-gray-600">Avg Return</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{template.performance.maxDrawdown}%</div>
                      <div className="text-gray-600">Max DD</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => useTemplate(template)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Backtest Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testResults.totalReturn.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Total Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResults.winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {testResults.sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Sharpe Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {testResults.maxDrawdown.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Max Drawdown</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
              <p className="text-gray-600">Run a strategy backtest to see results here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}