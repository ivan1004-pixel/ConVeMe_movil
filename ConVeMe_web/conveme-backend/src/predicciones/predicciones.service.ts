import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Importamos las entidades de tu ERP
import { CorteVendedor } from '../cortes-vendedor/entities/corte-vendedor.entity';
import { DetAsignacion } from '../asignaciones-vendedor/entities/det-asignacion.entity';

// ================================================================
//  TRANSFORMADA DE LAPLACE DISCRETA
// ================================================================
function laplace(serie: number[], s: number) {
    const alpha = Math.exp(-s);
    let F = 0, W = 0;
    serie.forEach((valor, k) => {
        const peso = Math.pow(alpha, k);
        F += valor * peso;
        W += peso;
    });
    const prediccion = W > 0 ? F / W : 0;

    const media = serie.reduce((acc, val) => acc + val, 0) / (serie.length || 1);
    const varianza = serie.reduce((acc, val) => acc + (val - media) ** 2, 0) / (serie.length || 1);
    const cv = media > 0 ? (Math.sqrt(varianza) / media) * 100 : 100;
    const confianza_pct = parseFloat(Math.max(0, Math.min(100, 100 - cv)).toFixed(1));

    return {
        prediccion: parseFloat(prediccion.toFixed(2)),
        alpha: parseFloat(alpha.toFixed(4)),
        confianza_pct
    };
}

// Función auxiliar para obtener el mes
const porMes = (campo: string) => `TO_CHAR(${campo}, 'YYYY-MM')`;

@Injectable()
export class PrediccionesService {
    constructor(
        @InjectRepository(CorteVendedor) private corteRepo: Repository<CorteVendedor>,
                // Pon el nombre correcto aquí adentro de los < > y los ( )
                @InjectRepository(DetAsignacion) private detAsignacionRepo: Repository<DetAsignacion>,
    ) {}

    // ==============================================================
    //  1. PREDICCIÓN DE VENTAS (INGRESOS)
    // ==============================================================
    async prediccionVentasProximoMes(mesesHistorico = 6, factorS = 0.10) {
        const mes = porMes('corte.fecha_corte');

        // Obtenemos el dinero histórico entregado agrupado por mes
        const rows = await this.corteRepo
        .createQueryBuilder('corte')
        .select(mes, 'mes')
        .addSelect('SUM(corte.dinero_total_entregado)', 'total_ventas')
        .groupBy(mes)
        .orderBy('mes', 'DESC')
        .limit(mesesHistorico)
        .getRawMany();

        if (!rows.length) {
            return {
                mes_predicho: 'Próximo Mes',
                ventas_esperadas: 0,
                factor_alpha: Math.exp(-factorS),
                crecimiento_pct: 0,
                confianza_pct: 0
            };
        }

        const serieVentas = rows.map(r => +r.total_ventas || 0);
        const { prediccion, alpha, confianza_pct } = laplace(serieVentas, factorS);

        const ventasActuales = serieVentas[0] || 0;
        const crecimiento = ventasActuales > 0 ? ((prediccion - ventasActuales) / ventasActuales) * 100 : 0;

        return {
            mes_predicho: `Próximo a: ${rows[0].mes}`,
            ventas_esperadas: prediccion,
            factor_alpha: alpha,
            crecimiento_pct: parseFloat(crecimiento.toFixed(1)),
            confianza_pct
        };
    }

    // ==============================================================
    //  2. PREDICCIÓN DE DEMANDA DE PRODUCTOS
    // ==============================================================
    async prediccionDemandaInventario(factorS = 0.15) {
        // Obtenemos la cantidad de productos vendidos agrupados por producto
        // Nota: Deberías usar det_corte_vendedor si guardas las ventas ahí,
        // pero aquí usamos det_asignacion como ejemplo de distribución.
        const rows = await this.detAsignacionRepo
        .createQueryBuilder('det')
        .innerJoin('det.producto', 'prod')
        .innerJoin('det.asignacion', 'asig')
        .select('prod.nombre', 'producto')
        .addSelect('SUM(det.cantidad_asignada)', 'cantidad')
        .addSelect(porMes('asig.fecha_asignacion'), 'mes')
        .groupBy('prod.nombre')
        .addGroupBy(porMes('asig.fecha_asignacion'))
        .orderBy('mes', 'DESC')
        .getRawMany();

        if (!rows.length) return [];

        // Agrupamos en memoria por producto
        const porProducto = new Map<string, typeof rows>();
        rows.forEach(r => {
            if (!porProducto.has(r.producto)) porProducto.set(r.producto, []);
            porProducto.get(r.producto)!.push(r);
        });

        const resultados: any[] = [];

        porProducto.forEach((meses, producto) => {
            const serie = meses.map(m => +m.cantidad || 0);
            const { prediccion, confianza_pct } = laplace(serie, factorS);

            resultados.push({
                producto,
                piezas_necesarias: Math.ceil(prediccion), // Redondeamos hacia arriba para no quedarnos sin stock
                            tendencia: serie.length > 1 ? parseFloat((serie[0] - serie[1]).toFixed(1)) : 0,
                            confianza_pct
            });
        });

        // Ordenamos para mostrar los más demandados primero
        return resultados.sort((a, b) => b.piezas_necesarias - a.piezas_necesarias);
    }
}
