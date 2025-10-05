import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class QueryAdminMessageDto {
  @ApiPropertyOptional({
    description: 'Nombre d\'éléments à ignorer (pagination)',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments à récupérer (pagination)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  take?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrer par statut de lecture',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  lu?: boolean;
}