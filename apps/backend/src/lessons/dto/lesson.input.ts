import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

@InputType()
export class CreateLessonInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  moduleId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

@InputType()
export class UpdateLessonInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
