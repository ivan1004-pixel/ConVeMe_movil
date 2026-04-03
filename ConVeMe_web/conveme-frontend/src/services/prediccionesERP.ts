// ============================================
// ARCHIVO: prediccionesERP.ts
// ============================================

/**
 * Predice las ventas (ingresos) para el próximo mes.
 * @param {Float} factorS - Factor de Laplace (ej. 0.10 -> α ≈ 0.90)
 */
export const PREDICCION_VENTAS = `
query PrediccionVentas($mesesHistorico: Int, $factorS: Float) {
    prediccionVentasProximoMes(mesesHistorico: $mesesHistorico, factorS: $factorS) {
        mes_predicho
        ventas_esperadas
        factor_alpha
        crecimiento_pct
        confianza_pct
    }
}
`;

/**
 * Predice qué productos serán los más vendidos para hacer inventario.
 */
export const PREDICCION_DEMANDA_PRODUCTOS = `
query PrediccionDemandaProductos($factorS: Float) {
    prediccionDemandaInventario(factorS: $factorS) {
        producto
        piezas_necesarias
        tendencia
        confianza_pct
    }
}
`;
