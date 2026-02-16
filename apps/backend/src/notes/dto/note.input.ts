import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentNoteId?: string;
}

@InputType()
export class UpdateNoteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  noteId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;
}
