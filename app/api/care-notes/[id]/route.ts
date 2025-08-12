import { NextRequest, NextResponse } from 'next/server';
import { 
  getCareNoteById, 
  updateCareNote,
  deleteCareNote 
} from '@/lib/api/care-notes-prisma';

// GET /api/care-notes/[id] - Get specific care note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await getCareNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Care note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Get care note error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care note' },
      { status: 500 }
    );
  }
}

// PUT /api/care-notes/[id] - Update care note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      priority,
      status,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate
    } = body;

    const note = await updateCareNote(id, {
      title,
      content,
      priority,
      status,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Update care note error:', error);
    return NextResponse.json(
      { error: 'Failed to update care note' },
      { status: 500 }
    );
  }
}

// DELETE /api/care-notes/[id] - Delete care note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCareNote(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete care note error:', error);
    return NextResponse.json(
      { error: 'Failed to delete care note' },
      { status: 500 }
    );
  }
}
