import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wifi, WifiOff } from 'lucide-react';

interface MQTTConfigProps {
  onConfigChange: (config: {
    brokerUrl: string;
    topics: string[];
    useMockData: boolean;
  }) => void;
  isConnected: boolean;
  error?: string | null;
}

export const MQTTConfig: React.FC<MQTTConfigProps> = ({
  onConfigChange,
  isConnected,
  error
}) => {
  const [brokerUrl, setBrokerUrl] = useState('ws://localhost:8083/mqtt');
  const [topics, setTopics] = useState('cansat/telemetry,cansat/sensors');
  const [useMockData, setUseMockData] = useState(true);

  const handleConnect = () => {
    const topicArray = topics.split(',').map(t => t.trim()).filter(t => t);
    onConfigChange({
      brokerUrl,
      topics: topicArray,
      useMockData: false,
    });
  };

  const handleUseMockData = () => {
    onConfigChange({
      brokerUrl: '',
      topics: [],
      useMockData: true,
    });
    setUseMockData(true);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          MQTT Configuration
        </CardTitle>
        <CardDescription>
          Configure connection to Arduino MQTT broker
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="broker-url">Broker URL</Label>
          <Input
            id="broker-url"
            value={brokerUrl}
            onChange={(e) => setBrokerUrl(e.target.value)}
            placeholder="ws://localhost:8083/mqtt"
            disabled={useMockData}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topics">MQTT Topics (comma-separated)</Label>
          <Input
            id="topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="cansat/telemetry,cansat/sensors"
            disabled={useMockData}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={useMockData || !brokerUrl || !topics}
            className="flex-1"
          >
            Connect to Arduino
          </Button>
          <Button
            onClick={handleUseMockData}
            variant="outline"
            className="flex-1"
          >
            Use Mock Data
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Example Arduino JSON format:</strong></p>
          <pre className="bg-muted p-2 rounded mt-1 text-xs">
{`{
  "temperature": 25.3,
  "pressure": 1013.2,
  "altitude": 500.0,
  "humidity": 65.5,
  "velocity": 12.3,
  "orientation": {
    "pitch": 1.2,
    "roll": 0.5,
    "yaw": 0.0
  }
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};