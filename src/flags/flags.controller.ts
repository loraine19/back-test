import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FlagEntity } from './entities/flag.entity';
import { $Enums, Flag } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { RequestWithUser } from 'src/auth/auth.entities/auth.entity';

const route = "flags"
@UseGuards(AuthGuard)
@Controller(route)
@ApiTags(route)
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) { }

  //// Create a new flag
  @Post()
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  async create(@Body() data: CreateFlagDto, @Req() req: RequestWithUser): Promise<Flag> {
    data.userId = req.user.sub
    return this.flagsService.create(data)
  }

  //// Retrieve all flags
  @Get()
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAll(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub
    return await this.flagsService.findAll(userId)
  }

  //// Retrieve all flags created by the authenticated user
  @Get('mines')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findMines(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub
    const flags = await this.flagsService.findAllByUserId(userId)
    return flags || []
  }

  //// Retrieve all flags created by a specific user
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAllByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Flag[]> {
    const flags = await this.flagsService.findAllByUserId(userId)
    return flags || []
  }

  //// Retrieve all event flags
  @Get('event')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAllEvent(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub
    const flags = await this.flagsService.findAllEventByUserId(userId)
    return flags || []
  }



  //// Retrieve all survey flags
  @Get('survey')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAllSurvey(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub
    const flags = await this.flagsService.findAllSurveyByUserId(userId)
    return flags || []
  }


  //// Retrieve all post flags
  @Get('post')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAllPost(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub
    const flags = await this.flagsService.findAllPost(userId)
    return flags || []
  }



  //// Retrieve all service flags
  @Get('service')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity, isArray: true })
  async findAllService(@Req() req: RequestWithUser): Promise<Flag[]> {
    const userId = req.user.sub;
    const flags = await this.flagsService.findAllServiceByUserId(userId)
    return flags
  }


  //// Retrieve a specific flag by userId, target, and targetId
  @Get('user:userId/target:target/targetId:targetId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  async findOne(@Param('userId', ParseIntPipe) userId: number, @Param('targetId', ParseIntPipe) targetId: number, @Param('target') target: $Enums.FlagTarget,): Promise<Flag> {
    return await this.flagsService.findOne(userId, targetId, target)
  }

  //// Retrieve a specific flag by userId, target, and targetId
  @Get('mine/:target/:targetId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  async findOneMine(@Req() req: RequestWithUser, @Param('targetId', ParseIntPipe) targetId: number, @Param('target') target: $Enums.FlagTarget,): Promise<Flag> {
    const userId = req.user.sub
    console.log(userId, targetId, target)
    return await this.flagsService.findOne(userId, targetId, target)
  }

  //// Update a specific flag by userId, target, and targetId
  @Patch('user:userId&target:target&targetId:targetId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  async update(@Param('userId', ParseIntPipe) userId: number, @Param('targetId', ParseIntPipe) targetId: number, @Param('target') target: $Enums.FlagTarget, @Body() data: UpdateFlagDto): Promise<Flag> {
    const flag = this.flagsService.update(userId, targetId, target, data);
    return flag
  }

  //// Remove a specific flag by userId, target, and targetId
  @Delete('user:userId&target:target&targetId:targetId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  remove(@Param('userId', ParseIntPipe) userId: number, @Param('targetId', ParseIntPipe) targetId: number, @Param('target') target: $Enums.FlagTarget,): Promise<Flag> {
    const flag = this.flagsService.remove(userId, targetId, target);
    return flag
  }


  @Delete('mine/:target/:targetId')
  @ApiBearerAuth()
  @ApiResponse({ type: FlagEntity })
  async removeMine(@Param('targetId', ParseIntPipe) targetId: number, @Param('target') target: $Enums.FlagTarget, @Req() req: RequestWithUser): Promise<Flag> {
    const userId = req.user.sub
    const flag = await this.flagsService.remove(userId, targetId, target);
    return flag
  }
}
