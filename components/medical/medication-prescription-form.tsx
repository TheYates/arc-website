"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { formatDateRange } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Save, Loader2, X, CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Medication,
  MedicationFrequency,
  MedicationRoute,
  MedicationInteraction,
} from "@/lib/types/medications";
import { createMedication, getMedications } from "@/lib/api/medications";

interface MedicationPrescriptionFormProps {
  patientId: string;
  patientName: string;
  prescribedBy: string;
  onSave?: (medication: Medication) => void;
  onCancel?: () => void;
}

export function MedicationPrescriptionForm({
  patientId,
  patientName,
  prescribedBy,
  onSave,
  onCancel,
}: MedicationPrescriptionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [existingMedications, setExistingMedications] = useState<Medication[]>(
    []
  );
  const [allMedications, setAllMedications] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<MedicationInteraction[]>([]);
  const [medicationSearchOpen, setMedicationSearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const medicationDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "once_daily" as MedicationFrequency,
    route: "oral" as MedicationRoute,
    instructions: "",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load existing medications for interaction checking
    const medications = getMedications(patientId).filter((m) => m.isActive);
    setExistingMedications(medications);

    // Get all previously prescribed medication names for autocomplete
    const allPatientMedications = getMedications(patientId);
    const uniqueMedicationNames = Array.from(
      new Set(allPatientMedications.map((m) => m.medicationName))
    );

    // Add common medications to the list
    const commonMedications = [
      "Lisinopril",
      "Metformin",
      "Amlodipine",
      "Metoprolol",
      "Omeprazole",
      "Simvastatin",
      "Losartan",
      "Albuterol",
      "Gabapentin",
      "Sertraline",
      "Ibuprofen",
      "Acetaminophen",
      "Aspirin",
      "Hydrochlorothiazide",
      "Atorvastatin",
    ];

    const combinedMedications = Array.from(
      new Set([...uniqueMedicationNames, ...commonMedications])
    ).sort();

    setAllMedications(combinedMedications);
  }, [patientId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        medicationDropdownRef.current &&
        !medicationDropdownRef.current.contains(event.target as Node)
      ) {
        setMedicationSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicationName.trim()) {
      newErrors.medicationName = "Medication name is required";
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required";
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = "Instructions are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkInteractions = async (medicationName: string) => {
    if (!medicationName.trim() || existingMedications.length === 0) {
      setInteractions([]);
      return;
    }

    // Create temporary medication object for interaction checking
    const tempMedication: Medication = {
      id: "temp",
      patientId,
      prescribedBy,
      medicationName: medicationName.trim(),
      dosage: formData.dosage,
      frequency: formData.frequency,
      route: formData.route,
      startDate:
        dateRange?.from?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      instructions: formData.instructions,
      isActive: true,
      isPRN: false,
      priority: "medium",
      category: "other",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: prescribedBy,
    };

    try {
      const { checkMedicationInteractions } = await import(
        "@/lib/api/medications"
      );
      const detectedInteractions = checkMedicationInteractions(
        tempMedication,
        existingMedications
      );
      setInteractions(detectedInteractions);
    } catch (error) {
      console.error("Error checking interactions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const medicationData = {
        patientId,
        prescribedBy,
        medicationName: formData.medicationName.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        route: formData.route,
        startDate:
          dateRange?.from?.toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
        endDate: dateRange?.to?.toISOString().split("T")[0] || undefined,
        instructions: formData.instructions.trim(),
        isActive: true,
        isPRN: false,
        priority: "medium" as "low" | "medium" | "high" | "critical",
        category: "other" as any,
        lastModifiedBy: prescribedBy,
      };

      const result = createMedication(medicationData);

      toast({
        title: "Medication Prescribed",
        description:
          result.interactions.length > 0
            ? `Medication prescribed successfully. ${result.interactions.length} drug interaction(s) detected.`
            : "Medication prescribed successfully.",
        variant: result.interactions.length > 0 ? "destructive" : "default",
      });

      if (onSave) {
        onSave(result.medication);
      }

      // Reset form
      setFormData({
        medicationName: "",
        dosage: "",
        frequency: "once_daily",
        route: "oral",
        instructions: "",
      });
      setDateRange({
        from: new Date(),
        to: undefined,
      });
      setInteractions([]);
    } catch (error) {
      console.error("Error prescribing medication:", error);
      toast({
        title: "Error",
        description: "Failed to prescribe medication. Please try again.",
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

    // Check interactions when medication name changes
    if (field === "medicationName") {
      checkInteractions(value);
    }
  };

  const getInteractionSeverityColor = (severity: string) => {
    switch (severity) {
      case "contraindicated":
        return "bg-red-100 text-red-800 border-red-200";
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Drug Interactions Alert */}
      {interactions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Drug Interactions Detected:</p>
              {interactions.map((interaction, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border ${getInteractionSeverityColor(
                    interaction.interactionType
                  )}`}
                >
                  <p className="text-sm font-medium">
                    {interaction.medication1} ↔ {interaction.medication2}
                  </p>
                  <p className="text-xs">{interaction.description}</p>
                  <p className="text-xs font-medium mt-1">
                    Recommendation: {interaction.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medication Name with Search */}
        <div className="relative" ref={medicationDropdownRef}>
          <Label className="text-sm font-medium">Medication Name *</Label>
          <div className="relative">
            <Input
              placeholder="Search or type medication name..."
              value={formData.medicationName}
              onChange={(e) => {
                handleInputChange("medicationName", e.target.value);
                // Only show dropdown if user has typed something
                setMedicationSearchOpen(e.target.value.length > 0);
              }}
              onFocus={() => {
                // Only show dropdown on focus if there's already text
                if (formData.medicationName.length > 0) {
                  setMedicationSearchOpen(true);
                }
              }}
              className={errors.medicationName ? "border-red-500" : ""}
            />
            {medicationSearchOpen && formData.medicationName.length > 0 && (
              <div
                className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                style={{ top: "100%", left: 0 }}
              >
                {allMedications
                  .filter((medication) =>
                    medication
                      .toLowerCase()
                      .includes(formData.medicationName.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((medication) => (
                    <div
                      key={medication}
                      className="px-3 py-2 cursor-pointer hover:text-sm"
                      onClick={() => {
                        handleInputChange("medicationName", medication);
                        setMedicationSearchOpen(false);
                      }}
                    >
                      {medication}
                    </div>
                  ))}
                {allMedications.filter((medication) =>
                  medication
                    .toLowerCase()
                    .includes(formData.medicationName.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No medications found
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.medicationName && (
            <p className="text-sm text-red-500 mt-1">{errors.medicationName}</p>
          )}
        </div>

        {/* Dosage and Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dosage" className="text-sm font-medium">
              Dosage *
            </Label>
            <Input
              id="dosage"
              placeholder="e.g., 10mg, 1 tablet, 5ml"
              value={formData.dosage}
              onChange={(e) => handleInputChange("dosage", e.target.value)}
              className={errors.dosage ? "border-red-500" : ""}
            />
            {errors.dosage && (
              <p className="text-sm text-red-500 mt-1">{errors.dosage}</p>
            )}
          </div>

          <div>
            <Label htmlFor="frequency" className="text-sm font-medium">
              Frequency
            </Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) =>
                handleInputChange("frequency", value as MedicationFrequency)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once_daily">Once Daily</SelectItem>
                <SelectItem value="twice_daily">Twice Daily</SelectItem>
                <SelectItem value="three_times_daily">
                  Three Times Daily
                </SelectItem>
                <SelectItem value="four_times_daily">
                  Four Times Daily
                </SelectItem>
                <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
                <SelectItem value="every_8_hours">Every 8 Hours</SelectItem>
                <SelectItem value="every_12_hours">Every 12 Hours</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="as_needed">As Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Route */}
        <div>
          <Label htmlFor="route" className="text-sm font-medium">
            Route of Administration
          </Label>
          <Select
            value={formData.route}
            onValueChange={(value) =>
              handleInputChange("route", value as MedicationRoute)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="injection_im">Injection (IM)</SelectItem>
              <SelectItem value="injection_iv">Injection (IV)</SelectItem>
              <SelectItem value="injection_sc">Injection (SC)</SelectItem>
              <SelectItem value="topical">Topical</SelectItem>
              <SelectItem value="inhalation">Inhalation</SelectItem>
              <SelectItem value="rectal">Rectal</SelectItem>
              <SelectItem value="nasal">Nasal</SelectItem>
              <SelectItem value="eye_drops">Eye Drops</SelectItem>
              <SelectItem value="ear_drops">Ear Drops</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <Label className="text-sm font-medium">Treatment Period</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Select start date (required) and end date (optional). Click outside
            or press Escape to close.
          </p>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setDatePickerOpen(!datePickerOpen)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                formatDateRange(dateRange.from, dateRange.to)
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>

            {datePickerOpen && (
              <div
                className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg"
                style={{
                  zIndex: 99999,
                  minWidth: "300px",
                }}
              >
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    // Don't auto-close to allow users to adjust their selection
                  }}
                  numberOfMonths={1}
                  disabled={(date: Date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="border-0"
                />
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    {dateRange?.from && dateRange?.to
                      ? `${Math.ceil(
                          (dateRange.to.getTime() - dateRange.from.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days`
                      : dateRange?.from
                      ? "Select end date"
                      : "Select start date"}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setDatePickerOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor="instructions" className="text-sm font-medium">
            Instructions, Side Effects & Notes *
          </Label>
          <Textarea
            id="instructions"
            placeholder="Take with food in the morning. Possible side effects: nausea, dizziness. Contraindications: pregnancy, kidney disease. Additional notes..."
            value={formData.instructions}
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            className={`min-h-[100px] ${
              errors.instructions ? "border-red-500" : ""
            }`}
          />
          {errors.instructions && (
            <p className="text-sm text-red-500 mt-1">{errors.instructions}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Include administration instructions, possible side effects,
            contraindications, and any additional notes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Prescribing..." : "Prescribe Medication"}
          </Button>
        </div>
      </form>
    </div>
  );
}
