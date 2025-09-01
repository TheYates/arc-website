"use client";

import React from "react";
import { Patient } from "@/lib/types/patients";
import { User } from "@/lib/auth";
import { CareNote } from "@/lib/types/care-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  User as UserIcon,
  Calendar,
  Clock,
} from "lucide-react";

interface CaregiverReviewerNotesTabProps {
  patient: Patient;
  user: User;
  reviewerNotes: CareNote[];
  onRefresh: () => void;
}

export function CaregiverReviewerNotesTab({
  patient,
  user,
  reviewerNotes,
  onRefresh,
}: CaregiverReviewerNotesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reviewer Notes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View notes created by medical reviewers (read-only)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reviewerNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviewer notes available yet</p>
              <p className="text-sm text-muted-foreground">
                Notes from medical reviewers will appear here when created
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {reviewerNotes.map((note, index) => (
                <AccordionItem key={note.id} value={`note-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">Reviewer Note</span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                        >
                          {note.authorName}
                        </Badge>
                        {note.priority !== "medium" && (
                          <Badge variant="outline" className="capitalize text-xs">
                            {note.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(new Date(note.createdAt))}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
