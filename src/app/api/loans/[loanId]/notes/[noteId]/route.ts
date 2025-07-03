import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';
import prisma from '../../../../../../../packages/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { loanId: string; noteId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    // Verify loan belongs to user's organization and note exists
    const note = await prisma.note.findFirst({
      where: {
        id: params.noteId,
        loanId: params.loanId,
        loan: {
          organizationId: user.organizationId,
        }
      },
      include: {
        loan: { select: { organizationId: true } }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only allow the author to update their own notes
    if (note.authorId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this note' }, { status: 403 });
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.noteId },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { loanId: string; noteId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User or organization not found' }, { status: 404 });
    }

    // Verify loan belongs to user's organization and note exists
    const note = await prisma.note.findFirst({
      where: {
        id: params.noteId,
        loanId: params.loanId,
        loan: {
          organizationId: user.organizationId,
        }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only allow the author to delete their own notes
    if (note.authorId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this note' }, { status: 403 });
    }

    const deletedNote = await prisma.note.delete({
      where: { id: params.noteId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(deletedNote);
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 