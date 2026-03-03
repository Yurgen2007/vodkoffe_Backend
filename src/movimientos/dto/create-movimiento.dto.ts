import { IsString, IsNumber, IsDate, IsOptional, Min, IsInt, ValidateIf } from 'class-validator';

export class CreateMovimientoDto {
  @IsString()
  tipo: string; // 'VENTA', 'NO_VENTA', 'INVENTARIO'

  // Tipo de inventario - obligatorio si tipo es INVENTARIO
  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsString()
  tipoInventario?: string;

  // Campos para ventas
  @IsNumber()
  @Min(0)
  cantidadVendida: number;

  @IsNumber()
  @Min(0)
  cantidadDegustacion: number;

  @IsNumber()
  @Min(0)
  cantidadAlianza: number;

  // Campo para inventario
  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsInt()
  @Min(1)
  cantidadInventario?: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // Nombre del cliente al que se le vende
  @IsOptional()
  @IsString()
  nombreCliente?: string;

  // Fecha del movimiento - si no se proporciona, se usa la fecha actual
  @IsOptional()
  @IsDate()
  fechaMovimiento?: Date;

  @IsInt()
  fkLote: number;

  // Usuario que realiza el movimiento
  @IsOptional()
  @IsInt()
  fkUsuario?: number;

  // Unidad para movimientos de inventario
  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsInt()
  fkUnidad?: number;
}

export class UpdateMovimientoDto extends CreateMovimientoDto {}
