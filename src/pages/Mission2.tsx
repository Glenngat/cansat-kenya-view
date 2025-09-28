import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TopBar } from '@/components/dashboard/TopBar';
import { TelemetryCards } from '@/components/dashboard/TelemetryCards';
import OrientationWindow3D from '@/components/dashboard/OrientationWindow3D';
import { TelemetryLog } from '@/components/dashboard/TelemetryLog';
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
import { Thermometer, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const Mission2: React.FC = () => {
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

  const chartData = telemetryData.historicalData.map(data => ({
    timestamp: data.timestamp,
    temperature: data.dht22.temperature,
    humidity: data.dht22.humidity,
    pressure: data.bmp280.pressure_hpa,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <TopBar
        connectionStatus={telemetryData.connectionStatus}
        batteryPercentage={telemetryData.currentData?.battery_percentage}
      />
      
      {/* Mission Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Mission 2 - Environmental Monitoring</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Telemetry Cards */}
            <TelemetryCards 
              currentData={telemetryData.currentData}
              connectionStatus={telemetryData.connectionStatus}
            />
            
            {/* Charts Section with Scroll */}
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Mission 2 Data - Environmental Sensors</CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <ScrollArea className="h-[520px] px-6">
                  <div className="space-y-6 pb-4">
                    {/* Temperature Chart */}
                    <Card className="cansat-card">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-5 w-5 text-orange-500" />
                          <CardTitle className="text-lg">Temperature vs Time</CardTitle>
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
                                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="temperature" 
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                                name="Temperature"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Humidity Chart */}
                    <Card className="cansat-card">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-lg">Humidity vs Time</CardTitle>
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
                                label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="humidity" 
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name="Humidity"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pressure Chart */}
                    <Card className="cansat-card">
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-purple-500" />
                          <CardTitle className="text-lg">Pressure vs Time</CardTitle>
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
                                label={{ value: 'Pressure (hPa)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line 
                                type="monotone" 
                                dataKey="pressure" 
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={false}
                                name="Pressure"
                              />
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

export default Mission2;
