import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ValidationPipe, NotFoundException, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressEntity } from './entities/address.entity';

const route = 'address'
@Controller(route)
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  @ApiOkResponse({ type: AddressEntity })
  create(@Body(new ValidationPipe()) data: CreateAddressDto) {
    return this.addressService.create(data);
  }

  @Get()
  @ApiOkResponse({ type: AddressEntity, isArray: true })
  async findAll() {
    const address = await this.addressService.findAll()
    if (!address.length) throw new HttpException(`No ${route} found.`, HttpStatus.NO_CONTENT);
    return address;
  }

  @Get(':id')
  @ApiOkResponse({ type: AddressEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.findOne(+id)
  }

  @Get(':id&users')
  @ApiOkResponse({ type: AddressEntity })
  async findOneUsers(@Param('id', ParseIntPipe) id: number) {
    return this.addressService.findOneUsers(+id)
  }


  @Patch(':id')
  @ApiOkResponse({ type: AddressEntity })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateAddressDto) {
    return this.addressService.update(+id, data)

  }

  @Delete(':id')
  @ApiOkResponse({ type: AddressEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const address = this.addressService.remove(+id)
    return { address, message: `${route} ${id} deleted` };
  }
}