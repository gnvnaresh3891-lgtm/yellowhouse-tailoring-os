import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ShoulderSlopeOption {
  NORMAL = 'normal',
  SLOPED = 'sloped',
  SQUARE = 'square',
  VERY_SLOPED = 'very_sloped',
}

export enum BackCurvatureOption {
  NORMAL = 'normal',
  STOOPED = 'stooped',
  ERECT = 'erect',
  PROMINENT_BLADE = 'prominent_blade',
}

export enum AbdomenStanceOption {
  NORMAL = 'normal',
  PROMINENT = 'prominent',
  FLAT = 'flat',
}

export enum HipSpineStanceOption {
  NORMAL = 'normal',
  HIGH_HIP = 'high_hip',
  SWAY_BACK = 'sway_back',
}

export class PostureProfileDto {
  @IsEnum(ShoulderSlopeOption)
  shoulderSlope: ShoulderSlopeOption;

  @IsEnum(BackCurvatureOption)
  backCurvature: BackCurvatureOption;

  @IsEnum(AbdomenStanceOption)
  abdomenStance: AbdomenStanceOption;

  @IsEnum(HipSpineStanceOption)
  hipSpineStance: HipSpineStanceOption;
}

export enum FitPreferenceOption {
  SKINNY = 'skinny',
  SLIM = 'slim',
  REGULAR = 'regular',
  RELAXED = 'relaxed',
}

export class CalculateEaseDto {
  @IsString()
  garmentCategory: string; // e.g. 'mens-suit', 'womens-blouse'

  @IsEnum(FitPreferenceOption)
  fitPreference: FitPreferenceOption;

  @ValidateNested()
  @Type(() => PostureProfileDto)
  postureProfile: PostureProfileDto;

  @IsObject()
  measurements: Record<string, number>; // key: pom code/id, value: net body in inches

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  fabricStretchPercent?: number; // e.g. 5 for 5% stretch
}
