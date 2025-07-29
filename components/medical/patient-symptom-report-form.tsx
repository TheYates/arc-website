"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Save,
  Loader2,
  Heart,
  Zap,
  Brain,
  Thermometer,
  Pill,
} from "lucide-react";
import { PatientSymptomReport, Medication } from "@/lib/types/medications";
import { createSymptomReport, getMedications } from "@/lib/api/medications";

interface PatientSymptomReportFormProps {
  patientId: string;
  patientName: string;
  onSave?: (report: PatientSymptomReport) => void;
  onCancel?: () => void;
}

const commonSymptoms = [
  { id: "nausea", label: "Nausea", icon: "🤢" },
  { id: "vomiting", label: "Vomiting", icon: "🤮" },
  { id: "dizziness", label: "Dizziness", icon: "😵" },
  { id: "headache", label: "Headache", icon: "🤕" },
  { id: "fatigue", label: "Fatigue", icon: "😴" },
  { id: "rash", label: "Skin Rash", icon: "🩹" },
  { id: "itching", label: "Itching", icon: "🧴" },
  { id: "difficulty_breathing", label: "Difficulty Breathing", icon: "🫁" },
  { id: "chest_pain", label: "Chest Pain", icon: "💗" },
  { id: "stomach_pain", label: "Stomach Pain", icon: "🤰" },
  { id: "muscle_pain", label: "Muscle Pain", icon: "💪" },
  { id: "joint_pain", label: "Joint Pain", icon: "🦴" },
  { id: "fever", label: "Fever", icon: "🌡️" },
  { id: "chills", label: "Chills", icon: "🥶" },
  { id: "sweating", label: "Excessive Sweating", icon: "💦" },
  { id: "diarrhea", label: "Diarrhea", icon: "🚽" },
  { id: "constipation", label: "Constipation", icon: "🚫" },
  { id: "loss_of_appetite", label: "Loss of Appetite", icon: "🍽️" },
  { id: "weight_change", label: "Unexpected Weight Change", icon: "⚖️" },
  { id: "mood_changes", label: "Mood Changes", icon: "😐" },
  { id: "confusion", label: "Confusion", icon: "🤔" },
  { id: "vision_problems", label: "Vision Problems", icon: "👁️" },
  { id: "hearing_problems", label: "Hearing Problems", icon: "👂" },
  { id: "sleep_problems", label: "Sleep Problems", icon: "🛏️" },
];

