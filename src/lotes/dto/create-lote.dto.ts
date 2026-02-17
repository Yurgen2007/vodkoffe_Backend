import { IsString, IsNumber, IsDate, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLoteDto {
  @IsString()
  codigoLote: string;

  @IsInt()
  @Min(1)
  cantidadUnidades: number;

  @IsDate()
  fechaProduccion: Date;

  @IsOptional()
  @IsDate()
  fechaVencimiento?: Date;

  @IsNumber()
  @Min(0)
  costoUnitario: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsInt()
  fkProducto: number;

  // Materias primas para este lote
  @IsOptional()
  materiasPrimas?: {
    idMateriaPrima: number;
    cantidad: number;
    costoUnitario: number;
  }[];
}
