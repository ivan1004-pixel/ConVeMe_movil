import { Query, Resolver, ObjectType, Field, Float, Int, Args } from '@nestjs/graphql';
import { PrediccionesService } from './predicciones.service';

// Tipos de salida para GraphQL
@ObjectType()
export class PrediccionVentasType {
    @Field() mes_predicho: string;
    @Field(() => Float) ventas_esperadas: number;
    @Field(() => Float) factor_alpha: number;
    @Field(() => Float) crecimiento_pct: number;
    @Field(() => Float) confianza_pct: number;
}

@ObjectType()
export class PrediccionDemandaProductoType {
    @Field() producto: string;
    @Field(() => Int) piezas_necesarias: number;
    @Field(() => Float) tendencia: number;
    @Field(() => Float) confianza_pct: number;
}

@Resolver()
export class PrediccionesResolver {
    constructor(private readonly service: PrediccionesService) {}

    @Query(() => PrediccionVentasType, { name: 'prediccionVentasProximoMes' })
    prediccionVentasProximoMes(
        @Args('mesesHistorico', { type: () => Int, defaultValue: 6 }) mesesHistorico: number,
                               @Args('factorS', { type: () => Float, defaultValue: 0.10 }) factorS: number,
    ) {
        return this.service.prediccionVentasProximoMes(mesesHistorico, factorS);
    }

    @Query(() => [PrediccionDemandaProductoType], { name: 'prediccionDemandaInventario' })
    prediccionDemandaInventario(
        @Args('factorS', { type: () => Float, defaultValue: 0.15 }) factorS: number,
    ) {
        return this.service.prediccionDemandaInventario(factorS);
    }
}
