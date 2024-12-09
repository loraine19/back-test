import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from '../../class'

export class UserEntity extends PartialType(User) {


    @ApiProperty()
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'password is required' })
    @IsString()
    @MinLength(6)
    password: string;

}

