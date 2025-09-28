import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from '@/types/telemetry';
import { RotateCcw, Satellite } from 'lucide-react';

interface OrientationWindow2DProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  connectionStatus: ConnectionStatus;
}

const OrientationWindow2D: React.FC<OrientationWindow2DProps> = ({ 
  orientation, 
  connectionStatus 
}) => {
  const pitch = orientation?.pitch || 0;
  const roll = orientation?.roll || 0;
  const yaw = orientation?.yaw || 0;

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            CanSat Orientation
          </CardTitle>
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className={`${getStatusColor(connectionStatus)} text-white`}
          >
            {getStatusText(connectionStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2D CanSat Representation */}
        <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg relative">
          <div className="relative">
            {/* CanSat Body */}
            <div 
              className="w-16 h-24 bg-gradient-to-b from-green-400 to-green-600 rounded-lg border-2 border-green-700 relative transition-transform duration-300 ease-in-out"
              style={{
                transform: `perspective(200px) rotateX(${pitch}deg) rotateZ(${roll}deg)`,
              }}
            >
              {/* Top indicator */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
              {/* Body details */}
              <div className="absolute top-2 left-1 right-1 h-1 bg-green-800 rounded"></div>
              <div className="absolute top-5 left-1 right-1 h-1 bg-green-800 rounded"></div>
              <div className="absolute bottom-2 left-1 right-1 h-1 bg-green-800 rounded"></div>
            </div>
            
            {/* Yaw indicator (rotation around vertical axis) */}
            <div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
              style={{
                transform: `rotate(${yaw}deg)`,
              }}
            >
              <div className="w-8 h-1 bg-blue-500 relative">
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-blue-500 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Orientation Values */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {pitch.toFixed(1)}°
            </div>
            <div className="text-sm text-gray-600">Pitch</div>
            <div className="text-xs text-gray-500">X-axis</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {roll.toFixed(1)}°
            </div>
            <div className="text-sm text-gray-600">Roll</div>
            <div className="text-xs text-gray-500">Z-axis</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {yaw.toFixed(1)}°
            </div>
            <div className="text-sm text-gray-600">Yaw</div>
            <div className="text-xs text-gray-500">Y-axis</div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            onClick={() => {
              // This would typically reset the orientation or recalibrate
              console.log('Reset orientation');
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Orientation
          </button>
        </div>

        {/* Connection Status Details */}
        <div className="text-center text-sm text-gray-500">
          {connectionStatus === 'connected' ? (
            <span className="text-green-600">Receiving orientation data</span>
          ) : connectionStatus === 'connecting' ? (
            <span className="text-yellow-600">Establishing connection...</span>
          ) : (
            <span className="text-red-600">No orientation data available</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrientationWindow2D;
