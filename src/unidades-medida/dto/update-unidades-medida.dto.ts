import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadesMedidaDto } from './create-unidades-medida.dto';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUnidadesMedidaDto extends PartialType(CreateUnidadesMedidaDto) {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;

}
