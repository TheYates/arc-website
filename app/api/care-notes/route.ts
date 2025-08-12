import { NextRequest, NextResponse } from 'next/server';
import { 
  getCareNotes, 
  createCareNote 
} from '@/lib/api/care-notes-prisma';

// GET /api/care-notes - Get care notes with optional filtering
export async function GET(request: NextRequest) {
  try {
    const start = performance.now();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const authorRole = searchParams.get('authorRole') as 'caregiver' | 'reviewer' | null;

    console.log(`🔍 Care Notes API called with patientId: ${patientId}, authorRole: ${authorRole}`);

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const dbStart = performance.now();
    const notes = await getCareNotes(patientId, authorRole || undefined);
    const dbEnd = performance.now();
    
    console.log(`📊 Care notes DB query took ${(dbEnd - dbStart).toFixed(2)}ms, found ${notes.length} notes`);

    const end = performance.now();
    console.log(`✅ Care Notes API completed in ${(end - start).toFixed(2)}ms`);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get care notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care notes' },
      { status: 500 }
    );
  }
}

// POST /api/care-notes - Create new care note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      authorId,
      authorName,
      authorRole,
      noteType,
      title,
      content,
      priority,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate
    } = body;

    // Validate required fields
    if (!patientId || !authorId || !authorName || !authorRole || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, authorId, authorName, authorRole, title, content' },
        { status: 400 }
      );
    }

    // Validate authorRole
    if (!['caregiver', 'reviewer'].includes(authorRole)) {
      return NextResponse.json(
        { error: 'Invalid authorRole. Must be either "caregiver" or "reviewer"' },
        { status: 400 }
      );
    }

    const note = await createCareNote({
      patientId,
      authorId,
      authorName,
      authorRole,
      noteType,
      title,
      content,
      priority,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create care note error:', error);
    return NextResponse.json(
      { error: 'Failed to create care note' },
      { status: 500 }
    );
  }
}
