import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

@InputType()
export class CreateModuleInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

@InputType()
export class UpdateModuleInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

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
