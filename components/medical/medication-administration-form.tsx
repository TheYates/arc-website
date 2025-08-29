"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Pill,
  Clock,
  AlertTriangle,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  Medication,
  MedicationAdministration,
  AdministrationStatus,
} from "@/lib/types/medications";
import {
  getMedications,
  getMedicationSchedules,
  recordMedicationAdministration,
} from "@/lib/api/medications";

interface MedicationAdministrationFormProps {
  patientId: string;
  patientName: string;
  caregiverId: string;
  selectedMedicationId?: string;
  scheduledTime?: string;
  onSave?: (administration: MedicationAdministration) => void;
  onCancel?: () => void;
}

export function MedicationAdministrationForm({
  patientId,
  patientName,
  caregiverId,
  selectedMedicationId,
  scheduledTime,
  onSave,
  onCancel,
}: MedicationAdministrationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    medicationId: selectedMedicationId || undefined,
    scheduledTime: scheduledTime || new Date().toISOString().slice(0, 16),
    actualTime: new Date().toISOString().slice(0, 16),
    status: "administered" as AdministrationStatus,
    dosageGiven: "",
    notes: "",
    sideEffectsObserved: "",
    patientResponse: "good" as "good" | "fair" | "poor" | "adverse",
    witnessedBy: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load active medications for this patient
    const patientMedications = getMedications(patientId).filter(
      (m) => m.isActive
    );
    setMedications(patientMedications);

    if (selectedMedicationId) {
      const medication = patientMedications.find(
        (m) => m.id === selectedMedicationId
      );
      if (medication) {
        setSelectedMedication(medication);
        setFormData((prev) => ({
          ...prev,
          dosageGiven: medication.dosage,
        }));
      }
    }
  }, [patientId, selectedMedicationId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicationId) {
      newErrors.medicationId = "Please select a medication";
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Scheduled time is required";
    }

    if (formData.status === "administered" && !formData.actualTime) {
      newErrors.actualTime = "Actual administration time is required";
    }

    if (formData.status === "administered" && !formData.dosageGiven.trim()) {
      newErrors.dosageGiven =
        "Dosage given is required for administered medications";
    }

    if (
      (formData.status === "missed" || formData.status === "refused") &&
      !formData.notes.trim()
    ) {
      newErrors.notes =
        "Please provide a reason for missed or refused medication";
    }

    if (
      formData.status === "administered" &&
      selectedMedication?.route === "injection_iv" &&
      !formData.witnessedBy.trim()
    ) {
      newErrors.witnessedBy = "IV medications require a witness signature";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const administrationData = {
        medicationId: formData.medicationId,
        patientId,
        caregiverId,
        scheduledTime: formData.scheduledTime,
        actualTime:
          formData.status === "administered" ? formData.actualTime : undefined,
        status: formData.status,
        dosageGiven: formData.dosageGiven.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        sideEffectsObserved: formData.sideEffectsObserved.trim()
          ? formData.sideEffectsObserved.split(",").map((s) => s.trim())
          : undefined,
        patientResponse:
          formData.status === "administered"
            ? formData.patientResponse
            : undefined,
        witnessedBy: formData.witnessedBy.trim() || undefined,
      };

      const newAdministration =
        recordMedicationAdministration(administrationData);

      const statusMessages = {
        administered: "Medication administration recorded successfully.",
        partial: "Partial medication administration recorded.",
        missed: "Missed dose recorded.",
        refused: "Refused dose recorded.",
        delayed: "Delayed administration recorded.",
        cancelled: "Cancelled administration recorded.",
        pending: "Administration status updated to pending.",
      };

      toast({
        title: "Administration Recorded",
        description: statusMessages[formData.status],
        variant:
          formData.status === "missed" || formData.status === "refused"
            ? "destructive"
            : "default",
      });

      if (onSave) {
        onSave(newAdministration);
      }

      // Reset form
      setFormData({
        medicationId: "",
        scheduledTime: new Date().toISOString().slice(0, 16),
        actualTime: new Date().toISOString().slice(0, 16),
        status: "administered",
        dosageGiven: "",
        notes: "",
        sideEffectsObserved: "",
        patientResponse: "good",
        witnessedBy: "",
      });
      setSelectedMedication(null);
    } catch (error) {
      console.error("Error recording administration:", error);
      toast({
        title: "Error",
        description: "Failed to record administration. Please try again.",
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

    // Handle medication selection
    if (field === "medicationId") {
      const medication = medications.find((m) => m.id === value);
      if (medication) {
        setSelectedMedication(medication);
        setFormData((prev) => ({
          ...prev,
          dosageGiven: medication.dosage,
        }));
      } else {
        setSelectedMedication(null);
      }
    }
  };

  const getStatusIcon = (status: AdministrationStatus) => {
    switch (status) {
      case "administered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "missed":
      case "refused":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "delayed":
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: AdministrationStatus) => {
    switch (status) {
      case "administered":
        return "text-green-700 bg-green-50";
      case "partial":
        return "text-yellow-700 bg-yellow-50";
      case "missed":
      case "refused":
        return "text-red-700 bg-red-50";
      case "delayed":
        return "text-orange-700 bg-orange-50";
      default:
        return "text-gray-700 bg-gray-50";
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pill className="h-5 w-5 mr-2 text-blue-600" />
          Record Medication Administration - {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                Select Medication *
              </Label>
              <Select
                value={formData.medicationId || ""}
                onValueChange={(value) =>
                  handleInputChange("medicationId", value)
                }
              >
                <SelectTrigger
                  className={errors.medicationId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Choose a medication..." />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((medication) => (
                    <SelectItem key={medication.id} value={medication.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{medication.medicationName}</span>
                        <Badge variant="outline" className="ml-2">
                          {medication.dosage}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.medicationId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.medicationId}
                </p>
              )}
            </div>

            {/* Medication Details Card */}
            {selectedMedication && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Medication
                      </p>
                      <p className="font-semibold">
                        {selectedMedication.medicationName}
                      </p>
                      {selectedMedication.genericName && (
                        <p className="text-sm text-gray-500">
                          ({selectedMedication.genericName})
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Prescribed Dosage
                      </p>
                      <p>{selectedMedication.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Frequency
                      </p>
                      <p>
                        {selectedMedication.frequency.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Route</p>
                      <p>
                        {selectedMedication.route.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">
                        Instructions
                      </p>
                      <p className="text-sm">
                        {selectedMedication.instructions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="scheduledTime" className="text-base font-medium">
                Scheduled Time *
              </Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) =>
                  handleInputChange("scheduledTime", e.target.value)
                }
                className={errors.scheduledTime ? "border-red-500" : ""}
              />
              {errors.scheduledTime && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.scheduledTime}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="actualTime" className="text-base font-medium">
                Actual Time
                {formData.status === "administered" && " *"}
              </Label>
              <Input
                id="actualTime"
                type="datetime-local"
                value={formData.actualTime}
                onChange={(e) =>
                  handleInputChange("actualTime", e.target.value)
                }
                disabled={
                  formData.status !== "administered" &&
                  formData.status !== "partial" &&
                  formData.status !== "delayed"
                }
                className={errors.actualTime ? "border-red-500" : ""}
              />
              {errors.actualTime && (
                <p className="text-sm text-red-500 mt-1">{errors.actualTime}</p>
              )}
            </div>
          </div>

          {/* Administration Status */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Administration Status *
            </Label>
            <RadioGroup
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {[
                {
                  value: "administered",
                  label: "Administered",
                  icon: CheckCircle,
                },
                { value: "partial", label: "Partial Dose", icon: AlertCircle },
                { value: "missed", label: "Missed", icon: XCircle },
                { value: "refused", label: "Refused", icon: XCircle },
                { value: "delayed", label: "Delayed", icon: Clock },
                { value: "cancelled", label: "Cancelled", icon: AlertTriangle },
              ].map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={status.value} id={status.value} />
                  <Label
                    htmlFor={status.value}
                    className={`flex items-center space-x-2 p-2 rounded border cursor-pointer ${
                      formData.status === status.value
                        ? getStatusColor(status.value as AdministrationStatus)
                        : ""
                    }`}
                  >
                    {getStatusIcon(status.value as AdministrationStatus)}
                    <span className="text-sm">{status.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Dosage and Response (for administered/partial) */}
          {(formData.status === "administered" ||
            formData.status === "partial") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dosageGiven" className="text-base font-medium">
                  Actual Dosage Given *
                </Label>
                <Input
                  id="dosageGiven"
                  placeholder="e.g., 10mg, 1 tablet, 5ml"
                  value={formData.dosageGiven}
                  onChange={(e) =>
                    handleInputChange("dosageGiven", e.target.value)
                  }
                  className={errors.dosageGiven ? "border-red-500" : ""}
                />
                {errors.dosageGiven && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.dosageGiven}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">
                  Patient Response
                </Label>
                <Select
                  value={formData.patientResponse}
                  onValueChange={(value) =>
                    handleInputChange("patientResponse", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good - No issues</SelectItem>
                    <SelectItem value="fair">Fair - Minor concerns</SelectItem>
                    <SelectItem value="poor">Poor - Notable issues</SelectItem>
                    <SelectItem value="adverse">Adverse reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Side Effects */}
          {(formData.status === "administered" ||
            formData.status === "partial") && (
            <div>
              <Label
                htmlFor="sideEffectsObserved"
                className="text-base font-medium"
              >
                Side Effects Observed
              </Label>
              <Textarea
                id="sideEffectsObserved"
                placeholder="Any side effects observed (comma-separated)"
                value={formData.sideEffectsObserved}
                onChange={(e) =>
                  handleInputChange("sideEffectsObserved", e.target.value)
                }
                rows={2}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-medium">
              Notes & Observations
              {(formData.status === "missed" ||
                formData.status === "refused") &&
                " *"}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                formData.status === "missed" || formData.status === "refused"
                  ? "Please provide reason for missed/refused medication..."
                  : "Any additional notes or observations..."
              }
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && (
              <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Witness (for controlled substances or IV medications) */}
          {selectedMedication &&
            (selectedMedication.route === "injection_iv" ||
              selectedMedication.priority === "critical") && (
              <div>
                <Label htmlFor="witnessedBy" className="text-base font-medium">
                  Witnessed By
                  {selectedMedication.route === "injection_iv" && " *"}
                </Label>
                <Input
                  id="witnessedBy"
                  placeholder="Name of witness (required for IV medications)"
                  value={formData.witnessedBy}
                  onChange={(e) =>
                    handleInputChange("witnessedBy", e.target.value)
                  }
                  className={errors.witnessedBy ? "border-red-500" : ""}
                />
                {errors.witnessedBy && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.witnessedBy}
                  </p>
                )}
              </div>
            )}

          {/* Alerts */}
          {formData.patientResponse === "adverse" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Adverse reaction reported. This will generate an alert for the
                medical reviewer.
              </AlertDescription>
            </Alert>
          )}

          {selectedMedication?.sideEffects &&
            selectedMedication.sideEffects.length > 0 && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">
                    Common side effects to watch for:
                  </p>
                  <p className="text-sm">
                    {selectedMedication.sideEffects.join(", ")}
                  </p>
                </AlertDescription>
              </Alert>
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Record Administration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
