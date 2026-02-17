import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateUnidadDto {
  @IsString()
  codigoUnidad: string;

  @IsOptional()
  @IsIn(['DISPONIBLE', 'VENDIDA', 'DEGUSTACION', 'ALIANZA'])
  estado?: string;

  @IsInt()
  fkLote: number;
}
