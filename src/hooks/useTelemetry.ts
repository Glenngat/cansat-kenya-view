import { useState, useEffect, useCallback } from 'react';
import { TelemetryData, ConnectionStatus, TelemetryLog, MissionStatus } from '@/types/telemetry';

// Mock data generator for demonstration
const generateMockTelemetry = (): TelemetryData => {
  const now = Date.now();
  const altitude = Math.max(0, 1000 + Math.sin(now / 10000) * 500 + Math.random() * 100);
  
  return {
    timestamp: now,
    bmp280: {
      pressure: 1013.25 - (altitude * 0.12),
      altitude_m: altitude,
      altitude_ft: altitude * 3.28084,
      velocity: Math.sin(now / 5000) * 50 + Math.random() * 10,
    },
    dht22: {
      temperature: 25 + Math.sin(now / 20000) * 10 + Math.random() * 2,
      humidity: 60 + Math.sin(now / 15000) * 20 + Math.random() * 5,
    },
    mpu6050: {
      pitch: Math.sin(now / 3000) * 30 + Math.random() * 5,
      roll: Math.cos(now / 4000) * 25 + Math.random() * 5,
      yaw: (now / 100) % 360,
    },
  };
};

export const useTelemetry = () => {
  const [currentData, setCurrentData] = useState<TelemetryData | null>(null);
  const [historicalData, setHistoricalData] = useState<TelemetryData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: true,
    lastUpdate: Date.now(),
    signalStrength: 85,
  });
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>({
    launched: true,
    launchTime: Date.now() - 300000, // 5 minutes ago
    currentTime: Date.now(),
    phase: 'ascent',
  });

  const addTelemetryData = useCallback((data: TelemetryData) => {
    setCurrentData(data);
    setHistoricalData(prev => {
      const newData = [...prev, data];
      // Keep only last 100 data points for performance
      return newData.slice(-100);
    });
    
    // Add to logs
    const logEntry: TelemetryLog = {
      id: `log-${data.timestamp}`,
      timestamp: data.timestamp,
      data,
      rawMessage: JSON.stringify(data, null, 2),
    };
    
    setLogs(prev => {
      const newLogs = [logEntry, ...prev];
      // Keep only last 50 log entries
      return newLogs.slice(0, 50);
    });

    // Update connection status
    setConnectionStatus(prev => ({
      ...prev,
      lastUpdate: data.timestamp,
      connected: true,
    }));
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const mockData = generateMockTelemetry();
      addTelemetryData(mockData);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [addTelemetryData]);

  // Update mission timer
  useEffect(() => {
    const interval = setInterval(() => {
      setMissionStatus(prev => ({
        ...prev,
        currentTime: Date.now(),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Connection timeout check
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentData && Date.now() - currentData.timestamp > 5000) {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
        }));
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [currentData]);

  const exportData = useCallback(() => {
    const csvContent = [
      'timestamp,altitude_m,altitude_ft,velocity,pressure,temperature,humidity,pitch,roll,yaw',
      ...historicalData.map(data => [
        new Date(data.timestamp).toISOString(),
        data.bmp280.altitude_m,
        data.bmp280.altitude_ft,
        data.bmp280.velocity,
        data.bmp280.pressure,
        data.dht22.temperature,
        data.dht22.humidity,
        data.mpu6050.pitch,
        data.mpu6050.roll,
        data.mpu6050.yaw,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cansat-telemetry-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [historicalData]);

  const getMissionDuration = useCallback(() => {
    if (!missionStatus.launched || !missionStatus.launchTime) return 0;
    return missionStatus.currentTime - missionStatus.launchTime;
  }, [missionStatus]);

  return {
    currentData,
    historicalData,
    connectionStatus,
    logs,
    missionStatus,
    exportData,
    getMissionDuration,
  };
};
