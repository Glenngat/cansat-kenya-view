import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TelemetryData } from '@/types/telemetry';
import { Mountain, Wind, Thermometer } from 'lucide-react';

interface ChartsSectionProps {
  historicalData: TelemetryData[];
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    minute: '2-digit',
    second: '2-digit'
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">
          {new Date(label).toLocaleTimeString()}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)} {entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({ historicalData }) => {
  const chartData = historicalData.map(data => ({
    timestamp: data.timestamp,
    altitude: data.bmp280.altitude_m,
    velocity: data.bmp280.velocity,
    temperature: data.dht22.temperature,
  }));

  const chartConfig = {
    altitude: {
      color: 'hsl(var(--cansat-green))',
    },
    velocity: {
      color: 'hsl(var(--cansat-red))',
    },
    temperature: {
      color: '#f59e0b',
    },
  };

  return (
    <div className="space-y-6">
      {/* Altitude Chart */}
      <Card className="cansat-card">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Mountain className="h-5 w-5 cansat-green" />
            <CardTitle className="text-lg">Altitude vs Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="altitude" 
                  stroke={chartConfig.altitude.color}
                  strokeWidth={2}
                  dot={false}
                  name="Altitude"
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Velocity Chart */}
      <Card className="cansat-card">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Wind className="h-5 w-5 cansat-red" />
            <CardTitle className="text-lg">Velocity vs Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke={chartConfig.velocity.color}
                  strokeWidth={2}
                  dot={false}
                  name="Velocity"
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Temperature Chart */}
      <Card className="cansat-card">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Temperature vs Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke={chartConfig.temperature.color}
                  strokeWidth={2}
                  dot={false}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};