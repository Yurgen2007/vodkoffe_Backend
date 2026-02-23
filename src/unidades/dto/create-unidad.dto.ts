import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateUnidadDto {
  @IsString()
  codigoUnidad: string;

  @IsOptional()
  @IsIn(['DISPONIBLE', 'VENDIDA', 'DEGUSTACION', 'ALIANZA', 'OTRO'])
  estado?: string;

  @IsOptional()
  @IsInt()
  fkLote?: number;

  @IsOptional()
  @IsInt()
  fkInventario?: number;

  @IsOptional()
  @IsInt()
  fkCaracteristica?: number;

  @IsOptional()
  @IsInt()
  fkUnidadMedida?: number;
}
