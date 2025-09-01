"use client";

import React, { useState } from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { MedicalReview } from "@/lib/types/medical-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Calendar, User as UserIcon, RefreshCw } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { createMedicalReview } from "@/lib/api/medical-reviews-client";
import { useToast } from "@/hooks/use-toast";

interface ReviewerMedicalReviewsTabProps {
  patient: Patient;
  user: User;
  medicalReviews: MedicalReview[];
  onRefresh: () => Promise<void>;
}

export function ReviewerMedicalReviewsTab({
  patient,
  user,
  medicalReviews,
  onRefresh,
}: ReviewerMedicalReviewsTabProps) {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "routine" as any,
    title: "",
    findings: "",
    assessment: "",
    recommendations: "",
    treatmentPlan: "",
    followUpRequired: false,
    followUpDate: "",
    priority: "medium" as any,
    reviewedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createMedicalReview({
        patientId: patient.id,
        reviewerId: user.id,
        createdById: user.id,
        reviewType: formData.type.toUpperCase() as any,
        priority: formData.priority.toUpperCase() as any,
        title: formData.title,
        description: formData.assessment || formData.findings || "Medical review",
        findings: formData.findings,
        recommendations: formData.recommendations,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate || undefined,
      });

      // Reset form
      setFormData({
        type: "routine",
        title: "",
        findings: "",
        assessment: "",
        recommendations: "",
        treatmentPlan: "",
        followUpRequired: false,
        followUpDate: "",
        priority: "medium",
        reviewedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });

      setShowCreateForm(false);
      await onRefresh();

      toast({
        title: "Medical Review Created",
        description: "The medical review has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating medical review:", error);
      toast({
        title: "Error",
        description: "Failed to create medical review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';

    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Medical Reviews
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage medical reviews for this patient
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Create Review"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Review Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter review title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Findings</label>
                <Textarea
                  value={formData.findings}
                  onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
                  placeholder="Document your findings..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assessment</label>
                <Textarea
                  value={formData.assessment}
                  onChange={(e) => setFormData(prev => ({ ...prev, assessment: e.target.value }))}
                  placeholder="Your assessment..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recommendations</label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Treatment recommendations..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="followUpRequired" className="text-sm font-medium">
                  Follow-up required
                </label>
              </div>

              {formData.followUpRequired && (
                <div>
                  <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                  <Input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? "Creating..." : "Create Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {medicalReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No medical reviews yet. Create the first review for this patient.
              </p>
            </CardContent>
          </Card>
        ) : (
          medicalReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {review.reviewerName}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(review.priority)}>
                      {review.priority}
                    </Badge>
                    <Badge className={getStatusColor(review.status)}>
                      {review.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {review.findings && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Findings</p>
                      <p className="text-sm">{review.findings}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Assessment</p>
                    <p className="text-sm">{review.assessment}</p>
                  </div>

                  {review.recommendations && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Recommendations</p>
                      <p className="text-sm">{review.recommendations}</p>
                    </div>
                  )}

                  {review.followUpRequired && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm font-medium text-yellow-800">Follow-up Required</p>
                      {review.followUpDate && (
                        <p className="text-sm text-yellow-700">
                          Scheduled for: {formatDate(review.followUpDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
