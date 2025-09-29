import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from '@/types/telemetry';
import { RotateCcw, Satellite } from 'lucide-react';

interface OrientationWindowProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  connectionStatus: ConnectionStatus;
}

// 2D Orientation Indicator Component (Fallback)
const OrientationIndicator: React.FC<{ orientation?: { pitch: number; roll: number; yaw: number } }> = ({ 
  orientation 
}) => {
  if (!orientation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Waiting for orientation data...</p>
        </div>
      </div>
    );
  }

  const { pitch, roll, yaw } = orientation;
  
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      {/* Horizon Indicator */}
      <div className="relative w-32 h-32 rounded-full border-4 border-muted bg-gradient-to-b from-blue-900/20 to-green-900/20">
        <div 
          className="absolute inset-2 rounded-full border-2 border-primary bg-primary/10"
          style={{
            transform: `rotate(${roll}deg)`
          }}
        >
          <div className="absolute top-1/2 left-1/2 w-1 h-8 bg-primary -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Compass */}
      <div className="relative w-20 h-20 rounded-full border-2 border-muted">
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            transform: `rotate(${yaw}deg)`
          }}
        >
          <div className="absolute top-0 left-1/2 w-1 h-6 bg-red-500 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="absolute top-1 left-1/2 text-xs text-muted-foreground -translate-x-1/2">N</div>
      </div>
    </div>
  );
};

// Orientation data display
const OrientationData: React.FC<{ orientation?: { pitch: number; roll: number; yaw: number } }> = ({ 
  orientation 
}) => {
  if (!orientation) return null;

  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center">
        <div className="text-muted-foreground">Pitch</div>
        <div className="font-mono font-semibold">{orientation.pitch.toFixed(1)}°</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Roll</div>
        <div className="font-mono font-semibold">{orientation.roll.toFixed(1)}°</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Yaw</div>
        <div className="font-mono font-semibold">{orientation.yaw.toFixed(1)}°</div>
      </div>
    </div>
  );
};

export const OrientationWindow: React.FC<OrientationWindowProps> = ({ 
  orientation, 
  connectionStatus 
}) => {
  return (
    <Card className="orientation-window">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5 cansat-green" />
          <CardTitle className="text-lg">Orientation</CardTitle>
        </div>
        <Badge 
          variant={connectionStatus.connected ? "outline" : "destructive"}
          className={connectionStatus.connected ? "status-connected border-current" : ""}
        >
          <Satellite className="h-3 w-3 mr-1" />
          {connectionStatus.connected ? "Live" : "No Data"}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[280px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-b-lg">
          <OrientationIndicator orientation={orientation} />
        </div>
        
        {/* Orientation Data */}
        <div className="p-4 border-t border-border">
          <OrientationData orientation={orientation} />
        </div>
      </CardContent>
    </Card>
  );
};