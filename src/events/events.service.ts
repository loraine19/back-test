import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Event } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Participant } from 'src/class';

//// SERVICE MAKE ACTION
@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }
  async create(data: CreateEventDto): Promise<Event> {
    const { userId, addressId, ...event } = data
    return await this.prisma.event.create({
      data: { ...event, Address: { connect: { id: addressId } }, User: { connect: { id: userId } } }
    });
  }

  async findAll(): Promise<Event[]> {
    return await this.prisma.event.findMany();
  }

  async findOne(id: number): Promise<Event> {
    return await this.prisma.event.findUniqueOrThrow({
      where: { id },
    });
  }

  async findOneUser(id: number): Promise<Event> {
    return await this.prisma.event.findUniqueOrThrow({
      where: { id },
      include: { Participant: { include: { User: true } } },
    });
  }

  async update(id: number, data: UpdateEventDto): Promise<Event> {
    const { userId, addressId, ...event } = data
    return await this.prisma.event.update({
      where: { id },
      data: { ...event, Address: { connect: { id: addressId } }, User: { connect: { id: userId } } }
    });
  }

  async remove(id: number): Promise<Event> {
    return await this.prisma.event.delete({ where: { id } });
  }
}
