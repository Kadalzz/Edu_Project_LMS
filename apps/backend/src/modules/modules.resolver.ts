import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateModuleInput, UpdateModuleInput } from './dto/module.input';
import {
  ModuleModel,
  ModuleDetailModel,
  ModuleResultModel,
} from './models/module.model';

@Resolver()
export class ModulesResolver {
  constructor(private readonly modulesService: ModulesService) {}

  @Mutation(() => ModuleModel, { description: 'Create a new module in subject (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async createModule(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateModuleInput,
  ): Promise<ModuleModel> {
    return this.modulesService.createModule(input, user.id) as any;
  }

  @Mutation(() => ModuleModel, { description: 'Update module (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async updateModule(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateModuleInput,
  ): Promise<ModuleModel> {
    return this.modulesService.updateModule(input, user.id) as any;
  }

  @Mutation(() => ModuleResultModel, { description: 'Delete module (Teacher only)' })
  @UseGuards(GqlAuthGuard)
  async deleteModule(
    @CurrentUser() user: { id: string },
    @Args('moduleId') moduleId: string,
  ): Promise<ModuleResultModel> {
    return this.modulesService.deleteModule(moduleId, user.id) as any;
  }

  @Query(() => [ModuleModel], { description: 'Get modules for a subject' })
  @UseGuards(GqlAuthGuard)
  async modules(
    @CurrentUser() user: { id: string },
    @Args('subjectId') subjectId: string,
  ): Promise<ModuleModel[]> {
    return this.modulesService.getModulesBySubject(subjectId, user.id) as any;
  }

  @Query(() => ModuleDetailModel, { description: 'Get module detail with lessons' })
  @UseGuards(GqlAuthGuard)
  async moduleDetail(
    @CurrentUser() user: { id: string },
    @Args('moduleId') moduleId: string,
  ): Promise<ModuleDetailModel> {
    return this.modulesService.getModuleDetail(moduleId, user.id) as any;
  }
}
