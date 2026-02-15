import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateClassroomInput {
  @Field()
  @IsNotEmpty({ message: 'Nama kelas tidak boleh kosong' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateClassroomInput {
  @Field()
  @IsNotEmpty({ message: 'Classroom ID diperlukan' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class EnrollStudentInput {
  @Field()
  @IsNotEmpty({ message: 'Classroom ID diperlukan' })
  classroomId: string;

  @Field()
  @IsNotEmpty({ message: 'Student User ID diperlukan' })
  studentUserId: string;
}

@InputType()
export class UnenrollStudentInput {
  @Field()
  @IsNotEmpty({ message: 'Classroom ID diperlukan' })
  classroomId: string;

  @Field()
  @IsNotEmpty({ message: 'Student User ID diperlukan' })
  studentUserId: string;
}
