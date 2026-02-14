import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

@InputType()
export class CreateStudentInput {
  @Field()
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Nama siswa tidak boleh kosong' })
  studentName: string;

  @Field({ nullable: true })
  @IsOptional()
  parentName?: string;

  @Field()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Classroom ID diperlukan' })
  classroomId: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  studentName?: string;

  @Field({ nullable: true })
  @IsOptional()
  parentName?: string;

  @Field({ nullable: true })
  @IsOptional()
  teacherName?: string;

  @Field({ nullable: true })
  @IsOptional()
  avatar?: string;
}
