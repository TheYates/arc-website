"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MedicationPrescriptionForm } from "@/components/medical/medication-prescription-form";
import { Medication } from "@/lib/types/medications";

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  prescribedBy: string;
  onSave?: (medication: Medication) => void;
}

export function PrescriptionDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  prescribedBy,
  onSave,
}: PrescriptionDialogProps) {
  const handleSave = (medication: Medication) => {
    onSave?.(medication);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Prescribe Medication</DialogTitle>
        </DialogHeader>
        <MedicationPrescriptionForm
          patientId={patientId}
          patientName={patientName}
          prescribedBy={prescribedBy}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
