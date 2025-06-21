import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Note, User } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async createNote(
    loanId: string,
    content: string,
    authorId: string,
  ): Promise<Note> {
    return this.prisma.note.create({
      data: {
        loanId,
        content,
        authorId,
      },
    });
  }

  async getNotesForLoan(loanId: string): Promise<Note[]> {
    return this.prisma.note.findMany({
      where: { loanId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateNote(
    noteId: string,
    content: string,
  ): Promise<Note> {
    return this.prisma.note.update({
      where: { id: noteId },
      data: { content },
    });
  }

  async deleteNote(noteId: string): Promise<Note> {
    return this.prisma.note.delete({
      where: { id: noteId },
    });
  }
} 