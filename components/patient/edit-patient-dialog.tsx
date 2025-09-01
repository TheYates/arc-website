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
import { Loader2, Save, X } from "lucide-react";

interface EditPatientDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPatient: Patient) => void;
  userRole: 'admin' | 'caregiver' | 'reviewer';
}

export function EditPatientDialog({
  patient,
  isOpen,
  onClose,
  onSuccess,
  userRole
}: EditPatientDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information (Admin only)
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
    gender: patient.gender || '',
    bloodType: patient.bloodType || '',
    
    // Contact Information (Caregiver + Admin)
    phone: patient.phone || '',
    address: patient.address || '',
    
    // Physical Measurements (Caregiver + Admin)
    heightCm: patient.heightCm?.toString() || '',
    weightKg: patient.weightKg?.toString() || '',
    
    // Emergency Contact (Caregiver + Admin)
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactRelationship: patient.emergencyContactRelationship || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    
 
    
    // Care Management (Reviewer + Admin)
    careLevel: patient.careLevel || 'medium',
    status: patient.status || 'stable',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine which fields the user role can edit
      let allowedFields: Partial<typeof formData> = {};
      
      if (userRole === 'admin' || userRole === 'caregiver') {
        // Admin and Caregivers can edit everything
        allowedFields = { ...formData };
      } else {
        // Reviewers can only edit medical status and history
        allowedFields = {
          careLevel: formData.careLevel,
          status: formData.status,
          
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
      const endpoint = (userRole === 'admin' || userRole === 'caregiver')
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

      if (response.ok && result.patient) {
        toast({
          title: "Patient updated successfully",
          description: "Patient information has been saved.",
        });
        onSuccess(result.patient);
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
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Patient</DialogTitle>
          <DialogDescription className="text-sm">
            {userRole === 'reviewer'
              ? 'Edit care management settings'
              : 'Edit patient information and details'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin & Caregiver - Full Access */}
          {(userRole === 'admin' || userRole === 'caregiver') && (
            <div className="space-y-3">
              {/* Basic Information - 3 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="h-8"
                  />
                </div>
               
              </div>

              {/* Date, Gender, Blood Type - 3 columns */}
              <div className="grid grid-cols-2 gap-3">
              <div>
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-sm">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bloodType" className="text-sm">Blood Type</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleInputChange('bloodType', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A_POSITIVE">A+</SelectItem>
                      <SelectItem value="A_NEGATIVE">A-</SelectItem>
                      <SelectItem value="B_POSITIVE">B+</SelectItem>
                      <SelectItem value="B_NEGATIVE">B-</SelectItem>
                      <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                      <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                      <SelectItem value="O_POSITIVE">O+</SelectItem>
                      <SelectItem value="O_NEGATIVE">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>

              {/* Address - Full width */}
              <div>
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Height, Weight, Emergency Contact Name - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
              
                <div>
                  <Label htmlFor="heightCm" className="text-sm">Height (cm)</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => handleInputChange('heightCm', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="weightKg" className="text-sm">Weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => handleInputChange('weightKg', e.target.value)}
                    className="h-8"
                  />
                </div>
                
              </div>

              {/* Emergency Contact Details - 3 columns */}
              <div className="grid grid-cols-2 gap-3">
              <div>
                  <Label htmlFor="emergencyContactName" className="text-sm">Emergency Contact</Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship" className="text-sm">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    placeholder="e.g., Spouse, Child"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone" className="text-sm">Emergency Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    placeholder="Phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reviewer - Care Management Only */}
          {userRole === 'reviewer' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="careLevel" className="text-sm">Care Level</Label>
                  <Select
                    value={formData.careLevel}
                    onValueChange={(value) => handleInputChange('careLevel', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="h-8">
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
          )}

          {/* Medical Info - All Roles (Compact) */}
          

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} size="sm" className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
