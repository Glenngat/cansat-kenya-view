export interface TelemetryData {
  timestamp: number;
  bmp280: {
    pressure: number; // hPa
    altitude_m: number; // meters
    altitude_ft: number; // feet
    velocity: number; // m/s
  };
  dht22: {
    temperature: number; // °C
    humidity: number; // %
  };
  mpu6050: {
    pitch: number; // degrees
    roll: number; // degrees
    yaw: number; // degrees
  };
}

export interface ConnectionStatus {
  connected: boolean;
  lastUpdate: number;
  signalStrength?: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: number;
  data: TelemetryData;
  rawMessage: string;
}

export interface MissionStatus {
  launched: boolean;
  launchTime?: number;
  currentTime: number;
  phase: 'pre-launch' | 'ascent' | 'descent' | 'landed' | 'recovery';
}