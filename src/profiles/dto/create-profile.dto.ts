import { ApiProperty } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsString, IsNotEmpty, IsBoolean, IsEnum, IsNumber, IsArray, IsOptional } from "class-validator";

export class CreateProfileDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'First name is required' })
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @ApiProperty({ type: 'number', required: false })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    userIdSp: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'User id is required' })
    @Type(() => Number)
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Address id is required' })
    @Type(() => Number)
    @IsNumber()
    addressId: number;

    @ApiProperty({ type: 'string', required: false })
    @IsString()
    phone: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsNotEmpty()
    @IsOptional()
    image: any;

    @ApiProperty({ type: 'boolean', required: false })
    @Transform(({ value }) => value === 'true' ? true : false)
    @IsBoolean()
    addressShared: boolean;

    @ApiProperty({ enum: $Enums.AssistanceLevel, required: false })
    @IsEnum($Enums.AssistanceLevel, { message: 'AssistanceLevel must be part of ' + Object.values($Enums.AssistanceLevel).join(', ') })
    assistance: $Enums.AssistanceLevel;

    @ApiProperty()
    @IsNotEmpty({ message: 'Address id is required' })
    @Type(() => Number)
    @IsNumber()
    points: number;

    @ApiProperty({ type: 'string', required: false })
    @IsOptional()
    @IsString()
    skills: string;
}
