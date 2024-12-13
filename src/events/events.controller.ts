import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ValidationPipe, NotFoundException, BadRequestException, ParseIntPipe, ParseUUIDPipe, PipeTransform, Req, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventsService } from './events.service';
import { ImageInterceptor } from 'middleware/ImageInterceptor';
import { parseData } from 'middleware/BodyParser';

const route = 'events'
@Controller(route)
@ApiTags(route)
export class EventsController {
  constructor(private readonly eventsService: EventsService, private usersService: UsersService) { }
  @Post()
  @ApiOkResponse({ type: EventEntity })
  @ApiBody({ type: CreateEventDto })
  @UseInterceptors(ImageInterceptor.create('events'))
  @ApiConsumes('multipart/form-data')
  async create(@Body() data: CreateEventDto, @UploadedFile() image: Express.Multer.File,) {
    parseData(data)
    image && (data = { ...data, image: process.env.STORAGE + image.path.replace('dist', '') })
    return this.eventsService.create(data)
  }


  @Get()
  @ApiOkResponse({ type: EventEntity, isArray: true })
  async findAll() {
    const events = await this.eventsService.findAll()
    if (!events) throw new NotFoundException(`no one ${route} find`)
    return events;
  }

  @Get(':id')
  @ApiOkResponse({ type: EventEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id)
  }

  @Get(':id/withUsers')
  @ApiOkResponse({ type: EventEntity })
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOneUser(id)

  }

  // @Get('mines')
  // @ApiBearerAuth()
  // @ApiOkResponse({ type: EventEntity })
  // async getProfile(@Req() req: RequestWithUser) {
  //   const id = req.user.sub
  //   return this.eventsService.findOne(id)
  // }


  @Patch(':id')
  @ApiOkResponse({ type: EventEntity })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateEventDto): Promise<UpdateEventDto> {
    return this.eventsService.update(id, data)

  }

  @Delete(':id')
  @ApiOkResponse({ type: EventEntity })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<CreateEventDto> {
    return this.eventsService.remove(id)
  }
}
