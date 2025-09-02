import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal, Clock } from 'lucide-react';
import { TelemetryLog as TelemetryLogType } from '@/types/telemetry';

interface TelemetryLogProps {
  logs: TelemetryLogType[];
}

const formatLogTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getLogEntryPreview = (data: any): string => {
  return `ALT: ${data.bmp280.altitude_m.toFixed(1)}m | VEL: ${data.bmp280.velocity.toFixed(1)}m/s | TEMP: ${data.dht22.temperature.toFixed(1)}°C`;
};

export const TelemetryLog: React.FC<TelemetryLogProps> = ({ logs }) => {
  return (
    <Card className="cansat-card h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5 cansat-green" />
          <CardTitle className="text-lg">Telemetry Log</CardTitle>
        </div>
        <Badge variant="outline" className="ml-auto">
          {logs.length} entries
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No telemetry data received yet...</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="group border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatLogTime(log.timestamp)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      DATA
                    </Badge>
                  </div>
                  
                  <div className="text-sm font-mono mb-2">
                    {getLogEntryPreview(log.data)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    P/R/Y: {log.data.mpu6050.pitch.toFixed(1)}°/{log.data.mpu6050.roll.toFixed(1)}°/{log.data.mpu6050.yaw.toFixed(1)}°
                  </div>
                  
                  {/* Raw data preview (collapsed by default) */}
                  <details className="mt-2 group-hover:opacity-100 opacity-0 transition-opacity">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Raw JSON
                    </summary>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};