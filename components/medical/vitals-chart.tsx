"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar,
  Activity,
} from "lucide-react";
import { VitalsTrend, VitalType, TimeRange } from "@/lib/types/vitals";
import { getVitalsTrends } from "@/lib/api/vitals";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VitalsChartProps {
  patientId: string;
  patientName: string;
  initialVitalType?: VitalType;
  initialTimeRange?: TimeRange;
  showControls?: boolean;
}

export function VitalsChart({
  patientId,
  patientName,
  initialVitalType = "heartRate",
  initialTimeRange = "7d",
  showControls = true,
}: VitalsChartProps) {
  const [vitalType, setVitalType] = useState<VitalType>(initialVitalType);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [trend, setTrend] = useState<VitalsTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      setIsLoading(true);
      try {
        const trendData = getVitalsTrends(patientId, vitalType, timeRange);
        setTrend(trendData);
      } catch (error) {
        console.error("Error fetching vitals trend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrend();
  }, [patientId, vitalType, timeRange]);

  const getVitalTypeLabel = (type: VitalType): string => {
    const labels = {
      bloodPressure: "Blood Pressure",
      heartRate: "Heart Rate",
      temperature: "Temperature",
      oxygenSaturation: "Oxygen Saturation",
      weight: "Weight",
      bloodSugar: "Blood Sugar",
    };
    return labels[type];
  };

  const getVitalUnit = (type: VitalType): string => {
    const units = {
      bloodPressure: "mmHg",
      heartRate: "BPM",
      temperature: "°C",
      oxygenSaturation: "%",
      weight: "kg",
      bloodSugar: "mg/dL",
    };
    return units[type];
  };

  const getTrendIcon = (trendDirection: string) => {
    switch (trendDirection) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "concerning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trendDirection: string): string => {
    switch (trendDirection) {
      case "improving":
        return "text-green-700 bg-green-50";
      case "declining":
        return "text-red-700 bg-red-50";
      case "concerning":
        return "text-orange-700 bg-orange-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  const formatChartData = () => {
    if (!trend || trend.dataPoints.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = trend.dataPoints.map((point) => {
      const date = new Date(point.date);
      return timeRange === "24h"
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
    });

    if (vitalType === "bloodPressure") {
      const systolicData = trend.dataPoints.map((point) => {
        const bp = point.value as { systolic: number; diastolic: number };
        return bp.systolic;
      });

      const diastolicData = trend.dataPoints.map((point) => {
        const bp = point.value as { systolic: number; diastolic: number };
        return bp.diastolic;
      });

      const alertPoints = trend.dataPoints.map((point) => point.isAlert);

      return {
        labels,
        datasets: [
          {
            label: "Systolic",
            data: systolicData,
            borderColor: "rgb(239, 68, 68)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            pointBackgroundColor: alertPoints.map((isAlert, index) =>
              isAlert ? "rgb(220, 38, 38)" : "rgb(239, 68, 68)"
            ),
            pointBorderColor: alertPoints.map((isAlert, index) =>
              isAlert ? "rgb(220, 38, 38)" : "rgb(239, 68, 68)"
            ),
            pointRadius: alertPoints.map((isAlert) => (isAlert ? 6 : 4)),
            tension: 0.1,
          },
          {
            label: "Diastolic",
            data: diastolicData,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            pointBackgroundColor: alertPoints.map((isAlert, index) =>
              isAlert ? "rgb(37, 99, 235)" : "rgb(59, 130, 246)"
            ),
            pointBorderColor: alertPoints.map((isAlert, index) =>
              isAlert ? "rgb(37, 99, 235)" : "rgb(59, 130, 246)"
            ),
            pointRadius: alertPoints.map((isAlert) => (isAlert ? 6 : 4)),
            tension: 0.1,
          },
        ],
      };
    } else {
      const data = trend.dataPoints.map((point) => point.value as number);
      const alertPoints = trend.dataPoints.map((point) => point.isAlert);

      const getVitalColor = (type: VitalType) => {
        const colors = {
          heartRate: "rgb(236, 72, 153)",
          temperature: "rgb(249, 115, 22)",
          oxygenSaturation: "rgb(59, 130, 246)",
          weight: "rgb(34, 197, 94)",
          bloodSugar: "rgb(168, 85, 247)",
        };
        return colors[type as keyof typeof colors] || "rgb(107, 114, 128)";
      };

      const color = getVitalColor(vitalType);

      return {
        labels,
        datasets: [
          {
            label: getVitalTypeLabel(vitalType),
            data,
            borderColor: color,
            backgroundColor: color
              .replace("rgb", "rgba")
              .replace(")", ", 0.1)"),
            pointBackgroundColor: alertPoints.map((isAlert) =>
              isAlert
                ? color.replace("rgb", "rgba").replace(")", ", 0.8)")
                : color
            ),
            pointBorderColor: alertPoints.map((isAlert) =>
              isAlert
                ? color.replace("rgb", "rgba").replace(")", ", 0.8)")
                : color
            ),
            pointRadius: alertPoints.map((isAlert) => (isAlert ? 6 : 4)),
            tension: 0.1,
          },
        ],
      };
    }
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            const unit = getVitalUnit(vitalType);
            return `${label}: ${value} ${unit}`;
          },
          afterLabel: function (context) {
            const dataPoint = trend?.dataPoints[context.dataIndex];
            if (dataPoint?.isAlert) {
              return "Alert: Outside normal range";
            }
            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: getVitalUnit(vitalType),
        },
      },
      x: {
        title: {
          display: true,
          text: timeRange === "24h" ? "Time" : "Date",
        },
      },
    },
  };

  const formatAverageValue = (
    avg: number | { systolic: number; diastolic: number } | undefined
  ) => {
    if (avg === undefined) return "N/A";

    if (typeof avg === "object") {
      return `${Math.round(avg.systolic)}/${Math.round(avg.diastolic)}`;
    }

    return Math.round(avg * 10) / 10;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-teal-600" />
            Vitals Trends - {patientName}
          </CardTitle>

          {showControls && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={vitalType}
                onValueChange={(value) => setVitalType(value as VitalType)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heartRate">Heart Rate</SelectItem>
                  <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="oxygenSaturation">
                    Oxygen Saturation
                  </SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="bloodSugar">Blood Sugar</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {trend && (
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getTrendColor(trend.trend)}>
                {getTrendIcon(trend.trend)}
                <span className="ml-1 capitalize">{trend.trend}</span>
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Average: </span>
              {formatAverageValue(trend.averageValue)} {getVitalUnit(vitalType)}
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Data Points: </span>
              {trend.dataPoints.length}
            </div>

            {trend.dataPoints.some((p) => p.isAlert) && (
              <div className="flex items-center space-x-1 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {trend.dataPoints.filter((p) => p.isAlert).length} Alert(s)
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {trend && trend.dataPoints.length > 0 ? (
          <div className="h-96">
            <Line data={formatChartData()} options={chartOptions} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-center">
              No {getVitalTypeLabel(vitalType).toLowerCase()} data found for the
              selected time period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
