import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, IsUrl, Min } from 'class-validator';
import { BountyStatus, BountyType } from '@prisma/client';

export class UpdateBountyDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: BountyType, required: false })
  @IsEnum(BountyType)
  @IsOptional()
  type?: BountyType;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  price?: number;

  @ApiProperty({ enum: BountyStatus, required: false })
  @IsEnum(BountyStatus)
  @IsOptional()
  status?: BountyStatus;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  githubIssueUrl?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  githubPRUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  attachments?: string[];
}