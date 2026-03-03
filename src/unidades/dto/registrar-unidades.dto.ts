import { IsInt, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para registrar múltiples unidades de una vez
export class RegistrarUnidadesLoteDto {
  @IsInt()
  loteId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrarUnidadDto)
  @ArrayMinSize(1, { message: 'Debe registrar al menos 1 unidad' })
  @ArrayMaxSize(12, { message: 'No se pueden registrar más de 12 unidades por lote' })
  unidades: RegistrarUnidadDto[];
}

// DTO para unidades individuales (permite código personalizado o se genera automáticamente)
export class RegistrarUnidadDto {
  @IsOptional()
  @IsString()
  codigoUnidad?: string;
}

// DTO para registrar una sola unidad a un lote existente
export class RegistrarUnidadIndividualDto {
  @IsInt()
  loteId: number;
}

// DTO para respuesta
export class UnidadRegistradaResponseDto {
  idUnidad: number;
  codigoUnidad: string;
  estado: string;
  loteId: number;
  createdAt: Date;
}

export class RegistroUnidadesResponseDto {
  success: boolean;
  message: string;
  totalRegistradas: number;
  unidades: UnidadRegistradaResponseDto[];
}
