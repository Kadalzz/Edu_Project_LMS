import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { PrismaModule } from './prisma/prisma.module';
import { HealthResolver } from './health/health.resolver';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { NotesModule } from './notes/notes.module';
import { DailyReportsModule } from './daily-reports/daily-reports.module';
import { ProgressModule } from './progress/progress.module';
import { MediaModule } from './media/media.module';
import { R2Module } from './r2/r2.module';

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
    AssignmentsModule,
    NotesModule,
    DailyReportsModule,
    ProgressModule,
    R2Module,
    MediaModule,
  ],
  providers: [HealthResolver],
})
export class AppModule {}
