import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ValidationPipe, NotFoundException } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Entity } from 'src/participants/entities/participant.entity';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';


const route = 'address'

@Controller(route)
export class AddressController {
  constructor(private readonly service: AddressService) { }

  @Post()
  create(@Body(new ValidationPipe()) data: CreateAddressDto) {
    const creat = this.service.create(data);
    if (!creat) throw new NotFoundException(`no ${route} created`)
    return this.service.create(data);
  }

  @Get()
  async findAll() {
    const data = await this.service.findAll()
    if (!data) throw new NotFoundException(`no ${route} find`)
    return data;
  }

  @Get(':id')
  @ApiOkResponse({ type: Entity })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(+id)
    if (!data) throw new NotFoundException(`no ${id} find in ${route}`)
    return data;

  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAddressDto) {
    const find = this.service.findOne(+id)
    const update = this.service.update(+id, data)
    if (!find) throw new NotFoundException(`no ${id} find in ${route}`)
    if (!update) throw new NotFoundException(`${route} ${id} not updated`)
    return update;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const find = this.service.findOne(+id)
    const remove = this.service.remove(+id)
    if (!find) throw new NotFoundException(`no ${id} find in ${route}`)
    if (!remove) throw new NotFoundException(`${route} ${id} not deleted`)
    return this.service.remove(+id);
  }
}