import { IsString, IsNumber, IsDate, IsOptional, Min, IsInt, ValidateIf } from 'class-validator';

export class UpdateMovimientoDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsOptional()
  @IsString()
  tipoInventario?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadVendida?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadDegustacion?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadAlianza?: number;

  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadInventario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  nombreCliente?: string;

  @IsOptional()
  @IsDate()
  fechaMovimiento?: Date;

  @IsOptional()
  @IsInt()
  fkLote?: number;

  @IsOptional()
  @IsInt()
  fkUsuario?: number;

  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsOptional()
  @IsInt()
  fkUnidad?: number;
}
