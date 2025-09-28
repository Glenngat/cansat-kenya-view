import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { TelemetryData } from '@/types/telemetry';

interface MQTTConfig {
  brokerUrl: string;
  topics: string[];
  options?: mqtt.IClientOptions;
}

interface UseMQTTReturn {
  client: MqttClient | null;
  isConnected: boolean;
  lastMessage: any;
  error: string | null;
  connect: (config: MQTTConfig) => void;
  disconnect: () => void;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
}

export const useMQTT = (): UseMQTTReturn => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  const connect = useCallback((config: MQTTConfig) => {
    try {
      setError(null);
      
      const mqttClient = mqtt.connect(config.brokerUrl, {
        keepalive: 60,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        ...config.options,
      });

      mqttClient.on('connect', () => {
        console.log('MQTT Connected');
        setIsConnected(true);
        setError(null);
        
        // Subscribe to all configured topics
        config.topics.forEach(topic => {
          mqttClient.subscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err);
              setError(`Failed to subscribe to ${topic}: ${err.message}`);
            } else {
              console.log(`Subscribed to ${topic}`);
            }
          });
        });
      });

      mqttClient.on('error', (err) => {
        console.error('MQTT Error:', err);
        setError(`MQTT Error: ${err.message}`);
        setIsConnected(false);
      });

      mqttClient.on('close', () => {
        console.log('MQTT Disconnected');
        setIsConnected(false);
      });

      mqttClient.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          setLastMessage({ topic, data, timestamp: Date.now() });
        } catch (parseError) {
          console.error('Failed to parse MQTT message:', parseError);
          setError(`Failed to parse message: ${parseError}`);
        }
      });

      clientRef.current = mqttClient;
      setClient(mqttClient);
    } catch (err) {
      console.error('Failed to connect to MQTT:', err);
      setError(`Connection failed: ${err}`);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setClient(null);
      setIsConnected(false);
    }
  }, []);

  const subscribe = useCallback((topic: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
          setError(`Failed to subscribe to ${topic}: ${err.message}`);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    }
  }, [isConnected]);

  const unsubscribe = useCallback((topic: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to unsubscribe from ${topic}:`, err);
        } else {
          console.log(`Unsubscribed from ${topic}`);
        }
      });
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    client,
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
};