import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gauge, 
  Thermometer, 
  Droplets, 
  BarChart3, 
  ArrowUp, 
  ArrowDown,
  Mountain,
  Wind
} from 'lucide-react';
import { TelemetryData } from '@/types/telemetry';

interface TelemetryCardsProps {
  currentData: TelemetryData | null;
  visibleDataTypes?: string[];
}

interface TelemetryCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'red' | 'blue' | 'orange';
  secondaryValue?: string;
  secondaryUnit?: string;
}

const TelemetryCard: React.FC<TelemetryCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'green',
  secondaryValue,
  secondaryUnit,
}) => {
  const colorClasses = {
    green: 'cansat-green',
    red: 'cansat-red',
    blue: 'text-blue-500',
    orange: 'text-orange-500',
  };

  const trendIcon = trend === 'up' ? <ArrowUp className="h-3 w-3 text-green-500" /> :
                   trend === 'down' ? <ArrowDown className="h-3 w-3 text-red-500" /> : null;

  return (
    <Card className="telemetry-card cansat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={colorClasses[color]}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="telemetry-value">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <span className="text-sm text-muted-foreground">{unit}</span>
          {trendIcon}
        </div>
        {secondaryValue && (
          <div className="text-xs text-muted-foreground mt-1">
            {secondaryValue} {secondaryUnit}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({ currentData, visibleDataTypes }) => {
  if (!currentData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="cansat-card animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { bmp280, dht22, mpu6050 } = currentData;

  const allCards = [
    {
      id: 'altitude',
      component: (
        <TelemetryCard
          title="Altitude"
          value={bmp280.altitude_m}
          unit="m"
          icon={<Mountain className="h-4 w-4" />}
          color="green"
          secondaryValue={bmp280.altitude_ft.toFixed(0)}
          secondaryUnit="ft"
          trend={bmp280.velocity > 0 ? 'up' : bmp280.velocity < -1 ? 'down' : 'stable'}
        />
      )
    },
    {
      id: 'velocity',
      component: (
        <TelemetryCard
          title="Velocity"
          value={bmp280.velocity}
          unit="m/s"
          icon={<Wind className="h-4 w-4" />}
          color="blue"
          trend={bmp280.velocity > 10 ? 'up' : bmp280.velocity < -10 ? 'down' : 'stable'}
        />
      )
    },
    {
      id: 'temperature',
      component: (
        <TelemetryCard
          title="Temperature"
          value={dht22.temperature}
          unit="°C"
          icon={<Thermometer className="h-4 w-4" />}
          color="orange"
          secondaryValue={(dht22.temperature * 9/5 + 32).toFixed(1)}
          secondaryUnit="°F"
        />
      )
    },
    {
      id: 'humidity',
      component: (
        <TelemetryCard
          title="Humidity"
          value={dht22.humidity}
          unit="%"
          icon={<Droplets className="h-4 w-4" />}
          color="blue"
        />
      )
    },
    {
      id: 'pressure',
      component: (
        <TelemetryCard
          title="Pressure"
          value={bmp280.pressure}
          unit="hPa"
          icon={<Gauge className="h-4 w-4" />}
          color="green"
        />
      )
    }
  ];

  // Filter cards based on visible data types
  const visibleCards = visibleDataTypes 
    ? allCards.filter(card => visibleDataTypes.includes(card.id))
    : allCards;

  if (visibleCards.length === 0) {
    return (
      <Card className="cansat-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          No data types selected. Please select data types from the mission configuration above.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {visibleCards.map((card, index) => (
        <div key={card.id}>{card.component}</div>
      ))}
    </div>
  );
};