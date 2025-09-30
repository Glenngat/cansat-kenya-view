import React, { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TopBar } from './dashboard/TopBar';
import { TelemetryCards } from './dashboard/TelemetryCards';
import { OrientationWindow } from './dashboard/OrientationWindow';
import { TelemetryLog } from './dashboard/TelemetryLog';
import { MQTTConfig } from './MQTTConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
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
import { Mountain, Wind, Rocket, Settings, ChevronDown, Play, TestTube, Database, Thermometer, Droplets, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const CanSatDashboard: React.FC = () => {
  const [showMQTTConfig, setShowMQTTConfig] = useState(false);
  const [mqttConfig, setMQTTConfig] = useState({
    brokerUrl: 'ws://localhost:8083/mqtt',
    topics: ['cansat/telemetry', 'cansat/sensors'],
    useMockData: true,
  });

  const telemetryData = useTelemetry(mqttConfig);

  const handleMQTTConfigChange = (newConfig: typeof mqttConfig) => {
    setMQTTConfig(newConfig);
    setShowMQTTConfig(false);
  };
  const [activeMission, setActiveMission] = useState<'mission1' | 'mission2'>('mission1');
  
  // Separate selections for each mission
  const [mission1DataTypes, setMission1DataTypes] = useState<string[]>(['altitude', 'velocity']);
  const [mission1Tests, setMission1Tests] = useState<string[]>([]);
  const [mission2DataTypes, setMission2DataTypes] = useState<string[]>(['temperature', 'pressure']);
  const [mission2Tests, setMission2Tests] = useState<string[]>([]);

  // Mission data configuration
  const missionConfigs = {
    mission1: {
      title: "Mission 1 - Primary Flight",
      description: "Altitude & Velocity Analysis",
      dataTypes: [
        { id: 'orientation', label: 'Orientation (Pitch/Roll/Yaw)', icon: '🧭', default: true },
        { id: 'velocity', label: 'Velocity Tracking', icon: '⚡', default: true },
        { id: 'altitude', label: 'Altitude Monitoring', icon: '📏', default: false },
        { id: 'acceleration', label: 'Acceleration Data', icon: '🚀', default: false },
        { id: 'gps', label: 'GPS Coordinates', icon: '🌍', default: false }
      ],
      tests: [
        { id: 'descent_rate', label: 'Descent Rate Analysis', description: 'Monitor parachute deployment effectiveness' },
        { id: 'trajectory', label: 'Flight Trajectory', description: 'Track flight path and stability' },
        { id: 'impact_prediction', label: 'Landing Prediction', description: 'Predict landing zone coordinates' },
        { id: 'stability_test', label: 'Attitude Stability', description: 'Measure orientation stability during flight' }
      ]
    },
    mission2: {
      title: "Mission 2 - Environmental",
      description: "Sensor Data Monitoring",
      dataTypes: [
        { id: 'temperature', label: 'Temperature Sensors', icon: '🌡️', default: true },
        { id: 'humidity', label: 'Humidity Monitoring', icon: '💧', default: false },
        { id: 'pressure', label: 'Atmospheric Pressure', icon: '📊', default: true },
        { id: 'air_quality', label: 'Air Quality Index', icon: '🌬️', default: false },
        { id: 'radiation', label: 'UV Radiation', icon: '☀️', default: false }
      ],
      tests: [
        { id: 'temp_gradient', label: 'Temperature Gradient', description: 'Analyze temperature changes with altitude' },
        { id: 'pressure_calibration', label: 'Pressure Calibration', description: 'Validate pressure sensor accuracy' },
        { id: 'humidity_correlation', label: 'Humidity Correlation', description: 'Correlate humidity with altitude' },
        { id: 'environmental_profile', label: 'Environmental Profile', description: 'Complete atmospheric analysis' }
      ]
    }
  };

  const handleDataTypeToggle = (mission: 'mission1' | 'mission2', dataType: string) => {
    if (mission === 'mission1') {
      setMission1DataTypes(prev => 
        prev.includes(dataType) 
          ? prev.filter(type => type !== dataType)
          : [...prev, dataType]
      );
    } else {
      setMission2DataTypes(prev => 
        prev.includes(dataType) 
          ? prev.filter(type => type !== dataType)
          : [...prev, dataType]
      );
    }
  };

  const handleTestToggle = (mission: 'mission1' | 'mission2', test: string) => {
    if (mission === 'mission1') {
      setMission1Tests(prev => 
        prev.includes(test) 
          ? prev.filter(t => t !== test)
          : [...prev, test]
      );
    } else {
      setMission2Tests(prev => 
        prev.includes(test) 
          ? prev.filter(t => t !== test)
          : [...prev, test]
      );
    }
  };

  // Get current mission's selections
  const currentDataTypes = activeMission === 'mission1' ? mission1DataTypes : mission2DataTypes;
  const currentTests = activeMission === 'mission1' ? mission1Tests : mission2Tests;

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

  // Chart data based on selected data types
  const chartData = telemetryData.historicalData.map(data => ({
    timestamp: data.timestamp,
    altitude: data.bmp280.altitude_m,
    velocity: data.bmp280.velocity,
    temperature: data.dht22.temperature,
    humidity: data.dht22.humidity,
    pressure: data.bmp280.pressure,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground dark">
          <TopBar 
            connectionStatus={telemetryData.connectionStatus}
            missionDuration={telemetryData.getMissionDuration()}
            onExportData={telemetryData.exportData}
            onShowMQTTConfig={() => setShowMQTTConfig(true)}
          />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">CanSat Mission Control Dashboard</h1>
        
        {/* Mission Tabs */}
        <Tabs value={activeMission} onValueChange={(value) => setActiveMission(value as 'mission1' | 'mission2')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-card">
            <TabsTrigger value="mission1" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Mission 1
            </TabsTrigger>
            <TabsTrigger value="mission2" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mission 2
            </TabsTrigger>
          </TabsList>

          {/* Mission 1 Config */}
          <TabsContent value="mission1">
            <Card className="bg-card border-primary">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Mission 1 - Primary Flight
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Altitude & Velocity Analysis - Monitor altitude changes, velocity tracking, and flight dynamics
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data Types Selection */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Types ({mission1DataTypes.length} selected)
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {mission1DataTypes.length > 0 
                          ? mission1DataTypes.map(dt => missionConfigs.mission1.dataTypes.find(d => d.id === dt)?.label).join(', ')
                          : 'Select data types'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-96">
                      <DropdownMenuLabel>Mission 1 Data Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission1.dataTypes.map((dataType) => (
                        <DropdownMenuCheckboxItem
                          key={dataType.id}
                          checked={mission1DataTypes.includes(dataType.id)}
                          onCheckedChange={() => handleDataTypeToggle('mission1', dataType.id)}
                        >
                          <span className="mr-2">{dataType.icon}</span>
                          {dataType.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tests Selection */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Tests ({mission1Tests.length} selected)
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {mission1Tests.length > 0
                          ? mission1Tests.map(t => missionConfigs.mission1.tests.find(test => test.id === t)?.label).join(', ')
                          : 'Select tests'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-96">
                      <DropdownMenuLabel>Mission 1 Tests</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission1.tests.map((test) => (
                        <DropdownMenuCheckboxItem
                          key={test.id}
                          checked={mission1Tests.includes(test.id)}
                          onCheckedChange={() => handleTestToggle('mission1', test.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{test.label}</span>
                            <span className="text-xs text-muted-foreground">{test.description}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mission 2 Config */}
          <TabsContent value="mission2">
            <Card className="bg-card border-primary">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Mission 2 - Environmental Monitoring
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Sensor Data Monitoring - Track temperature, humidity, pressure, and environmental conditions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data Types Selection */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Types ({mission2DataTypes.length} selected)
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {mission2DataTypes.length > 0
                          ? mission2DataTypes.map(dt => missionConfigs.mission2.dataTypes.find(d => d.id === dt)?.label).join(', ')
                          : 'Select data types'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-96">
                      <DropdownMenuLabel>Mission 2 Data Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission2.dataTypes.map((dataType) => (
                        <DropdownMenuCheckboxItem
                          key={dataType.id}
                          checked={mission2DataTypes.includes(dataType.id)}
                          onCheckedChange={() => handleDataTypeToggle('mission2', dataType.id)}
                        >
                          <span className="mr-2">{dataType.icon}</span>
                          {dataType.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tests Selection */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    Tests ({mission2Tests.length} selected)
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {mission2Tests.length > 0
                          ? mission2Tests.map(t => missionConfigs.mission2.tests.find(test => test.id === t)?.label).join(', ')
                          : 'Select tests'}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-96">
                      <DropdownMenuLabel>Mission 2 Tests</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission2.tests.map((test) => (
                        <DropdownMenuCheckboxItem
                          key={test.id}
                          checked={mission2Tests.includes(test.id)}
                          onCheckedChange={() => handleTestToggle('mission2', test.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{test.label}</span>
                            <span className="text-xs text-muted-foreground">{test.description}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 overflow-hidden">
            {/* Telemetry Cards - Filtered */}
            <TelemetryCards 
              currentData={telemetryData.currentData} 
              visibleDataTypes={currentDataTypes}
            />
            
            {/* Dynamic Charts based on selection */}
            {currentDataTypes.length > 0 && (
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {activeMission === 'mission1' ? 'Mission 1' : 'Mission 2'} - Selected Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <ScrollArea className="h-[520px] px-6">
                    <div className="space-y-6 pb-4">
                      {/* Altitude Chart */}
                      {currentDataTypes.includes('altitude') && (
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
                      )}

                      {/* Velocity Chart */}
                      {currentDataTypes.includes('velocity') && (
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
                      )}

                      {/* Temperature Chart */}
                      {currentDataTypes.includes('temperature') && (
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
                                    stroke="hsl(var(--chart-1))"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Temperature"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Humidity Chart */}
                      {currentDataTypes.includes('humidity') && (
                        <Card className="cansat-card">
                          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <div className="flex items-center space-x-2">
                              <Droplets className="h-5 w-5 text-blue-500" />
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
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Humidity"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Pressure Chart */}
                      {currentDataTypes.includes('pressure') && (
                        <Card className="cansat-card">
                          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <div className="flex items-center space-x-2">
                              <Gauge className="h-5 w-5 cansat-green" />
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
                                    stroke="hsl(var(--chart-3))"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Pressure"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6 h-full overflow-hidden flex flex-col">
            {/* 3D Orientation Window */}
            <div className="flex-shrink-0">
              <OrientationWindow
                orientation={telemetryData.currentData?.mpu6050}
                connectionStatus={telemetryData.connectionStatus}
              />
            </div>
            
            {/* Telemetry Log - Takes remaining height */}
            <div className="flex-1 min-h-0">
              <TelemetryLog logs={telemetryData.logs} />
            </div>
          </div>
        </div>
      </div>

      {/* MQTT Configuration Dialog */}
      {showMQTTConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-1 max-w-md w-full">
            <MQTTConfig
              onConfigChange={handleMQTTConfigChange}
              isConnected={telemetryData.isConnectedToMQTT}
              error={telemetryData.mqttError}
            />
            <div className="flex justify-end mt-4 px-6 pb-6">
              <Button variant="outline" onClick={() => setShowMQTTConfig(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanSatDashboard;
