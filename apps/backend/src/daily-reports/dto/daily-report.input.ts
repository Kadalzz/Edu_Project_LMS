import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Mood } from '../models/daily-report.model';

@InputType()
export class CreateDailyReportInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @Field(() => Mood)
  @IsNotEmpty()
  @IsEnum(Mood)
  mood: Mood;

  @Field(() => [String])
  @IsArray()
  activities: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  achievements?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  challenges?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateDailyReportInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  reportId: string;

  @Field(() => Mood, { nullable: true })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  activities?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  achievements?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  challenges?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class AddCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  reportId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;
}
