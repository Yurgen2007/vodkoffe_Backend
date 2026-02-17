import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto, UpdateUnidadDto } from './dto';
import { 
  RegistrarUnidadesLoteDto, 
  RegistrarUnidadIndividualDto 
} from './dto/registrar-unidades.dto';

@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  // ==================== ENDPOINTS DE REGISTRO EN LOTES ====================

  /**
   * Registra múltiples unidades en un lote (máximo 12 por lote)
   * POST /unidades/lote/:loteId/registrar-multiple
   */
  @Post('lote/:loteId/registrar-multiple')
  @HttpCode(HttpStatus.CREATED)
  async registrarMultiple(
    @Param('loteId', ParseIntPipe) loteId: number,
    @Body() dto: RegistrarUnidadesLoteDto,
  ) {
    dto.loteId = loteId;
    return this.unidadesService.registrarUnidadesEnLote(dto);
  }

  /**
   * Registra una sola unidad en un lote
   * POST /unidades/lote/:loteId/registrar
   */
  @Post('lote/:loteId/registrar')
  @HttpCode(HttpStatus.CREATED)
  async registrarIndividual(
    @Param('loteId', ParseIntPipe) loteId: number,
    @Body() dto: RegistrarUnidadIndividualDto,
  ) {
    dto.loteId = loteId;
    return this.unidadesService.registrarUnidadIndividual(dto);
  }

  /**
   * Obtiene todas las unidades de un lote
   * GET /unidades/lote/:loteId
   */
  @Get('lote/:loteId')
  async obtenerPorLote(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.unidadesService.obtenerUnidadesPorLote(loteId);
  }

  /**
   * Verifica si un lote está completo (12 unidades)
   * GET /unidades/lote/:loteId/estado
   */
  @Get('lote/:loteId/estado')
  async verificarEstadoLote(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.unidadesService.verificarLoteCompleto(loteId);
  }

  // ==================== ENDPOINTS CRUD ORIGINALES ====================

  @Post()
  create(@Body() createUnidadDto: CreateUnidadDto) {
    return this.unidadesService.create(createUnidadDto);
  }

  @Get()
  findAll() {
    return this.unidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unidadesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUnidadDto: UpdateUnidadDto
  ) {
    return this.unidadesService.update(id, updateUnidadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.unidadesService.remove(id);
  }
}