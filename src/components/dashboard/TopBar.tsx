import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Satellite, Timer, Wifi, WifiOff, Settings } from 'lucide-react';
import { ConnectionStatus } from '@/types/telemetry';

interface TopBarProps {
  connectionStatus: ConnectionStatus;
  missionDuration: number;
  onExportData: () => void;
  onShowMQTTConfig?: () => void;
}

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const TopBar: React.FC<TopBarProps> = ({
  connectionStatus,
  missionDuration,
  onExportData,
  onShowMQTTConfig
}) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-8 w-8 text-kenyan-green" />
              <div>
                <h1 className="text-2xl font-bold text-kenyan-green">CanSat Kenya</h1>
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

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionStatus.connected ? (
                <>
                  <Wifi className="h-4 w-4 text-kenyan-green" />
                  <Badge variant="outline" className="text-kenyan-green border-kenyan-green">
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
                  <WifiOff className="h-4 w-4 text-kenyan-red" />
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

            {/* MQTT Config Button */}
            {onShowMQTTConfig && (
              <Button
                onClick={onShowMQTTConfig}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>MQTT</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};