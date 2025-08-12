import { PrismaClient } from "@prisma/client";
import {
  CareNote,
  CreateCareNoteRequest,
  UpdateCareNoteRequest,
} from "@/lib/types/care-notes";

const prisma = new PrismaClient();

// Convert database record to CareNote type
function mapToCareNote(dbNote: any): CareNote {
  return {
    id: dbNote.id,
    patientId: dbNote.patientId,
    authorId: dbNote.authorId,
    authorName:
      dbNote.author?.firstName && dbNote.author?.lastName
        ? `${dbNote.author.firstName} ${dbNote.author.lastName}`
        : "Unknown Author",
    authorRole: dbNote.author?.role === "REVIEWER" ? "reviewer" : "caregiver",
    noteType: dbNote.noteType.toLowerCase(),
    title: dbNote.title,
    content: dbNote.content,
    priority: dbNote.priority.toLowerCase(),
    status: dbNote.status.toLowerCase(),
    tags: dbNote.tags || [],
    isPrivate: dbNote.isPrivate,
    followUpRequired: dbNote.followUpRequired,
    followUpDate: dbNote.followUpDate?.toISOString().split("T")[0],
    createdAt: dbNote.createdAt.toISOString(),
    updatedAt: dbNote.updatedAt.toISOString(),
  };
}

// Get care notes for a patient with optional filtering
export async function getCareNotes(
  patientId: string,
  authorRole?: "caregiver" | "reviewer"
): Promise<CareNote[]> {
  try {
    const whereClause: any = {
      patientId: patientId,
    };

    if (authorRole) {
      whereClause.author = {
        role:
          authorRole === "reviewer"
            ? "REVIEWER"
            : { in: ["CAREGIVER", "SUPER_ADMIN"] },
      };
    }

    const dbNotes = await prisma.careNote.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return dbNotes.map(mapToCareNote);
  } catch (error) {
    console.error("Error fetching care notes:", error);
    throw new Error("Failed to fetch care notes");
  }
}

// Create a new care note
export async function createCareNote(
  noteData: CreateCareNoteRequest
): Promise<CareNote> {
  try {
    const dbNote = await prisma.careNote.create({
      data: {
        patientId: noteData.patientId,
        authorId: noteData.authorId,
        noteType: (noteData.noteType || "general").toUpperCase() as any,
        title: noteData.title,
        content: noteData.content,
        priority: (noteData.priority || "medium").toUpperCase() as any,
        status: "SUBMITTED",
        tags: noteData.tags || [],
        isPrivate: noteData.isPrivate || false,
        followUpRequired: noteData.followUpRequired || false,
        followUpDate: noteData.followUpDate
          ? new Date(noteData.followUpDate)
          : null,
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return mapToCareNote(dbNote);
  } catch (error) {
    console.error("Error creating care note:", error);
    throw new Error("Failed to create care note");
  }
}

// Update an existing care note
export async function updateCareNote(
  noteId: string,
  updateData: UpdateCareNoteRequest
): Promise<CareNote> {
  try {
    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.content !== undefined)
      updateFields.content = updateData.content;
    if (updateData.priority !== undefined)
      updateFields.priority = updateData.priority.toUpperCase();
    if (updateData.status !== undefined)
      updateFields.status = updateData.status.toUpperCase();
    if (updateData.tags !== undefined) updateFields.tags = updateData.tags;
    if (updateData.isPrivate !== undefined)
      updateFields.isPrivate = updateData.isPrivate;
    if (updateData.followUpRequired !== undefined)
      updateFields.followUpRequired = updateData.followUpRequired;
    if (updateData.followUpDate !== undefined) {
      updateFields.followUpDate = updateData.followUpDate
        ? new Date(updateData.followUpDate)
        : null;
    }

    const dbNote = await prisma.careNote.update({
      where: { id: noteId },
      data: updateFields,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return mapToCareNote(dbNote);
  } catch (error) {
    console.error("Error updating care note:", error);
    throw new Error("Failed to update care note");
  }
}

// Delete a care note
export async function deleteCareNote(noteId: string): Promise<void> {
  try {
    await prisma.careNote.delete({
      where: { id: noteId },
    });
  } catch (error) {
    console.error("Error deleting care note:", error);
    throw new Error("Failed to delete care note");
  }
}

// Get a specific care note by ID
export async function getCareNoteById(
  noteId: string
): Promise<CareNote | null> {
  try {
    const dbNote = await prisma.careNote.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!dbNote) {
      return null;
    }

    return mapToCareNote(dbNote);
  } catch (error) {
    console.error("Error fetching care note by ID:", error);
    throw new Error("Failed to fetch care note");
  }
}
