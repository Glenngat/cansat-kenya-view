import React, { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TopBar } from './dashboard/TopBar';
import { TelemetryCards } from './dashboard/TelemetryCards';
import OrientationWindow3D from './dashboard/OrientationWindow3D';
import { TelemetryLog } from './dashboard/TelemetryLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Mountain, Wind, Rocket, Settings, ChevronDown, Play, TestTube, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const CanSatDashboard: React.FC = () => {
  const telemetryData = useTelemetry();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['orientation', 'velocity']);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

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

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const handleTestToggle = (test: string) => {
    setSelectedTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const startMission = (missionId: string) => {
    console.log(`Starting ${missionId} with data types:`, selectedDataTypes, 'and tests:', selectedTests);
    // Navigate to mission page with selected parameters
    window.location.href = `/${missionId}?data=${selectedDataTypes.join(',')}&tests=${selectedTests.join(',')}`;
  };

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
        missionStatus={telemetryData.missionStatus}
        onExportData={telemetryData.exportData}
        missionDuration={telemetryData.getMissionDuration()}
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Mission Selection Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">CanSat Mission Control Dashboard</h1>
          
          {/* Current Selection Status */}
          {(selectedDataTypes.length > 0 || selectedTests.length > 0) && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-2">Current Selection</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Data Types:</span>
                  {selectedDataTypes.map(type => (
                    <Badge key={type} variant="outline" className="text-blue-400 border-blue-400">
                      {type}
                    </Badge>
                  ))}
                </div>
                {selectedTests.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">Tests:</span>
                    {selectedTests.map(test => (
                      <Badge key={test} variant="outline" className="text-green-400 border-green-400">
                        {test.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mission 1 Card */}
            <Card className="bg-gray-900 border-blue-500 border-2">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Rocket className="h-6 w-6 text-blue-500 mr-2" />
                <CardTitle className="text-xl text-white">Mission 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-300">Primary Flight - Altitude & Velocity Analysis</p>
                  <p className="text-sm text-gray-400 mt-1">Monitor altitude changes, velocity tracking, and flight dynamics</p>
                </div>
                
                {/* Data Types Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    Select Data Types
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-600 text-white">
                        {selectedDataTypes.length} data types selected
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
                      <DropdownMenuLabel className="text-white">Mission 1 Data Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission1.dataTypes.map((dataType) => (
                        <DropdownMenuCheckboxItem
                          key={dataType.id}
                          checked={selectedDataTypes.includes(dataType.id)}
                          onCheckedChange={() => handleDataTypeToggle(dataType.id)}
                          className="text-white hover:bg-gray-700"
                        >
                          <span className="mr-2">{dataType.icon}</span>
                          {dataType.label}
                          {dataType.default && <Badge variant="secondary" className="ml-auto">Default</Badge>}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tests Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <TestTube className="h-4 w-4 mr-1" />
                    Select Tests
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-600 text-white">
                        {selectedTests.length} tests selected
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
                      <DropdownMenuLabel className="text-white">Mission 1 Tests</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission1.tests.map((test) => (
                        <DropdownMenuCheckboxItem
                          key={test.id}
                          checked={selectedTests.includes(test.id)}
                          onCheckedChange={() => handleTestToggle(test.id)}
                          className="text-white hover:bg-gray-700"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{test.label}</span>
                            <span className="text-xs text-gray-400">{test.description}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Button 
                  onClick={() => startMission('mission1')} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={selectedDataTypes.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Mission 1
                </Button>
              </CardContent>
            </Card>

            {/* Mission 2 Card */}
            <Card className="bg-gray-900 border-green-500 border-2">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Settings className="h-6 w-6 text-green-500 mr-2" />
                <CardTitle className="text-xl text-white">Mission 2</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-300">Environmental Monitoring - Sensors Data</p>
                  <p className="text-sm text-gray-400 mt-1">Track temperature, humidity, pressure, and environmental conditions</p>
                </div>
                
                {/* Data Types Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    Select Data Types
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-600 text-white">
                        {selectedDataTypes.filter(type => missionConfigs.mission2.dataTypes.some(dt => dt.id === type)).length} data types selected
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
                      <DropdownMenuLabel className="text-white">Mission 2 Data Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission2.dataTypes.map((dataType) => (
                        <DropdownMenuCheckboxItem
                          key={dataType.id}
                          checked={selectedDataTypes.includes(dataType.id)}
                          onCheckedChange={() => handleDataTypeToggle(dataType.id)}
                          className="text-white hover:bg-gray-700"
                        >
                          <span className="mr-2">{dataType.icon}</span>
                          {dataType.label}
                          {dataType.default && <Badge variant="secondary" className="ml-auto">Default</Badge>}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tests Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <TestTube className="h-4 w-4 mr-1" />
                    Select Tests
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-gray-800 border-gray-600 text-white">
                        {selectedTests.filter(test => missionConfigs.mission2.tests.some(t => t.id === test)).length} tests selected
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-gray-800 border-gray-600">
                      <DropdownMenuLabel className="text-white">Mission 2 Tests</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {missionConfigs.mission2.tests.map((test) => (
                        <DropdownMenuCheckboxItem
                          key={test.id}
                          checked={selectedTests.includes(test.id)}
                          onCheckedChange={() => handleTestToggle(test.id)}
                          className="text-white hover:bg-gray-700"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{test.label}</span>
                            <span className="text-xs text-gray-400">{test.description}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Button 
                  onClick={() => startMission('mission2')} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedDataTypes.filter(type => missionConfigs.mission2.dataTypes.some(dt => dt.id === type)).length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Mission 2
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 overflow-hidden">
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
          <div className="space-y-6 h-full overflow-hidden flex flex-col">
            {/* 3D Orientation Window */}
            <div className="flex-shrink-0">
              <OrientationWindow3D 
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
    </div>
  );
};

export default CanSatDashboard;
