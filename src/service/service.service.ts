import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums, Profile, Service } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetPoints } from 'middleware/GetPoints';

//// SERVICE MAKE ACTION
@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) { }
  async create(data: CreateServiceDto): Promise<Service> {
    const { userId, userIdResp, ...service } = data
    return await this.prisma.service.create({ data: { ...service, User: { connect: { id: userId } }, UserResp: { connect: { id: userIdResp } } } })
  }

  async findAll(): Promise<Service[]> {
    return await this.prisma.service.findMany({
      where: { status: { notIn: [$Enums.ServiceStep.STEP_3, $Enums.ServiceStep.STEP_4] } },
      include: {
        User: { select: { id: true, email: true, Profile: true } },
        UserResp: { select: { id: true, email: true, Profile: true } }
      }
    });
  }

  async findAllByUser(userId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: {
          OR: [
            { User: { is: { id: userId } } },
            { UserResp: { is: { id: userId } } }
          ]
        },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    return services
  }

  async findAllByUserGet(userId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: {
          OR: [
            { User: { is: { id: userId } } },
            { UserResp: { is: { id: userId } } }
          ],
          type: $Enums.ServiceType.GET
        },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    return services
  }
  async findAllByUserDo(userId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: {
          OR: [
            { User: { is: { id: userId } } },
            { UserResp: { is: { id: userId } } }
          ],
          type: $Enums.ServiceType.DO
        },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    return services
  }

  async findAllByUserId(userId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: { User: { is: { id: userId } } }, include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    return services
  }

  async findAllByUserRespId(userId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: { UserResp: { is: { id: userId } } },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    //   if (!services.length) throw new HttpException(`no services found`, HttpStatus.NO_CONTENT);
    return services
  }

  async findAllGet(): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: { type: $Enums.ServiceType.GET, status: { notIn: [$Enums.ServiceStep.STEP_3, $Enums.ServiceStep.STEP_4] } },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    //   if (!services.length) throw new HttpException(`no services found`, HttpStatus.NO_CONTENT);
    return services
  }


  async findAllDo(): Promise<Service[]> {
    const services = await this.prisma.service.findMany(
      {
        where: { type: $Enums.ServiceType.DO, status: { notIn: [$Enums.ServiceStep.STEP_3, $Enums.ServiceStep.STEP_4] } },
        include: {
          User: { select: { id: true, email: true, Profile: true } },
          UserResp: { select: { id: true, email: true, Profile: true } }
        }
      }
    )
    //   if (!services.length) throw new HttpException(`no services found`, HttpStatus.NO_CONTENT);
    return services
  }


  async findOne(id: number): Promise<Service> {
    return await this.prisma.service.findUniqueOrThrow({
      where: { id },
      include: {
        User: { select: { id: true, email: true, Profile: true } },
        UserResp: { select: { id: true, email: true, Profile: true } }
      }

    });
  }



  async update(id: number, data: any): Promise<Service> {
    const { userId, userIdResp, ...service } = data
    return await this.prisma.service.update({
      where: { id },
      data: { ...service, User: { connect: { id: userId } }, UserResp: { connect: { id: userIdResp } } }
    });
  }
  async updateUserResp(id: number, data: { userIdResp: number }): Promise<Service> {
    const { userIdResp } = data;
    if (userIdResp === 0) {
      return await this.prisma.service.update({
        where: { id },
        data: { UserResp: { disconnect: true }, status: $Enums.ServiceStep.STEP_0 }
      });
    } else {
      return await this.prisma.service.update({
        where: { id },
        data: { UserResp: { connect: { id: userIdResp } }, status: $Enums.ServiceStep.STEP_1 }
      });
    }
  }

  async updateValidUserResp(id: number, data: { userIdResp: number, userId: number }): Promise<Service> {
    const { userIdResp } = data;

    const service = await this.prisma.service.findUnique({ where: { id } });
    console.log((service.userIdResp === userIdResp))
    if (service.userId !== data.userId) {
      throw new HttpException(`You are not allowed to update this service`, HttpStatus.FORBIDDEN)
    }
    if (userIdResp === 0) {
      return await this.prisma.service.update({
        where: { id },
        data: { UserResp: { disconnect: true }, status: $Enums.ServiceStep.STEP_0 }
      });
    } else {
      return await this.prisma.service.update({
        where: { id },
        data: { UserResp: { connect: { id: userIdResp } }, status: $Enums.ServiceStep.STEP_2 }
      });
    }
  }



  async updateFinish(id: number, userId: number): Promise<Service> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { Profile: true } });
    const userResp = await this.prisma.user.findUnique({ where: { id: service.userIdResp }, include: { Profile: true } });
    const points = GetPoints(service, userResp.Profile);
    if (service.userId !== userId) {
      throw new HttpException(`You are not allowed to update this service`, HttpStatus.FORBIDDEN)
    }
    if (user.Profile.points < points) {
      throw new HttpException(`You don't have enough points`, HttpStatus.FORBIDDEN)
    }
    const updateUserProfile: Profile = await this.prisma.profile.update({ where: { id: user.Profile.id }, data: { points: user.Profile.points - points } });
    let updateUserRespProfile: Profile;
    if (updateUserProfile) {
      updateUserRespProfile = await this.prisma.profile.update({ where: { id: userResp.Profile.id }, data: { points: userResp.Profile.points + points } });
    }
    if (updateUserProfile && updateUserRespProfile) {
      return await this.prisma.service.update({
        where: { id },
        data: { status: $Enums.ServiceStep.STEP_3 }
      });
    }
  }

  async remove(id: number): Promise<Service> {
    return await this.prisma.service.delete({ where: { id } });
  }
}
