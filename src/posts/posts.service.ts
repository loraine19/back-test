import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreatePostDto): Promise<Post> {
    const { userId, ...post } = data
    return await this.prisma.post.create({ data: { ...post, User: { connect: { id: userId } } } })
  }

  async findAll(): Promise<Post[]> {
    return await this.prisma.post.findMany(
      {
        include: { User: { select: { email: true, Profile: true } }, Likes: { include: { User: { select: { email: true, Profile: true, id: true } } } } }
      }
    );
  }


  async findOne(id: number): Promise<Post> {
    return await this.prisma.post.findUniqueOrThrow({
      where: { id },
      include: { User: { select: { email: true, Profile: true, id: true } }, Likes: { include: { User: { select: { email: true, Profile: true, id: true } } } } }

    });
  }

  async findAllByUserId(userId: number): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: { User: { select: { email: true, Profile: true, id: true } }, Likes: { include: { User: { select: { email: true, Profile: true, id: true } } } } }
    });
    // if (!posts || posts.length === 0) throw new HttpException(`no posts found for ${userId}`, HttpStatus.NO_CONTENT);
    return posts
  }

  async findAllByLikeId(userId: number): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { Likes: { some: { userId } } },
      include: {
        User: { select: { id: true, email: true, Profile: true } },
        Likes: { include: { User: { select: { email: true, Profile: true, id: true } } } },
      }
    })
    //if (!events.length) throw new HttpException(`no events found`, HttpStatus.NO_CONTENT);
    return posts
  }


  async update(id: number, data: any): Promise<Post> {
    const { userId, ...post } = data
    return await this.prisma.post.update({
      where: { id },
      data: { ...post, User: { connect: { id: userId } } }
    });
  }

  async remove(id: number): Promise<Post> {
    return await this.prisma.post.delete({ where: { id } });
  }
}
