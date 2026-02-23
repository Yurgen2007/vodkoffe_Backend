import { IsString, IsNumber, IsDate, IsOptional, Min, IsInt, IsIn, ValidateIf } from 'class-validator';

export class CreateMovimientoDto {
  @IsString()
  @IsIn(['VENTA', 'NO_VENTA', 'INVENTARIO'])
  tipo: string; // 'VENTA', 'NO_VENTA', 'INVENTARIO'

  // Tipo de no venta: degustación, alianza u otro - obligatorio si tipo es NO_VENTA
  @ValidateIf((o) => o.tipo === 'NO_VENTA')
  @IsString()
  @IsIn(['DEGUSTACION', 'ALIANZA', 'OTRO'])
  tipoNoVenta?: string;

  // Tipo de inventario - obligatorio si tipo es INVENTARIO
  @ValidateIf((o) => o.tipo === 'INVENTARIO')
  @IsString()
  @IsIn(['entrada', 'salida', 'ajuste'])
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

  @IsNumber()
  @Min(0)
  cantidadOtro: number;

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

  @IsDate()
  fechaMovimiento: Date;

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
