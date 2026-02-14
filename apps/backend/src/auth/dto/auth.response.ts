import { ObjectType, Field } from '@nestjs/graphql';
import { UserModel } from '../models/user.model';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserModel)
  user: UserModel;
}

@ObjectType()
export class RefreshTokenResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}

@ObjectType()
export class MessageResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
