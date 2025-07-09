"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Pill, FileText, Save, Clock } from "lucide-react";

interface QuickVitalsFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (vitals: QuickVitalsData) => void;
  onCancel?: () => void;
}

interface QuickMedicationFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (medication: QuickMedicationData) => void;
  onCancel?: () => void;
}

interface QuickNoteFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (note: QuickNoteData) => void;
  onCancel?: () => void;
}

export interface QuickVitalsData {
  patientId: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  recordedAt: string;
}

export interface QuickMedicationData {
  patientId: string;
  medicationName: string;
  dosage: string;
  administeredTime: string;
  notes: string;
  administeredBy: string;
}

export interface QuickNoteData {
  patientId: string;
  type: "general" | "medication" | "vitals" | "behavioral" | "emergency";
  content: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  createdBy: string;
}

export function QuickVitalsForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
}: QuickVitalsFormProps) {
  const [vitals, setVitals] = useState<
    Omit<QuickVitalsData, "patientId" | "recordedAt">
  >({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
  });

  const handleSubmit = () => {
    const vitalsData: QuickVitalsData = {
      ...vitals,
      patientId,
      recordedAt: new Date().toISOString(),
    };
    onSubmit(vitalsData);
    // Reset form
    setVitals({
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
    });
  };

  const isValid =
    vitals.bloodPressureSystolic &&
    vitals.bloodPressureDiastolic &&
    vitals.heartRate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>Record Vital Signs - {patientName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="systolic">Blood Pressure (Systolic) *</Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={vitals.bloodPressureSystolic}
              onChange={(e) =>
                setVitals({ ...vitals, bloodPressureSystolic: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="diastolic">Blood Pressure (Diastolic) *</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={vitals.bloodPressureDiastolic}
              onChange={(e) =>
                setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm) *</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={vitals.heartRate}
              onChange={(e) =>
                setVitals({ ...vitals, heartRate: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="36.5"
              value={vitals.temperature}
              onChange={(e) =>
                setVitals({ ...vitals, temperature: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
            <Input
              id="oxygen"
              type="number"
              placeholder="98"
              value={vitals.oxygenSaturation}
              onChange={(e) =>
                setVitals({ ...vitals, oxygenSaturation: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} className="flex-1" disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            Record Vital Signs
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickMedicationForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
}: QuickMedicationFormProps) {
  const [medication, setMedication] = useState<
    Omit<QuickMedicationData, "patientId" | "administeredBy">
  >({
    medicationName: "",
    dosage: "",
    administeredTime: "",
    notes: "",
  });

  const handleSubmit = () => {
    const medicationData: QuickMedicationData = {
      ...medication,
      patientId,
      administeredBy: "Current Caregiver", // In real app, get from auth context
    };
    onSubmit(medicationData);
    // Reset form
    setMedication({
      medicationName: "",
      dosage: "",
      administeredTime: "",
      notes: "",
    });
  };

  const isValid = medication.medicationName && medication.dosage;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-blue-500" />
          <span>Record Medication - {patientName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medicationName">Medication Name *</Label>
            <Input
              id="medicationName"
              placeholder="e.g., Metformin"
              value={medication.medicationName}
              onChange={(e) =>
                setMedication({ ...medication, medicationName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="dosage">Dosage *</Label>
            <Input
              id="dosage"
              placeholder="e.g., 500mg"
              value={medication.dosage}
              onChange={(e) =>
                setMedication({ ...medication, dosage: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="administeredTime">Administration Time</Label>
            <Input
              id="administeredTime"
              type="datetime-local"
              value={medication.administeredTime}
              onChange={(e) =>
                setMedication({
                  ...medication,
                  administeredTime: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="medicationNotes">Administration Notes</Label>
          <Textarea
            id="medicationNotes"
            placeholder="Any notes about the medication administration, patient response, etc..."
            value={medication.notes}
            onChange={(e) =>
              setMedication({ ...medication, notes: e.target.value })
            }
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} className="flex-1" disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            Record Medication
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickNoteForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
}: QuickNoteFormProps) {
  const [note, setNote] = useState<
    Omit<QuickNoteData, "patientId" | "createdAt" | "createdBy">
  >({
    type: "general",
    content: "",
    priority: "medium",
  });

  const handleSubmit = () => {
    const noteData: QuickNoteData = {
      ...note,
      patientId,
      createdAt: new Date().toISOString(),
      createdBy: "Current Caregiver", // In real app, get from auth context
    };
    onSubmit(noteData);
    // Reset form
    setNote({
      type: "general",
      content: "",
      priority: "medium",
    });
  };

  const isValid = note.content.trim().length > 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-green-500" />
          <span>Add Care Note - {patientName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="noteType">Note Type</Label>
            <select
              id="noteType"
              className="w-full p-2 border border-slate-300 rounded-md"
              value={note.type}
              onChange={(e) =>
                setNote({ ...note, type: e.target.value as any })
              }
            >
              <option value="general">General Care</option>
              <option value="medication">Medication Related</option>
              <option value="vitals">Vitals Related</option>
              <option value="behavioral">Behavioral</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              className="w-full p-2 border border-slate-300 rounded-md"
              value={note.priority}
              onChange={(e) =>
                setNote({ ...note, priority: e.target.value as any })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Badge className={`mt-1 ${getPriorityColor(note.priority)}`}>
              {note.priority} priority
            </Badge>
          </div>
        </div>
        <div>
          <Label htmlFor="noteContent">Care Note *</Label>
          <Textarea
            id="noteContent"
            placeholder="Enter your care note here..."
            rows={4}
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} className="flex-1" disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            Add Care Note
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
