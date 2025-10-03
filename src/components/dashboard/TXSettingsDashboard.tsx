import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Shield, Zap, Database, Moon, Sun, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TXSettingsDashboard() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      alertsEnabled: true,
      emailNotifications: false,
      soundEnabled: true,
      minConfidence: 75
    },
    trading: {
      autoExecute: false,
      maxPositionSize: 1000,
      stopLossEnabled: true,
      defaultStopLoss: 5
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      animationsEnabled: true
    },
    api: {
      scanInterval: 60,
      maxSymbols: 100,
      dataRetention: 30
    }
  });

  const saveSettings = () => {
    toast({ title: 'Settings Saved', description: 'Your preferences have been updated' });
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tx-heading-xl">Settings</h1>
        <p className="text-muted-foreground">Configure your trading platform</p>
      </div>

      {/* Notifications */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-tx-blue" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Manage alert and notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Pattern Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for detected patterns</p>
            </div>
            <Switch
              checked={settings.notifications.alertsEnabled}
              onCheckedChange={(v) => updateSetting('notifications', 'alertsEnabled', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send alerts to your email</p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(v) => updateSetting('notifications', 'emailNotifications', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sound on new alerts</p>
            </div>
            <Switch
              checked={settings.notifications.soundEnabled}
              onCheckedChange={(v) => updateSetting('notifications', 'soundEnabled', v)}
            />
          </div>

          <Separator />

          <div>
            <Label>Minimum Confidence Threshold</Label>
            <p className="text-sm text-muted-foreground mb-2">Only alert patterns above this confidence level</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.notifications.minConfidence}
                onChange={(e) => updateSetting('notifications', 'minConfidence', parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-24"
              />
              <span className="text-sm">%</span>
              <Badge variant="secondary">{settings.notifications.minConfidence}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-tx-orange" />
            <CardTitle>Trading</CardTitle>
          </div>
          <CardDescription>Configure paper trading settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Execute Trades</Label>
              <p className="text-sm text-muted-foreground">Automatically execute paper trades from alerts</p>
            </div>
            <Switch
              checked={settings.trading.autoExecute}
              onCheckedChange={(v) => updateSetting('trading', 'autoExecute', v)}
            />
          </div>

          <Separator />

          <div>
            <Label>Max Position Size</Label>
            <p className="text-sm text-muted-foreground mb-2">Maximum amount per trade</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                type="number"
                value={settings.trading.maxPositionSize}
                onChange={(e) => updateSetting('trading', 'maxPositionSize', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Stop Loss</Label>
              <p className="text-sm text-muted-foreground">Automatically set stop loss on trades</p>
            </div>
            <Switch
              checked={settings.trading.stopLossEnabled}
              onCheckedChange={(v) => updateSetting('trading', 'stopLossEnabled', v)}
            />
          </div>

          {settings.trading.stopLossEnabled && (
            <div>
              <Label>Default Stop Loss</Label>
              <p className="text-sm text-muted-foreground mb-2">Percentage below entry price</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.trading.defaultStopLoss}
                  onChange={(e) => updateSetting('trading', 'defaultStopLoss', parseFloat(e.target.value))}
                  step="0.5"
                  className="w-24"
                />
                <span className="text-sm">%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-tx-purple" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select value={settings.appearance.theme} onValueChange={(v) => updateSetting('appearance', 'theme', v)}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
            </div>
            <Switch
              checked={settings.appearance.compactMode}
              onCheckedChange={(v) => updateSetting('appearance', 'compactMode', v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">Enable UI animations</p>
            </div>
            <Switch
              checked={settings.appearance.animationsEnabled}
              onCheckedChange={(v) => updateSetting('appearance', 'animationsEnabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="tx-terminal-glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-tx-green" />
            <CardTitle>API & Data</CardTitle>
          </div>
          <CardDescription>Configure backend and data settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Scan Interval</Label>
            <p className="text-sm text-muted-foreground mb-2">How often to scan for patterns (seconds)</p>
            <Input
              type="number"
              value={settings.api.scanInterval}
              onChange={(e) => updateSetting('api', 'scanInterval', parseInt(e.target.value))}
              min="10"
              max="300"
              className="w-32"
            />
          </div>

          <Separator />

          <div>
            <Label>Max Monitored Symbols</Label>
            <p className="text-sm text-muted-foreground mb-2">Maximum number of symbols to track</p>
            <Input
              type="number"
              value={settings.api.maxSymbols}
              onChange={(e) => updateSetting('api', 'maxSymbols', parseInt(e.target.value))}
              min="10"
              max="500"
              className="w-32"
            />
          </div>

          <Separator />

          <div>
            <Label>Data Retention</Label>
            <p className="text-sm text-muted-foreground mb-2">Days to keep historical data</p>
            <Select value={String(settings.api.dataRetention)} onValueChange={(v) => updateSetting('api', 'dataRetention', parseInt(v))}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="tx-btn-primary">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}