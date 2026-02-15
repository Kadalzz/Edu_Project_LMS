import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsResolver } from './classrooms.resolver';

@Module({
  providers: [ClassroomsService, ClassroomsResolver],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