export function PatientSymptomReportForm({
  patientId,
  patientName,
  onSave,
  onCancel,
}: PatientSymptomReportFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [formData, setFormData] = useState({
    medicationId: undefined as string | undefined,
    selectedSymptoms: [] as string[],
    customSymptoms: "",
    severity: 3 as 1 | 2 | 3 | 4 | 5,
    description: "",
    startedAt: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load active medications for this patient
    const patientMedications = getMedications(patientId).filter(
      (m) => m.isActive
    );
    setMedications(patientMedications);
  }, [patientId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      formData.selectedSymptoms.length === 0 &&
      !formData.customSymptoms.trim()
    ) {
      newErrors.symptoms =
        "Please select at least one symptom or describe custom symptoms";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please provide a description of your symptoms";
    }

    if (!formData.startedAt) {
      newErrors.startedAt = "Please specify when the symptoms started";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Combine selected symptoms with custom symptoms
      const allSymptoms = [...formData.selectedSymptoms];
      if (formData.customSymptoms.trim()) {
        const customSymptomsArray = formData.customSymptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        allSymptoms.push(...customSymptomsArray);
      }

      const reportData = {
        patientId,
        medicationId: formData.medicationId || undefined,
        symptoms: allSymptoms,
        severity: formData.severity,
        description: formData.description.trim(),
        startedAt: formData.startedAt,
      };

      const newReport = createSymptomReport(reportData);

      const severityMessages = {
        1: "Mild symptoms reported and recorded.",
        2: "Mild to moderate symptoms reported and recorded.",
        3: "Moderate symptoms reported. Medical staff will review.",
        4: "Severe symptoms reported. Medical staff have been alerted.",
        5: "Very severe symptoms reported. Immediate medical attention required.",
      };

      toast({
        title: "Symptoms Reported",
        description: severityMessages[formData.severity],
        variant: formData.severity >= 4 ? "destructive" : "default",
      });

      if (onSave) {
        onSave(newReport);
      }

      // Reset form
      setFormData({
        medicationId: "",
        selectedSymptoms: [],
        customSymptoms: "",
        severity: 3,
        description: "",
        startedAt: new Date().toISOString().slice(0, 16),
      });
    } catch (error) {
      console.error("Error reporting symptoms:", error);
      toast({
        title: "Error",
        description: "Failed to report symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter((id) => id !== symptomId)
        : [...prev.selectedSymptoms, symptomId],
    }));

    // Clear error when user selects symptoms
    if (errors.symptoms) {
      setErrors((prev) => ({ ...prev, symptoms: "" }));
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "text-green-700 bg-green-50 border-green-200";
      case 2:
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case 3:
        return "text-orange-700 bg-orange-50 border-orange-200";
      case 4:
        return "text-red-700 bg-red-50 border-red-200";
      case 5:
        return "text-red-800 bg-red-100 border-red-300";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityLabel = (severity: number) => {
    const labels = {
      1: "Mild - Minor discomfort",
      2: "Mild to Moderate - Noticeable but manageable",
      3: "Moderate - Affecting daily activities",
      4: "Severe - Significantly impacting life",
      5: "Very Severe - Urgent medical attention needed",
    };
    return labels[severity as keyof typeof labels];
  };

  const getSeverityIcon = (severity: number) => {
    switch (severity) {
      case 1:
        return <Heart className="h-4 w-4 text-green-500" />;
      case 2:
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 3:
        return <Brain className="h-4 w-4 text-orange-500" />;
      case 4:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 5:
        return <Thermometer className="h-4 w-4 text-red-600" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
          Report Symptoms - {patientName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please report any symptoms or side effects you're experiencing. This
          information helps your medical team provide better care.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Related Medication */}
          <div>
            <Label className="text-base font-medium">
              Related to Medication (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              If you think these symptoms might be related to a specific
              medication, please select it.
            </p>
            <Select
              value={formData.medicationId || ""}
              onValueChange={(value) =>
                handleInputChange("medicationId", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a medication (optional)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None / Not sure</SelectItem>
                {medications.map((medication) => (
                  <SelectItem key={medication.id} value={medication.id}>
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2" />
                      {medication.medicationName} - {medication.dosage}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Symptoms Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Symptoms You're Experiencing
            </Label>
            <p className="text-sm text-muted-foreground">
              Select all symptoms that apply to you.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                    formData.selectedSymptoms.includes(symptom.id)
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSymptomToggle(symptom.id)}
                >
                  <Checkbox
                    id={symptom.id}
                    checked={formData.selectedSymptoms.includes(symptom.id)}
                    onChange={() => {}} // Handled by parent onClick
                  />
                  <span className="text-lg">{symptom.icon}</span>
                  <Label
                    htmlFor={symptom.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {symptom.label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Custom Symptoms */}
            <div>
              <Label htmlFor="customSymptoms" className="text-sm font-medium">
                Other Symptoms (Not Listed Above)
              </Label>
              <Input
                id="customSymptoms"
                placeholder="Describe any other symptoms (comma-separated)"
                value={formData.customSymptoms}
                onChange={(e) =>
                  handleInputChange("customSymptoms", e.target.value)
                }
              />
            </div>

            {errors.symptoms && (
              <p className="text-sm text-red-500">{errors.symptoms}</p>
            )}
          </div>

          {/* Severity Level */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Severity Level</Label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((severity) => (
                <div
                  key={severity}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    formData.severity === severity
                      ? getSeverityColor(severity)
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("severity", severity)}
                >
                  <div className="flex items-center justify-center mb-2">
                    {getSeverityIcon(severity)}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">Level {severity}</div>
                    <div className="text-xs">
                      {getSeverityLabel(severity).split(" - ")[1]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`p-3 rounded border ${getSeverityColor(
                formData.severity
              )}`}
            >
              <div className="flex items-center">
                {getSeverityIcon(formData.severity)}
                <span className="ml-2 font-medium">
                  {getSeverityLabel(formData.severity)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Detailed Description *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Please describe your symptoms in detail. Include when they occur,
              how long they last, and what makes them better or worse.
            </p>
            <Textarea
              id="description"
              placeholder="Describe your symptoms in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* When Started */}
          <div>
            <Label htmlFor="startedAt" className="text-base font-medium">
              When Did These Symptoms Start? *
            </Label>
            <Input
              id="startedAt"
              type="datetime-local"
              value={formData.startedAt}
              onChange={(e) => handleInputChange("startedAt", e.target.value)}
              className={errors.startedAt ? "border-red-500" : ""}
            />
            {errors.startedAt && (
              <p className="text-sm text-red-500 mt-1">{errors.startedAt}</p>
            )}
          </div>

          {/* Severity Warning */}
          {formData.severity >= 4 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <p className="font-medium text-red-800">
                    Severe Symptoms Detected
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {formData.severity === 5
                      ? "Please consider seeking immediate medical attention or calling emergency services if these symptoms are life-threatening."
                      : "Your medical team will be alerted to review these symptoms promptly."}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reporting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Report Symptoms
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
