import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from '@/types/telemetry';
import { RotateCcw, Satellite } from 'lucide-react';
import { CanSat3D } from './CanSat3D';

interface OrientationWindowProps {
  orientation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  connectionStatus: ConnectionStatus;
}

// Loading component for 3D scene
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    <div className="text-center">
      <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
      <p>Loading 3D CanSat...</p>
    </div>
  </div>
);

// No data component
const NoDataIndicator: React.FC = () => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    <div className="text-center">
      <Satellite className="h-12 w-12 mx-auto mb-2 opacity-50" />
      <p>Waiting for orientation data...</p>
    </div>
  </div>
);

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
          <Suspense fallback={<LoadingIndicator />}>
            {orientation ? (
              <CanSat3D orientation={orientation} />
            ) : (
              <NoDataIndicator />
            )}
          </Suspense>
        </div>
        
        {/* Orientation Data */}
        <div className="p-4 border-t border-border">
          <OrientationData orientation={orientation} />
        </div>
      </CardContent>
    </Card>
  );
};