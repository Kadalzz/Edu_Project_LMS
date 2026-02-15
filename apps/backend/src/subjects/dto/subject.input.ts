import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

@InputType()
export class CreateSubjectInput {
  @Field()
  @IsNotEmpty({ message: 'Nama mata pelajaran tidak boleh kosong' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;

  @Field()
  @IsNotEmpty({ message: 'Classroom ID diperlukan' })
  classroomId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class UpdateSubjectInput {
  @Field()
  @IsNotEmpty({ message: 'Subject ID diperlukan' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
