import { IsNumber, IsInt, Min } from 'class-validator';

export class CreateLoteMateriaPrimaDto {
  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsNumber()
  @Min(0)
  costoUnitario: number;

  @IsInt()
  fkLote: number;

  @IsInt()
  fkMateriaPrima: number;
}