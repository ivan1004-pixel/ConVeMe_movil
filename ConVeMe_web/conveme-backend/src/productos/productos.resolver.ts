import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductosService } from './productos.service';
import { Producto } from './producto.entity';
import { CreateProductoInput } from './dto/create-producto.input';
import { UpdateProductoInput } from './dto/update-producto.input';

@Resolver(() => Producto)
export class ProductosResolver {
    constructor(private readonly productosService: ProductosService) {}

    @Mutation(() => Producto)
    createProducto(@Args('createProductoInput') createProductoInput: CreateProductoInput) {
        return this.productosService.create(createProductoInput);
    }

    @Query(() => [Producto], { name: 'productos' })
    findAll() {
        return this.productosService.findAll();
    }

    @Query(() => Producto, { name: 'producto' })
    findOne(@Args('id_producto', { type: () => Int }) id_producto: number) {
        return this.productosService.findOne(id_producto);
    }

    @Mutation(() => Producto)
    updateProducto(@Args('updateProductoInput') updateProductoInput: UpdateProductoInput) {
        return this.productosService.update(updateProductoInput.id_producto, updateProductoInput);
    }

    // 👇 Cambiamos Boolean por Producto
    @Mutation(() => Producto)
    removeProducto(@Args('id_producto', { type: () => Int }) id_producto: number) {
        return this.productosService.remove(id_producto);
    }

    @Query(() => [Producto], { name: 'buscarProductos' })
    searchProductos(@Args('termino', { type: () => String, nullable: true }) termino?: string) {
        return this.productosService.searchProductos(termino || '');
    }
}
