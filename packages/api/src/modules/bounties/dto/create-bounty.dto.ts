import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { BountyType } from '../entities/bounty.entity';

export class CreateBountyDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The login form is not submitting correctly...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: BountyType, example: BountyType.DEVELOPMENT })
  @IsEnum(BountyType)
  @IsNotEmpty()
  type: BountyType;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false, example: 'https://github.com/org/repo/issues/1' })
  @IsUrl()
  @IsOptional()
  githubIssueUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  attachments?: string[];
}