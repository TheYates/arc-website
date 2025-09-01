"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";

interface VitalsRecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (vitalsData: VitalsFormData) => Promise<void>;
  patientName: string;
  isLoading?: boolean;
}

export interface VitalsFormData {
  systolicBp: string;
  diastolicBp: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  weightKg: string;
  bloodSugar: string;
  notes: string;
}

export function VitalsRecordingDialog({
  open,
  onOpenChange,
  onSave,
  patientName,
  isLoading = false,
}: VitalsRecordingDialogProps) {
  const [formData, setFormData] = useState<VitalsFormData>({
    systolicBp: "",
    diastolicBp: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weightKg: "",
    bloodSugar: "",
    notes: "",
  });

  const handleInputChange = (field: keyof VitalsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate at least one field is filled
    const hasData = Object.entries(formData).some(([key, value]) => 
      key !== 'notes' && value.trim() !== ""
    );
    
    if (!hasData) {
      return; // Could add toast notification here
    }

    await onSave(formData);
    
    // Reset form
    setFormData({
      systolicBp: "",
      diastolicBp: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      weightKg: "",
      bloodSugar: "",
      notes: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      systolicBp: "",
      diastolicBp: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      weightKg: "",
      bloodSugar: "",
      notes: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Vital Signs</DialogTitle>
          <DialogDescription>
            Enter vital signs for {patientName} • {new Date().toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <Label>Blood Pressure (mmHg)</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.systolicBp}
                  onChange={(e) => handleInputChange("systolicBp", e.target.value)}
                />
                <Label className="text-xs text-muted-foreground">Systolic</Label>
              </div>
              <div className="flex items-center text-muted-foreground">/</div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.diastolicBp}
                  onChange={(e) => handleInputChange("diastolicBp", e.target.value)}
                />
                <Label className="text-xs text-muted-foreground">Diastolic</Label>
              </div>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => handleInputChange("heartRate", e.target.value)}
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="36.5"
              value={formData.temperature}
              onChange={(e) => handleInputChange("temperature", e.target.value)}
            />
          </div>

          {/* Oxygen Saturation */}
          <div className="space-y-2">
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSaturation"
              type="number"
              placeholder="98"
              value={formData.oxygenSaturation}
              onChange={(e) => handleInputChange("oxygenSaturation", e.target.value)}
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={formData.weightKg}
              onChange={(e) => handleInputChange("weightKg", e.target.value)}
            />
          </div>

          {/* Blood Sugar */}
          <div className="space-y-2">
            <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
            <Input
              id="bloodSugar"
              type="number"
              step="0.1"
              placeholder="100"
              value={formData.bloodSugar}
              onChange={(e) => handleInputChange("bloodSugar", e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any observations or notes about the patient's condition..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Vitals
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
