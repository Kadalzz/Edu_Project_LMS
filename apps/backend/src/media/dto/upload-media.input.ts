import { InputType, Field } from '@nestjs/graphql';
import { MediaType } from '../../lessons/models/lesson.model';

@InputType()
export class UploadMediaInput {
  @Field(() => MediaType)
  type: MediaType;

  @Field({ nullable: true })
  folder?: string;
}
