import { Injectable } from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Participant } from '@prisma/client';


//// SERVICE MAKE ACTION
@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) { }
  async create(data: CreateParticipantDto): Promise<any> {
    const { userId, eventId } = data;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, Profile: true } });

    const participation = await this.prisma.participant.create({
      data: {
        User: { connect: { id: userId } },
        Event: { connect: { id: eventId } },
      }
    });
    return { ...participation, User: user }
  }


  async remove(userId: number, eventId: number): Promise<Participant> {
    return await this.prisma.participant.delete({ where: { userId_eventId: { userId, eventId } }, });
  }
}