import { IsString, IsNumber, IsDate, IsOptional, Min, IsInt, IsIn, ValidateIf } from 'class-validator';

export class CreateMovimientoDto {
  @IsString()
  @IsIn(['VENTA', 'NO_VENTA'])
  tipo: string; // 'VENTA' o 'NO_VENTA'

  // Tipo de no venta: degustación, alianza u otro - obligatorio si tipo es NO_VENTA
  @ValidateIf((o) => o.tipo === 'NO_VENTA')
  @IsString()
  @IsIn(['DEGUSTACION', 'ALIANZA', 'OTRO'])
  tipoNoVenta?: string;

  @IsNumber()
  @Min(0)
  cantidadVendida: number;

  @IsNumber()
  @Min(0)
  cantidadDegustacion: number;

  @IsNumber()
  @Min(0)
  cantidadAlianza: number;

  // Cantidad para tipo "OTRO"
  @IsNumber()
  @Min(0)
  cantidadOtro: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDate()
  fechaMovimiento: Date;

  @IsInt()
  fkLote: number;
}
