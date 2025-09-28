import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TopBar } from './dashboard/TopBar';
import { TelemetryCards } from './dashboard/TelemetryCards';
import OrientationWindow3D from './dashboard/OrientationWindow3D';
import { TelemetryLog } from './dashboard/TelemetryLog';
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
import { Mountain, Wind, Rocket, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const CanSatDashboard: React.FC = () => {
  const telemetryData = useTelemetry();

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

  // Default data: Orientation (altitude) and Velocity
  const chartData = telemetryData.historicalData.map(data => ({
    timestamp: data.timestamp,
    altitude: data.bmp280.altitude_m,
    velocity: data.bmp280.velocity,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <TopBar
        connectionStatus={telemetryData.connectionStatus}
        batteryPercentage={telemetryData.currentData?.battery_percentage}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Mission Selection Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">CanSat Mission Control Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link to="/mission1">
              <Card className="cursor-pointer hover:bg-gray-800 transition-colors duration-200 border-blue-500 border-2">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Rocket className="h-6 w-6 text-blue-500 mr-2" />
                  <CardTitle className="text-xl text-white">Mission 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Primary Flight - Altitude & Velocity Analysis</p>
                  <p className="text-sm text-gray-400 mt-2">Monitor altitude changes, velocity tracking, and flight dynamics</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/mission2">
              <Card className="cursor-pointer hover:bg-gray-800 transition-colors duration-200 border-green-500 border-2">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Settings className="h-6 w-6 text-green-500 mr-2" />
                  <CardTitle className="text-xl text-white">Mission 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Environmental Monitoring - Sensors Data</p>
                  <p className="text-sm text-gray-400 mt-2">Track temperature, humidity, pressure, and environmental conditions</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Telemetry Cards */}
            <TelemetryCards 
              currentData={telemetryData.currentData}
              connectionStatus={telemetryData.connectionStatus}
            />
            
            {/* Default Charts: Orientation & Velocity */}
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Live Data Overview - Orientation & Velocity</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <ScrollArea className="h-[520px] px-6">
                  <div className="space-y-6 pb-4">
                    {/* Altitude Chart */}
                    <Card className="cansat-card">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <Mountain className="h-5 w-5 cansat-green" />
                          <CardTitle className="text-lg">Altitude vs Time</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
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
                                stroke="hsl(var(--cansat-green))"
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
                        <div className="h-[250px]">
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
                                stroke="hsl(var(--cansat-red))"
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
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* 3D Orientation Window */}
            <OrientationWindow3D 
              orientation={telemetryData.currentData?.mpu6050}
              connectionStatus={telemetryData.connectionStatus}
            />
            
            {/* Telemetry Log */}
            <TelemetryLog logs={telemetryData.logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanSatDashboard;
