import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductoDto {

  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsNumber()
  @IsOptional()
  fkUnidadMedida?: number;

  @IsNumber()
  @IsOptional()
  fkCaracteristica?: number;
}
