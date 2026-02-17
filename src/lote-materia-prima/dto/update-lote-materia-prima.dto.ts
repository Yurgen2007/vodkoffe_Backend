import { PartialType } from '@nestjs/mapped-types';
import { CreateLoteMateriaPrimaDto } from './create-lote-materia-prima.dto';

export class UpdateLoteMateriaPrimaDto extends PartialType(CreateLoteMateriaPrimaDto) {}