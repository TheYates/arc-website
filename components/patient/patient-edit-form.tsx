"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Patient, CareLevel, PatientStatus } from "@/lib/types/patients";
import { useToast } from "@/hooks/use-toast";

interface PatientEditFormProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPatient: Patient) => void;
  userRole: 'admin' | 'caregiver' | 'reviewer';
}

export function PatientEditForm({
  patient,
  isOpen,
  onClose,
  onSuccess,
  userRole
}: PatientEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    phone: patient.phone || '',
    address: patient.address || '',
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
    gender: patient.gender || '',
    bloodType: patient.bloodType || '',
    heightCm: patient.heightCm?.toString() || '',
    weightKg: patient.weightKg?.toString() || '',
    careLevel: patient.careLevel || 'medium',
    status: patient.status || 'stable',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactRelationship: patient.emergencyContactRelationship || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    insuranceProvider: patient.insuranceProvider || '',
    insurancePolicyNumber: patient.insurancePolicyNumber || '',
    medicalHistory: patient.medicalHistory || '',
    allergies: patient.allergies || '',
    currentMedications: patient.currentMedications || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine which fields the user role can edit
      let allowedFields: Partial<typeof formData> = {};
      
      if (userRole === 'admin') {
        // Admin can edit everything
        allowedFields = { ...formData };
      } else if (userRole === 'caregiver') {
        // Caregivers can edit contact info and basic medical data
        allowedFields = {
          phone: formData.phone,
          address: formData.address,
          heightCm: formData.heightCm,
          weightKg: formData.weightKg,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          emergencyContactPhone: formData.emergencyContactPhone,
          medicalHistory: formData.medicalHistory,
          allergies: formData.allergies,
          currentMedications: formData.currentMedications,
        };
      } else {
        // Reviewers can only edit medical status and history
        allowedFields = {
          careLevel: formData.careLevel,
          status: formData.status,
          medicalHistory: formData.medicalHistory,
          allergies: formData.allergies,
          currentMedications: formData.currentMedications,
        };
      }

      // Clean up empty strings and convert numbers
      const updateData: any = {};
      Object.entries(allowedFields).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'heightCm' || key === 'weightKg') {
            const numValue = parseFloat(value as string);
            if (!isNaN(numValue)) {
              updateData[key] = numValue;
            }
          } else {
            updateData[key] = value;
          }
        }
      });

      // Choose the correct API endpoint based on user role
      const endpoint = userRole === 'admin' 
        ? `/api/admin/patients/${patient.id}`
        : `/api/patients/${patient.id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Patient updated successfully",
          description: "Patient information has been saved.",
        });
        onSuccess(result.data);
        onClose();
      } else {
        throw new Error(result.error || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error updating patient",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient Information</DialogTitle>
          <DialogDescription>
            Update patient details. You can only edit fields allowed for your role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={userRole !== 'admin'}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={userRole !== 'admin'}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={userRole === 'reviewer'}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={userRole !== 'admin'}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={userRole === 'reviewer'}
                rows={2}
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={userRole !== 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleInputChange('bloodType', value)}
                  disabled={userRole !== 'admin'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange('heightCm', e.target.value)}
                  disabled={userRole === 'reviewer'}
                />
              </div>
              <div>
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => handleInputChange('weightKg', e.target.value)}
                  disabled={userRole === 'reviewer'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="careLevel">Care Level</Label>
                <Select
                  value={formData.careLevel}
                  onValueChange={(value) => handleInputChange('careLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="improving">Improving</SelectItem>
                    <SelectItem value="declining">Declining</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {userRole !== 'reviewer' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Details</h3>
            <div>
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Insurance (Admin and Caregiver only) */}
          {userRole !== 'reviewer' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Insurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
