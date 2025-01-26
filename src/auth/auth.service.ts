//src/auth/auth.service.ts
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity, RefreshEntity } from './auth.entities/auth.entity';
import * as argon2 from 'argon2';
import { SignInDto } from './dto/signIn.dto';
import { $Enums } from '@prisma/client';
import { MailerService } from 'src/mailer/mailer.service';
import PrismaClientTransaction from '@prisma/client';


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService, private mailerService: MailerService) { }

    async generateAccessToken(sub: number) { return this.jwtService.sign({ sub }, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_ACCESS }) }

    async generateRefreshToken(sub: number) { return this.jwtService.sign({ sub }, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_REFRESH }) }

    async generateVerifyToken(sub: number) { return this.jwtService.sign({ sub }, { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_VERIFY }) }

    async signUp(data: SignInDto): Promise<AuthEntity | { message: string }> {
        let { email, password } = data
        const user = await this.prisma.user.findUnique({ where: { email: email } });
        if (user) return { message: 'Vous avez déjà un compte' };
        password = await argon2.hash(password);
        const createdUser = await this.prisma.user.create({ data: { email, password } });
        const verifyToken = await this.generateRefreshToken(createdUser.id);
        await this.prisma.token.create({ data: { userId: createdUser.id, token: await argon2.hash(verifyToken), type: $Enums.TokenType.VERIFY } })
        this.mailerService.sendVerificationEmail(email, verifyToken)
        return { message: 'Votre compte à bien été crée, veuillez vérifier votre email' }
    }

    //// SIGN IN
    async signIn(data: SignInDto): Promise<AuthEntity | { message: string }> {
        let { email, password } = data
        const user = await this.prisma.user.findUniqueOrThrow({ where: { email: email } });
        if (!user) { throw new HttpException('User not found', 404) }
        const isPasswordValid = await argon2.verify(user.password, password)
        if (!isPasswordValid) return { message: 'mot de passe incorrect' }
        if (user.status === $Enums.UserStatus.INACTIVE) {
            this.mailerService.sendVerificationEmail(email, await this.generateVerifyToken(user.id));
            return { message: 'Votre compte est inactif, veuillez verifier votre email' }
        }
        const refreshToken = await this.generateRefreshToken(user.id);
        await this.prisma.token.deleteMany({ where: { userId: user.id } })
        await this.prisma.token.create({ data: { userId: user.id, token: await argon2.hash(refreshToken), type: $Enums.TokenType.REFRESH } })
        return {
            accessToken: await this.generateAccessToken(user.id),
            refreshToken

        }
    }

    //// SIGN IN VERIFY
    async signInVerify(data: SignInDto & { verifyToken: string }): Promise<AuthEntity> {
        let { email, password, verifyToken } = data
        const user = await this.prisma.user.findUniqueOrThrow({ where: { email: email } });
        !user && new HttpException('Utilisateur introuvable', 404)
        const userToken = await this.prisma.token.findFirst({ where: { userId: user.id, type: $Enums.TokenType.VERIFY } })
        if (!userToken) throw new HttpException('Erreur de verification', 404)
        const refreshTokenValid = await argon2.verify(userToken.token, verifyToken)
        if (!refreshTokenValid) throw new HttpException('Probleme de verification' + userToken.createdAt, 401)
        const isPasswordValid = await argon2.verify(user.password, password)
        if (!isPasswordValid) throw new HttpException('Invalid password', 401)
        const refreshToken = await this.generateRefreshToken(user.id);
        await this.prisma.user.update({ where: { id: user.id }, data: { status: $Enums.UserStatus.ACTIVE } })
        await this.prisma.token.deleteMany({ where: { userId: user.id, type: $Enums.TokenType.REFRESH } })
        await this.prisma.token.create({ data: { userId: user.id, token: await argon2.hash(refreshToken), type: $Enums.TokenType.REFRESH } })
        return {
            accessToken: await this.generateAccessToken(user.id),
            refreshToken
        }
    }


    /// RERESH TOKEN
    async refresh(refreshToken: string, userId: number): Promise<AuthEntity | { message: string }> {
        // Use PrismaClientTransaction to avoid errror in case of multi entrance in the same time
        return await this.prisma.$transaction(async (prisma) => {
            try {
                const userToken = await prisma.token.findFirst({ where: { userId: userId, type: $Enums.TokenType.REFRESH } });
                if (!userToken) throw new HttpException('Impossible de renouveller la connexion , identifiez vous ', 400);

                const refreshTokenValid = await argon2.verify(userToken.token, refreshToken.trim());
                if (!refreshTokenValid) {
                    console.log('refreshTokenValid', refreshTokenValid, refreshToken, userToken.token)
                    console.log(this.jwtService.decode(refreshToken), userToken.createdAt);
                    throw new HttpException('connexion interrompue, re-identifiez vous ', 400);
                }
                await prisma.token.deleteMany({
                    where: { userId, type: $Enums.TokenType.REFRESH }
                });

                const newRefreshToken = await this.generateRefreshToken(userId);
                const newRefreshTokenHash = await argon2.hash(newRefreshToken);
                const createdToken = await prisma.token.create({
                    data: {
                        userId,
                        token: newRefreshTokenHash,
                        // temporaire le temps des tests
                        check: newRefreshToken,
                        type: $Enums.TokenType.REFRESH
                    }
                });
                return {
                    accessToken: await this.generateAccessToken(userId),
                    refreshToken: newRefreshToken
                };
            } catch (error) {
                console.error('Erreur lors du refresh du token :', error);
                throw new HttpException(error.message, 401);
            }
        });
    }
}