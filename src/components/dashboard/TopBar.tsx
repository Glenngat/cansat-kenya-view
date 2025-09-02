import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Satellite, Timer, Wifi, WifiOff } from 'lucide-react';
import { ConnectionStatus, MissionStatus } from '@/types/telemetry';

interface TopBarProps {
  connectionStatus: ConnectionStatus;
  missionStatus: MissionStatus;
  onExportData: () => void;
  missionDuration: number;
}

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const TopBar: React.FC<TopBarProps> = ({
  connectionStatus,
  missionStatus,
  onExportData,
  missionDuration,
}) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-8 w-8 cansat-green" />
              <div>
                <h1 className="text-2xl font-bold cansat-green">CanSat Kenya</h1>
                <p className="text-sm text-muted-foreground">Base Station Telemetry</p>
              </div>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center space-x-4">
            {/* Mission Timer */}
            <div className="flex items-center space-x-2 text-sm">
              <Timer className="h-4 w-4" />
              <span className="font-mono">T+ {formatDuration(missionDuration)}</span>
            </div>

            {/* Mission Phase */}
            <Badge 
              variant={missionStatus.phase === 'ascent' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {missionStatus.phase}
            </Badge>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionStatus.connected ? (
                <>
                  <Wifi className="h-4 w-4 status-connected" />
                  <Badge variant="outline" className="status-connected border-current">
                    Connected
                  </Badge>
                  {connectionStatus.signalStrength && (
                    <span className="text-xs text-muted-foreground">
                      {connectionStatus.signalStrength}%
                    </span>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 status-disconnected" />
                  <Badge variant="destructive">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>

            {/* Export Button */}
            <Button
              onClick={onExportData}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};