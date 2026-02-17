import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsNumber()
  @IsOptional()
  fkUnidadMedida?: number;

  @IsNumber()
  @IsOptional()
  fkCaracteristica?: number;
}
