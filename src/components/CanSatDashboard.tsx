import React from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { TopBar } from './dashboard/TopBar';
import { TelemetryCards } from './dashboard/TelemetryCards';
import { ChartsSection } from './dashboard/ChartsSection';
import { OrientationWindow } from './dashboard/OrientationWindow';
import { TelemetryLog } from './dashboard/TelemetryLog';

const CanSatDashboard: React.FC = () => {
  const telemetryData = useTelemetry();

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <TopBar
        connectionStatus={telemetryData.connectionStatus}
        missionStatus={telemetryData.missionStatus}
        onExportData={telemetryData.exportData}
        missionDuration={telemetryData.getMissionDuration()}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Telemetry Cards Grid */}
        <TelemetryCards currentData={telemetryData.currentData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <ChartsSection historicalData={telemetryData.historicalData} />
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* 3D Orientation Window */}
            <OrientationWindow 
              orientation={telemetryData.currentData?.mpu6050}
              connectionStatus={telemetryData.connectionStatus}
            />
            
            {/* Telemetry Log */}
            <TelemetryLog logs={telemetryData.logs} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CanSatDashboard;