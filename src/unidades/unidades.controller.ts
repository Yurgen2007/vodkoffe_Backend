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
  HttpStatus,
  UseGuards,
  Query
} from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto, UpdateUnidadDto } from './dto';
import { 
  RegistrarUnidadesLoteDto, 
  RegistrarUnidadIndividualDto 
} from './dto/registrar-unidades.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  // ==================== ENDPOINTS DE REGISTRO EN LOTES ====================

  /**
   * Registra múltiples unidades en un lote (máximo 12 por lote)
   * POST /unidades/lote/:loteId/registrar-multiple
   */
  @Post('lote/:loteId/registrar-multiple')
  @Permiso(18)
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
  @Permiso(18)
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
  @Permiso(19)
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
  @Permiso(18)
  create(@Body() createUnidadDto: CreateUnidadDto) {
    return this.unidadesService.create(createUnidadDto);
  }

  /**
   * Verifica si un código de unidad ya existe
   * GET /unidades/verificar-codigo?codigo=XXX
   */
  @Get('verificar-codigo')
  async verificarCodigo(@Query('codigo') codigo: string) {
    const existe = await this.unidadesService.verificarCodigoExiste(codigo);
    return { existe, codigo };
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
  @Permiso(20)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUnidadDto: UpdateUnidadDto
  ) {
    return this.unidadesService.update(id, updateUnidadDto);
  }

  @Delete(':id')
  @Permiso(21)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.unidadesService.remove(id);
  }
}