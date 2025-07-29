"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Thermometer,
  Activity,
  Droplets,
  Weight,
  AlertTriangle,
  Save,
  Loader2,
} from "lucide-react";
import { VitalSigns } from "@/lib/types/vitals";
import { createVitalSigns } from "@/lib/api/vitals";

interface VitalsRecordingFormProps {
  patientId: string;
  patientName: string;
  caregiverId: string;
  onSave?: (vitals: VitalSigns) => void;
  onCancel?: () => void;
}

export function VitalsRecordingForm({
  patientId,
  patientName,
  caregiverId,
  onSave,
  onCancel,
}: VitalsRecordingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    bloodSugar: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Blood pressure validation
    if (formData.bloodPressureSystolic || formData.bloodPressureDiastolic) {
      const systolic = parseInt(formData.bloodPressureSystolic);
      const diastolic = parseInt(formData.bloodPressureDiastolic);

      if (!formData.bloodPressureSystolic || !formData.bloodPressureDiastolic) {
        newErrors.bloodPressure =
          "Both systolic and diastolic values are required";
      } else if (systolic < 50 || systolic > 250) {
        newErrors.bloodPressure =
          "Systolic pressure must be between 50-250 mmHg";
      } else if (diastolic < 30 || diastolic > 150) {
        newErrors.bloodPressure =
          "Diastolic pressure must be between 30-150 mmHg";
      } else if (systolic <= diastolic) {
        newErrors.bloodPressure =
          "Systolic pressure must be higher than diastolic";
      }
    }

    // Heart rate validation
    if (formData.heartRate) {
      const hr = parseInt(formData.heartRate);
      if (hr < 30 || hr > 200) {
        newErrors.heartRate = "Heart rate must be between 30-200 BPM";
      }
    }

    // Temperature validation
    if (formData.temperature) {
      const temp = parseFloat(formData.temperature);
      if (temp < 30 || temp > 45) {
        newErrors.temperature = "Temperature must be between 30-45°C";
      }
    }

    // Oxygen saturation validation
    if (formData.oxygenSaturation) {
      const o2 = parseInt(formData.oxygenSaturation);
      if (o2 < 50 || o2 > 100) {
        newErrors.oxygenSaturation =
          "Oxygen saturation must be between 50-100%";
      }
    }

    // Weight validation
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (weight < 10 || weight > 300) {
        newErrors.weight = "Weight must be between 10-300 kg";
      }
    }

    // Blood sugar validation
    if (formData.bloodSugar) {
      const bs = parseInt(formData.bloodSugar);
      if (bs < 20 || bs > 600) {
        newErrors.bloodSugar = "Blood sugar must be between 20-600 mg/dL";
      }
    }

    // Check if at least one vital is recorded
    const hasAnyVital =
      formData.bloodPressureSystolic ||
      formData.heartRate ||
      formData.temperature ||
      formData.oxygenSaturation ||
      formData.weight ||
      formData.bloodSugar;

    if (!hasAnyVital) {
      newErrors.general = "Please record at least one vital sign";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const vitalsData = {
        patientId,
        caregiverId,
        recordedAt: new Date().toISOString(),
        bloodPressure:
          formData.bloodPressureSystolic && formData.bloodPressureDiastolic
            ? {
                systolic: parseInt(formData.bloodPressureSystolic),
                diastolic: parseInt(formData.bloodPressureDiastolic),
              }
            : undefined,
        heartRate: formData.heartRate
          ? parseInt(formData.heartRate)
          : undefined,
        temperature: formData.temperature
          ? parseFloat(formData.temperature)
          : undefined,
        oxygenSaturation: formData.oxygenSaturation
          ? parseInt(formData.oxygenSaturation)
          : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        bloodSugar: formData.bloodSugar
          ? parseInt(formData.bloodSugar)
          : undefined,
        notes: formData.notes || undefined,
      };

      const newVitals = createVitalSigns(vitalsData);

      toast({
        title: "Vitals Recorded",
        description: newVitals.isAlerted
          ? "Vitals recorded successfully. Some values are outside normal range - alerts generated."
          : "Vitals recorded successfully.",
        variant: newVitals.isAlerted ? "destructive" : "default",
      });

      if (onSave) {
        onSave(newVitals);
      }

      // Reset form
      setFormData({
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        weight: "",
        bloodSugar: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error recording vitals:", error);
      toast({
        title: "Error",
        description: "Failed to record vitals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-teal-600" />
          Record Vital Signs - {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Blood Pressure */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              <Label className="text-base font-medium">
                Blood Pressure (mmHg)
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="systolic"
                  className="text-sm text-muted-foreground"
                >
                  Systolic
                </Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) =>
                    handleInputChange("bloodPressureSystolic", e.target.value)
                  }
                  className={errors.bloodPressure ? "border-red-500" : ""}
                />
              </div>
              <div>
                <Label
                  htmlFor="diastolic"
                  className="text-sm text-muted-foreground"
                >
                  Diastolic
                </Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) =>
                    handleInputChange("bloodPressureDiastolic", e.target.value)
                  }
                  className={errors.bloodPressure ? "border-red-500" : ""}
                />
              </div>
            </div>
            {errors.bloodPressure && (
              <p className="text-sm text-red-500">{errors.bloodPressure}</p>
            )}
          </div>

          {/* Heart Rate */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-500" />
              <Label htmlFor="heartRate" className="text-base font-medium">
                Heart Rate (BPM)
              </Label>
            </div>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => handleInputChange("heartRate", e.target.value)}
              className={errors.heartRate ? "border-red-500" : ""}
            />
            {errors.heartRate && (
              <p className="text-sm text-red-500">{errors.heartRate}</p>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
              <Label htmlFor="temperature" className="text-base font-medium">
                Temperature (°C)
              </Label>
            </div>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="36.5"
              value={formData.temperature}
              onChange={(e) => handleInputChange("temperature", e.target.value)}
              className={errors.temperature ? "border-red-500" : ""}
            />
            {errors.temperature && (
              <p className="text-sm text-red-500">{errors.temperature}</p>
            )}
          </div>

          {/* Oxygen Saturation */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
              <Label
                htmlFor="oxygenSaturation"
                className="text-base font-medium"
              >
                Oxygen Saturation (%)
              </Label>
            </div>
            <Input
              id="oxygenSaturation"
              type="number"
              placeholder="98"
              value={formData.oxygenSaturation}
              onChange={(e) =>
                handleInputChange("oxygenSaturation", e.target.value)
              }
              className={errors.oxygenSaturation ? "border-red-500" : ""}
            />
            {errors.oxygenSaturation && (
              <p className="text-sm text-red-500">{errors.oxygenSaturation}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Weight className="h-4 w-4 mr-2 text-green-500" />
              <Label htmlFor="weight" className="text-base font-medium">
                Weight (kg)
              </Label>
            </div>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.0"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className={errors.weight ? "border-red-500" : ""}
            />
            {errors.weight && (
              <p className="text-sm text-red-500">{errors.weight}</p>
            )}
          </div>

          {/* Blood Sugar */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Droplets className="h-4 w-4 mr-2 text-purple-500" />
              <Label htmlFor="bloodSugar" className="text-base font-medium">
                Blood Sugar (mg/dL)
              </Label>
            </div>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="100"
              value={formData.bloodSugar}
              onChange={(e) => handleInputChange("bloodSugar", e.target.value)}
              className={errors.bloodSugar ? "border-red-500" : ""}
            />
            {errors.bloodSugar && (
              <p className="text-sm text-red-500">{errors.bloodSugar}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes & Observations
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional observations or notes about the patient's condition..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Vitals
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
