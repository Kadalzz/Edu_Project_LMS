import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse, RefreshTokenResponse, MessageResponse } from './dto/auth.response';
import { UserModel } from './models/user.model';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
class ChangePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}

@InputType()
class RefreshTokenInput {
  @Field()
  @IsNotEmpty()
  refreshToken: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { description: 'Login with email and password' })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input.email, input.password) as any;
  }

  @Mutation(() => RefreshTokenResponse, { description: 'Refresh access token' })
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(input.refreshToken) as any;
  }

  @Query(() => UserModel, { description: 'Get current logged-in user' })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: { id: string }): Promise<UserModel> {
    return this.authService.getMe(user.id) as any;
  }

  @Mutation(() => MessageResponse, { description: 'Change password' })
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @CurrentUser() user: { id: string },
    @Args('input') input: ChangePasswordInput,
  ): Promise<MessageResponse> {
    return this.authService.changePassword(
      user.id,
      input.currentPassword,
      input.newPassword,
    ) as any;
  }
}
