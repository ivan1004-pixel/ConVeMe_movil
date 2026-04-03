import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventosService } from './eventos.service';
import { Evento } from './entities/evento.entity';
import { CreateEventoInput } from './dto/create-evento.input';
import { UpdateEventoInput } from './dto/update-evento.input';

@Resolver(() => Evento)
export class EventosResolver {
    constructor(private readonly eventosService: EventosService) {}

    @Mutation(() => Evento)
    createEvento(@Args('createEventoInput') createEventoInput: CreateEventoInput) {
        return this.eventosService.create(createEventoInput);
    }

    @Query(() => [Evento], { name: 'eventos' })
    findAll() {
        return this.eventosService.findAll();
    }

    @Query(() => Evento, { name: 'evento' })
    findOne(@Args('id_evento', { type: () => Int }) id_evento: number) {
        return this.eventosService.findOne(id_evento);
    }

    @Mutation(() => Evento)
    updateEvento(@Args('updateEventoInput') updateEventoInput: UpdateEventoInput) {
        return this.eventosService.update(updateEventoInput.id_evento, updateEventoInput);
    }

    // Cambiamos Boolean a Evento
    @Mutation(() => Evento)
    removeEvento(@Args('id_evento', { type: () => Int }) id_evento: number) {
        return this.eventosService.remove(id_evento);
    }
}
