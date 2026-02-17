import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateMateriaPrimaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  costoUnitario?: number;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsNumber()
  @IsOptional()
  fkUnidadMedida?: number;
}
