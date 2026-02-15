import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { HealthResolver } from './health/health.resolver';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClassroomsModule,
    SubjectsModule,
    ModulesModule,
    LessonsModule,
  ],
  providers: [HealthResolver],
})
export class AppModule {}
