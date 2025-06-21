import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Note } from '@repo/db';

class CreateNoteDto {
  content: string;
}

class UpdateNoteDto {
  content: string;
}

@UseGuards(JwtAuthGuard)
@Controller('loans/:loanId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async createNote(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Body() createNoteDto: CreateNoteDto,
    @Request() req,
  ): Promise<Note> {
    const authorId = req.user.id;
    return this.notesService.createNote(
      loanId,
      createNoteDto.content,
      authorId,
    );
  }

  @Get()
  async getNotesForLoan(
    @Param('loanId', ParseUUIDPipe) loanId: string,
  ): Promise<Note[]> {
    return this.notesService.getNotesForLoan(loanId);
  }

  @Put(':noteId')
  async updateNote(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    return this.notesService.updateNote(noteId, updateNoteDto.content);
  }

  @Delete(':noteId')
  async deleteNote(@Param('noteId', ParseUUIDPipe) noteId: string): Promise<Note> {
    return this.notesService.deleteNote(noteId);
  }
} 