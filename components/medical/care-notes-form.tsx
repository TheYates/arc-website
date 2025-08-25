"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Save,
  Loader2,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { CareNote, CreateCareNoteRequest } from "@/lib/types/care-notes";
import { createCareNote } from "@/lib/api/care-notes-client";
import { formatDate } from "@/lib/utils";

interface CareNotesFormProps {
  patientId: string;
  patientName: string;
  authorId: string;
  authorName: string;
  authorRole: "caregiver" | "reviewer";
  onSave: () => void;
  onCancel: () => void;
}

interface CareNotesHistoryProps {
  notes: CareNote[];
  currentUserRole: "caregiver" | "reviewer";
}

export function CareNotesForm({
  patientId,
  patientName,
  authorId,
  authorName,
  authorRole,
  onSave,
  onCancel,
}: CareNotesFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a title and content for the note.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const noteData: CreateCareNoteRequest = {
        patientId,
        authorId,
        authorName,
        authorRole,
        title: formData.title.trim(),
        content: formData.content.trim(),
        noteType: "general",
        priority: "medium",
      };

      await createCareNote(noteData);
      
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });

      onSave();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="border p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">Creating Note for</h4>
            <p className="text-sm text-muted-foreground">{patientName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Author</p>
            <p className="text-sm font-medium">{authorName}</p>
            
          </div>
        </div>
      </div>

      {/* Note Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Note Title *
          </Label>
          <Input
            id="title"
            placeholder="Brief title for this note..."
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-sm font-medium">
            Note Content *
          </Label>
          <Textarea
            id="content"
            placeholder="Enter your detailed note here..."
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            rows={6}
            className="mt-1"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function CareNotesHistory({ notes, currentUserRole }: CareNotesHistoryProps) {
  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notes available yet</p>
          <p className="text-sm text-muted-foreground">
            Notes will appear here when created
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {note.authorName}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(new Date(note.createdAt))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge 
                  variant="outline" 
                  className={`capitalize ${
                    note.authorRole === 'caregiver' 
                      ? 'bg-teal-100 text-teal-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {note.authorRole}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {note.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
              {note.followUpRequired && note.followUpDate && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>
                    Follow-up required by {formatDate(new Date(note.followUpDate))}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
