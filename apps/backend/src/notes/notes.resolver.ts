import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNoteInput, UpdateNoteInput } from './dto/note.input';
import { NoteModel, NoteWithRepliesModel } from './models/note.model';

@Resolver()
export class NotesResolver {
  constructor(private readonly notesService: NotesService) {}

  @Mutation(() => NoteModel, { description: 'Create a note for a student' })
  @UseGuards(GqlAuthGuard)
  async createNote(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateNoteInput,
  ): Promise<NoteModel> {
    return this.notesService.createNote(input, user.id);
  }

  @Mutation(() => NoteModel, { description: 'Update a note' })
  @UseGuards(GqlAuthGuard)
  async updateNote(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateNoteInput,
  ): Promise<NoteModel> {
    return this.notesService.updateNote(input, user.id);
  }

  @Mutation(() => NoteModel, { description: 'Delete a note' })
  @UseGuards(GqlAuthGuard)
  async deleteNote(
    @CurrentUser() user: { id: string },
    @Args('noteId') noteId: string,
  ) {
    return this.notesService.deleteNote(noteId, user.id);
  }

  @Query(() => [NoteWithRepliesModel], { description: 'Get notes for a student' })
  @UseGuards(GqlAuthGuard)
  async notesByStudent(
    @CurrentUser() user: { id: string },
    @Args('studentId') studentId: string,
  ): Promise<NoteWithRepliesModel[]> {
    return this.notesService.getNotesByStudent(studentId, user.id);
  }

  @Query(() => NoteWithRepliesModel, { description: 'Get note detail with replies' })
  @UseGuards(GqlAuthGuard)
  async noteDetail(
    @CurrentUser() user: { id: string },
    @Args('noteId') noteId: string,
  ): Promise<NoteWithRepliesModel> {
    return this.notesService.getNoteDetail(noteId, user.id);
  }
}
