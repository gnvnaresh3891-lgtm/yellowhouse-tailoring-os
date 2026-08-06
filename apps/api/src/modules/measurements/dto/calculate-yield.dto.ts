import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CalculateYieldDto {
  @IsString()
  garmentCategory: string; // e.g. 'mens-suit', 'womens-lehenga'

  @IsNumber()
  @Min(36)
  @Max(60)
  fabricWidthInches: number; // 36, 44, 54, 60

  @IsOptional()
  @IsNumber()
  @Min(24)
  @Max(64)
  chestOrHipSizeInches?: number; // Client key body dimension for size scaling

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(70)
  girthMeasurement?: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(80)
  lengthMeasurement?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  patternRepeatInches?: number; // Directional / plaid pattern repeat

  @IsOptional()
  @IsBoolean()
  hasShrinkage?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  shrinkagePercent?: number; // Custom shrinkage % (default 5% if hasShrinkage is true)

  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(32)
  panelCount?: number; // For Lehenga/Anarkali kalis (12, 16, 24)
}
