import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificacionesService } from './notificaciones.service';
import { Lotes } from '../lotes/entities/lote.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Injectable()
export class CronMonitorService {
    constructor(
        private readonly notificacionesService: NotificacionesService,
        @InjectRepository(Lotes)
        private readonly loteRepository: Repository<Lotes>,
        @InjectRepository(Unidades)
        private readonly unidadesRepository: Repository<Unidades>,
    ) { }

    // Se ejecuta una vez al día a las 8:00 AM para verificar lotes por vencer y stock bajo
    @Cron('0 8 * * *')
    async handleCron() {
        console.log('⏰ Ejecutando verificación diaria de lotes por vencer y stock bajo...');
        await this.notificacionesService.notificarLotesPorVencer();
        await this.notificacionesService.notificarLotesStockBajo();
        console.log('✅ Verificación diaria completada');
    }

    // Se ejecuta cada 10 segundos para verificar stock bajo de lotes
    @Cron('*/10 * * * * *')
    async handleCronStockBajo() {
        console.log('⏰ Verificando y corrigiendo unidades de todos los lotes...');
        
        // Primero verificar y corregir las cantidades de todos los lotes
        const resultadoVerificacion = await this.verificarTodosLosLotes();
        console.log(`✅ Verificación de lotes: ${resultadoVerificacion.corregidos} de ${resultadoVerificacion.totalLotes} corregidos`);
        
        if (resultadoVerificacion.detalles.length > 0) {
            console.log('Detalles de correcciones:', resultadoVerificacion.detalles);
        }
        
        // Luego verificar stock bajo
        console.log('⏰ Verificando stock bajo...');
        await this.notificacionesService.notificarLotesStockBajo();
    }

    /**
     * Verifica y corrige la cantidad de unidades de TODOS los lotes
     * Solo cuenta las unidades con estado DISPONIBLE
     */
    private async verificarTodosLosLotes(): Promise<{ totalLotes: number; corregidos: number; detalles: any[] }> {
        const lotes = await this.loteRepository.find({ where: { estado: true } });
        const detalles: any[] = [];
        let corregidos = 0;
        
        for (const lote of lotes) {
            // Contar solo las unidades DISPONIBLES en la tabla de unidades
            const unidadesReales = await this.unidadesRepository.count({
                where: { fkLote: lote.idLote, estado: 'DISPONIBLE' }
            });
            
            const cantidadAnterior = lote.cantidadUnidades || 0;
            
            // Si hay discrepancia, corregir
            if (unidadesReales !== cantidadAnterior) {
                console.log(`⚠️ Corrección de cantidad para lote ${lote.codigoLote}: ${cantidadAnterior} -> ${unidadesReales}`);
                await this.loteRepository.update(lote.idLote, { cantidadUnidades: unidadesReales });
                corregidos++;
                detalles.push({
                    codigoLote: lote.codigoLote,
                    cantidadAnterior,
                    cantidadNueva: unidadesReales
                });
            }
        }
        
        return { totalLotes: lotes.length, corregidos, detalles };
    }
}
