/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  seed-generator-conveme.js  —  Sistema CONVEME (MariaDB)               ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Generador 100% basado en schema.gql  ·  100 000 registros/tabla       ║
 * ║                                                                        ║
 * ║  USO:                                                                  ║
 * ║    node seed-generator-conveme.js                                      ║
 * ║    mysql -u root -p conveme_bd < seed_conveme.sql                      ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  ESTRATEGIA ANTI-DUPLICADOS (FK UNIQUE)                                ║
 * ║  ─────────────────────────────────────                                 ║
 * ║  • usuarios     OneToOne con empleados / vendedores / clientes:        ║
 * ║       ids   1 –  10        → Admin (10 admins)                        ║
 * ║       ids  11 –  20 000    → Empleado (19 990 empleados)              ║
 * ║       ids  20 001 – 50 000 → Vendedor (30 000 vendedores)             ║
 * ║       ids  50 001 – 100 000→ Cliente  (50 000 clientes)               ║
 * ║  • inventario_productos.producto_id  UNIQUE → inventario_i = producto_i║
 * ║  • saldos_vendedores.vendedor_id     UNIQUE → saldo_i = vendedor_i     ║
 * ║  • cortes_vendedor.asignacion_id     UNIQUE → corte_i = asignacion_i   ║
 * ║                                                                        ║
 * ║  ORDEN DE INSERCIÓN (padres antes que hijos)                           ║
 * ║  ─────────────────────────────────────────                            ║
 * ║   1. roles              9. empleados        17. ordenes_produccion     ║
 * ║   2. paises            10. escuelas         18. det_ordenes_produccion ║
 * ║   3. estados           11. vendedores       19. asignaciones_vendedor  ║
 * ║   4. municipios        12. clientes         20. det_asignaciones       ║
 * ║   5. categorias        13. insumos          21. pedidos                ║
 * ║   6. tamaños           14. compras_insumos  22. det_pedidos            ║
 * ║   7. categorias_gasto  15. det_compras_ins  23. ventas                 ║
 * ║   8. usuarios          16. productos        24. det_ventas             ║
 * ║                            inventario       25. cortes_vendedor        ║
 * ║                            mov_inventario   26. det_cortes_inv         ║
 * ║                                             27. cuentas_bancarias      ║
 * ║                                             28. saldos_vendedores      ║
 * ║                                             29. pagos_vendedores       ║
 * ║                                             30. eventos                ║
 * ║                                             31. promociones            ║
 * ║                                             32. categorias_gasto       ║
 * ║                                             33. gastos_operativos      ║
 * ║                                             34. bitacora_auditoria     ║
 * ║                                             35. comprobantes           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Configuración ─────────────────────────────────────────────────────────────
const TARGET = 100;
const BATCH  = 100;
const OUTPUT = path.join(__dirname, 'seed_conveme.sql');

// Distribución de usuarios (OneToOne con empleados / vendedores / clientes)
const N_ADMINS     = 10;
const N_EMPLEADOS  = Math.floor(TARGET * 0.20);              // 20 000 (incluye los 10 admins)
const N_VENDEDORES = Math.floor(TARGET * 0.30);              // 30 000
const N_CLIENTES   = TARGET - N_EMPLEADOS - N_VENDEDORES;    // 50 000

// ── LCG pseudo-random (sin dependencias npm) ──────────────────────────────────
let _seed = 42_069;
function rand()             { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return (_seed >>> 0) / 0xffffffff; }
function randInt(min, max)  { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr)          { return arr[Math.floor(rand() * arr.length)]; }
function maybe(prob = 0.5)  { return rand() < prob; }

function fmtDate(d) { return d.toISOString().slice(0, 10); }
function esc(v)    { return String(v).replace(/'/g, "''"); }
function bool(v)   { return v ? 'TRUE' : 'FALSE'; }
function fmtDT(d)  { return d.toISOString().slice(0, 19).replace('T', ' '); }
function randDate(y1, y2) {
    const a = new Date(y1, 0, 1).getTime();
    const b = new Date(y2, 11, 31).getTime();
    return new Date(a + rand() * (b - a));
}
function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}
// Teléfonos únicos garantizados: tel_unico(usuario_id) → nunca repite
const tel_unico = (id) => `55${String(id).padStart(8, '0')}`;
// CLABE de 18 dígitos sin repetir
const clabe18 = (id) => String(id).padStart(18, '0').slice(0, 18);

// ── Escritura en lotes ────────────────────────────────────────────────────────
function insertBatch(stream, table, cols, rows) {
    if (!rows.length) return;
    const colStr = cols.map(c => `\`${c}\``).join(', ');
    for (let i = 0; i < rows.length; i += BATCH) {
        const chunk = rows.slice(i, i + BATCH);
        const vals  = chunk.map(r => `(${r})`).join(',\n  ');
        stream.write(`INSERT IGNORE INTO \`${table}\` (${colStr}) VALUES\n  ${vals};\n`);
    }
}

// ── Catálogos ─────────────────────────────────────────────────────────────────
const MUNICIPIOS_EDOMEX = [
    'Acambay de Ruíz Castañeda','Acolman','Aculco','Almoloya de Alquisiras',
'Almoloya de Juárez','Almoloya del Río','Amanalco','Amatepec','Amecameca',
'Apaxco','Atenco','Atizapán','Atizapán de Zaragoza','Atlacomulco','Atlautla',
'Axapusco','Ayapango','Calimaya','Capulhuac','Coacalco de Berriozábal',
'Coatepec Harinas','Cocotitlán','Coyotepec','Cuautitlán','Cuautitlán Izcalli',
'Chalco','Chapa de Mota','Chapultepec','Chiautla','Chicoloapan','Chiconcuac',
'Chimalhuacán','Donato Guerra','Ecatepec de Morelos','Ecatzingo','El Oro',
'Huehuetoca','Hueypoxtla','Huixquilucan','Ixtapaluca','Ixtapan de la Sal',
'Ixtlahuaca','Jilotepec','Jiquipilco','Jocotitlán','Juchitepec','La Paz',
'Lerma','Luvianos','Malinalco','Melchor Ocampo','Metepec','Mexicaltzingo',
'Morelos','Naucalpan de Juárez','Nezahualcóyotl','Nicolás Romero',
'Ocoyoacac','Ocuilan','Otzolotepec','Ozumba','Papalotla','Polotitlán',
'Rayón','San Antonio la Isla','San Felipe del Progreso','San José del Rincón',
'San Mateo Atenco','Santo Tomás','Sultepec','Tecámac','Tejupilco',
'Temamatla','Temascalapa','Temascalcingo','Temascaltepec','Temoaya',
'Tenancingo','Tenango del Valle','Teoloyucan','Teotihuacán','Tepetlaoxtoc',
'Tepotzotlán','Texcoco','Tianguistenco','Tlalmanalco','Tlalnepantla de Baz',
'Toluca','Tultepec','Tultitlán','Valle de Bravo','Valle de Chalco Solidaridad',
'Villa de Allende','Villa del Carbón','Villa Guerrero','Villa Victoria',
'Xalatlaco','Xonacatlán','Zinacantepec','Zumpango'
];

const NOMBRES   = ['Guadalupe','María','José','Juan','Carlos','Ana','Luis','Rosa','Pedro','Laura',
'Jorge','Elena','Andrés','Sofía','Miguel','Valentina','Diego','Camila',
'Ricardo','Gabriela','Fernando','Patricia','Roberto','Alejandra','Manuel',
'Daniela','Sergio','Natalia','Ángel','Verónica','Raúl','Claudia',
'Arturo','Mariana','Héctor','Adriana','Iván','Paulina','Omar','Brenda'];
const APELLIDOS = ['García','Hernández','López','Martínez','González','Rodríguez','Pérez',
'Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz',
'Morales','Reyes','Jiménez','Ruiz','Vargas','Mendoza','Castillo',
'Romero','Guerrero','Gutiérrez','Ortega','Delgado','Vega','Ramos','Medina'];
const COLONIAS  = ['Centro','Santa Fe','Lomas Verdes','Valle Dorado','San Lorenzo',
'La Merced','Jardines del Valle','Industrial','Los Álamos','Bosques de Ixtapan',
'Cd. Satélite','Del Parque','San Cristóbal','La Florida','Cumbres'];
const BANCOS    = ['BBVA','Citibanamex','Santander','HSBC','Banorte',
'Scotiabank','Inbursa','Banco Azteca','BanBajío','Bansí'];
const PUESTOS   = ['Gerente General','Coordinador de Producción','Diseñador Gráfico',
'Asistente Administrativo','Contador','Encargado de Logística',
'Community Manager','Jefe de Ventas','Encargado de Almacén','Supervisor'];
const FACULTADES= ['Facultad de Ingeniería','Facultad de Medicina','Facultad de Derecho',
'Facultad de Economía','Facultad de Humanidades','Facultad de Arquitectura',
'Centro Universitario UAEM','Campus Toluca','Campus Texcoco',
'Campus Ecatepec','Campus Zumpango','Campus Amecameca'];
const NOMBRES_ESC= ['UAEM','UAM','IPN','TecNM','UNAM','UVM','Anáhuac',
'Iberoamericana','La Salle','UNITEC','UPVM','UTEG','CET'];
const CAMPUS_ESC = ['Campus Norte','Campus Sur','Campus Centro','Campus Oriente',
'Campus Poniente','Plantel A','Plantel B','Unidad 1','Unidad 2'];
const PUNTO_ENT  = ['Entrada Facultad','Cafetería Central','Biblioteca','Estacionamiento A',
'Puerta Principal','Sala de Juntas','Explanada','Coordinación'];
const TEMAS_PROD = ['Ajolote','Gato Espacial','Dinosaurio','Calavera Kawaii','Hongo Mágico',
'Pulpo Cósmico','Zorro Ninja','Conejo Astronauta','Dragón Pastel',
'Luna Brillante','Sol Retro','Mariposa Neon','Delfín Holográfico',
'Rana Samuray','Búho Steampunk','Lobo Glacial','Panda Mecha',
'Koi Fantasma','Axolotl Rosa','Cactus Simpático'];
const ESTILOS_PROD = ['Clásico','Edición Especial','Kawaii','Retro','Neon','Pastel','Dark','Glitter'];
const PROVEEDORES  = ['Materiales México SA','Distribuidora GX','Insumos del Valle',
'ImportaFácil','ProArtesanía','SupplyPlus','Todo en Metal',
'Sticker World','Mex Insumos','Arte y Color'];
const TIPOS_INSUMO = ['Bases Metálicas','Papel Adhesivo Holográfico','Resina Epóxica',
'Tinta UV','Lámina de Acrílico','Tela para Parches','Hilo Bordado',
'Botones de Metal','Pintura Esmalte','Barniz Protector',
'Film Holográfico','Vinilo de Corte','Papel Kraft','Bolsa Burbuja',
'Caja Cartón Microcorrugado','Pegamento Industrial','Acetato Transparente'];
const UNIDADES_INS = ['kg','g','lt','ml','pzas','metros','rollos','láminas'];
const NOMBRES_EV   = ['Feria del Arte Universitario','Expo Creativa','Festival Geek',
'Mercado Artesanal','Feria de Diseño','Pop-Up Market',
'Exposición Cultural','Comic Con EdoMex','Bazar Estudiantil',
'Feria de Emprendedores','ExpoArte','Mercado Freak'];
const NOMBRES_PROMO= ['Descuento Estudiantil','Buen Fin','Día del Amor','Regreso a Clases',
'Promo Fin de Semana','Liquidación Temporada','Pack Especial','2x1 Limitado',
'Fidelidad CONVEME','Flash Sale','Bazar Universitario','Martes de Oferta'];
const ACCIONES_AUD = ['INSERT','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT'];
const TABLAS_AUD   = ['ventas','productos','vendedores','clientes','pedidos',
'inventario_productos','saldos_vendedores','comprobantes',
'asignaciones_vendedor','cortes_vendedor'];
const ESTADO_PEDIDO= ['Pendiente','En proceso','Enviado','Entregado','Cancelado'];
const ESTADO_VENTA = ['Pendiente','Completada','Cancelada'];
const ESTADO_ORDEN = ['Pendiente','En producción','Completada','Cancelada'];
const ESTADO_ASIG  = ['Activa','Cerrada','Cancelada'];
const ESTADO_LAB   = ['Activo','Inactivo','En prueba','Suspendido'];
const METODO_PAGO  = ['Efectivo','Transferencia','Tarjeta'];
const TIPO_MOV     = ['ENTRADA','SALIDA','AJUSTE'];
const TIPO_PROMO   = ['PORCENTAJE','MONTO_FIJO'];
const CAT_GASTO_NOM= ['Materias primas','Transporte','Empaques','Renta local',
'Servicios básicos','Marketing y publicidad','Eventos y stands',
'Nómina','Equipo y herramientas','Gastos varios'];
const DETALLES_GASTO = ['Material de empaque holográfico','Renta de stand en evento',
'Transporte a facultad','Compra de bases metálicas','Impresión de etiquetas',
'Pago de publicidad en redes','Mantenimiento de equipo','Material de oficina',
'Servicio de mensajería','Gastos de logística'];
const MOTIVOS_MOV  = ['Producción completada','Venta realizada','Ajuste de inventario',
'Devolución de cliente','Inventario físico','Merma','Donación'];

// Helpers con catálogos
const nombre   = () => esc(pick(NOMBRES));
const apellido = () => esc(pick(APELLIDOS));

// ═════════════════════════════════════════════════════════════════════════════
// INICIO
// ═════════════════════════════════════════════════════════════════════════════
console.log(`\n🚀  Generando seed CONVEME (MariaDB)...`);
console.log(`    TARGET    : ${TARGET.toLocaleString()} registros/tabla`);
console.log(`    Admins    : ${N_ADMINS}`);
console.log(`    Empleados : ${N_EMPLEADOS.toLocaleString()} (incluye ${N_ADMINS} admins)`);
console.log(`    Vendedores: ${N_VENDEDORES.toLocaleString()}`);
console.log(`    Clientes  : ${N_CLIENTES.toLocaleString()}`);
console.log(`    Salida    : ${OUTPUT}\n`);

const stream = fs.createWriteStream(OUTPUT, { encoding: 'utf8' });

stream.write(`-- ================================================================\n`);
stream.write(`-- SEED — Sistema CONVEME (MariaDB / conveme_bd)\n`);
stream.write(`-- Generado: ${new Date().toISOString()}\n`);
stream.write(`-- Schema: schema.gql\n`);
stream.write(`-- Registros por tabla principal: ${TARGET.toLocaleString()}\n`);
stream.write(`-- Distribución usuarios:\n`);
stream.write(`--   ${N_ADMINS} admins | ${(N_EMPLEADOS - N_ADMINS).toLocaleString()} empleados | `);
stream.write(`${N_VENDEDORES.toLocaleString()} vendedores | ${N_CLIENTES.toLocaleString()} clientes\n`);
stream.write(`-- Importar: mysql -u root -p conveme_bd < seed_conveme.sql\n`);
stream.write(`-- ================================================================\n\n`);
stream.write(`USE \`conveme_bd\`;\n\n`);
stream.write(`SET FOREIGN_KEY_CHECKS = 0;\nSET autocommit = 0;\n\n`);


// ── 1. ROLES ─────────────────────────────────────────────────────────────────
// Schema: Rol { id_rol, nombre, descripcion }
console.log('[01] roles...');
stream.write(`-- 1. ROLES\n`);
stream.write(`INSERT IGNORE INTO \`roles\` (\`id_rol\`,\`nombre\`,\`descripcion\`) VALUES\n`);
stream.write(`  (1,'Admin','Administrador del sistema con acceso total'),\n`);
stream.write(`  (2,'Empleado','Personal interno de producción y administración'),\n`);
stream.write(`  (3,'Vendedor','Vendedor en campo o facultad'),\n`);
stream.write(`  (4,'Cliente','Comprador final de pines y stickers');\n\n`);


// ── 2. PAISES ────────────────────────────────────────────────────────────────
// Schema: Pais { id_pais, nombre }
console.log('[02] paises...');
stream.write(`-- 2. PAISES\n`);
stream.write(`INSERT IGNORE INTO \`paises\` (\`id_pais\`,\`nombre\`) VALUES (1,'México');\n\n`);


// ── 3. ESTADOS ───────────────────────────────────────────────────────────────
// Schema: Estado { id_estado, pais_id, nombre, pais }
console.log('[03] estados...');
stream.write(`-- 3. ESTADOS\n`);
stream.write(`INSERT IGNORE INTO \`estados\` (\`id_estado\`,\`pais_id\`,\`nombre\`) VALUES (1,1,'Estado de México');\n\n`);


// ── 4. MUNICIPIOS ─────────────────────────────────────────────────────────────
// Schema: Municipio { id_municipio, estado_id, nombre, estado }
console.log('[04] municipios...');
stream.write(`-- 4. MUNICIPIOS (${MUNICIPIOS_EDOMEX.length} municipios reales del Estado de México)\n`);
const municipioIds = [];
{
    const rows = [];
    MUNICIPIOS_EDOMEX.forEach((m, i) => {
        const id = i + 1;
        rows.push(`${id},1,'${esc(m)}'`);
        municipioIds.push(id);
    });
    insertBatch(stream, 'municipios', ['id_municipio','estado_id','nombre'], rows);
    stream.write('\n');
}
console.log(`    ${municipioIds.length} municipios`);


// ── 5. CATEGORIAS ─────────────────────────────────────────────────────────────
// Schema: Categoria { id_categoria, nombre, activo }
console.log('[05] categorias...');
stream.write(`-- 5. CATEGORIAS\n`);
stream.write(`INSERT IGNORE INTO \`categorias\` (\`id_categoria\`,\`nombre\`,\`activo\`) VALUES\n`);
stream.write(`  (1,'Pines Esmaltados',TRUE),(2,'Stickers Holográficos',TRUE),(3,'Llaveros Acrílicos',TRUE),\n`);
stream.write(`  (4,'Parches Bordados',TRUE),(5,'Botones',TRUE),(6,'Imanes Decorativos',TRUE),\n`);
stream.write(`  (7,'Pines de Seguridad',TRUE),(8,'Stickers Mate',TRUE),(9,'Coleccionables',TRUE),\n`);
stream.write(`  (10,'Edición Limitada',TRUE);\n\n`);
const categoriaIds = [1,2,3,4,5,6,7,8,9,10];


// ── 6. TAMAÑOS ────────────────────────────────────────────────────────────────
// Schema: Tamano { id_tamano, descripcion, activo }
console.log('[06] tamaños...');
stream.write(`-- 6. TAMAÑOS\n`);
stream.write(`INSERT IGNORE INTO \`tamaños\` (\`id_tamaño\`,\`descripcion\`,\`activo\`) VALUES\n`);
stream.write(`  (1,'Mini (1.5cm)',TRUE),(2,'Chico (3cm)',TRUE),(3,'Mediano (4cm)',TRUE),\n`);
stream.write(`  (4,'Grande (5cm)',TRUE),(5,'Jumbo (7cm)',TRUE),(6,'XL (10cm)',TRUE);\n\n`);
const tamanoIds = [1,2,3,4,5,6];


// ── 7. CATEGORIAS_GASTO ───────────────────────────────────────────────────────
// Schema: CategoriaGasto { id_categoria, nombre, descripcion, activa }
console.log('[07] categorias_gasto...');
stream.write(`-- 7. CATEGORIAS_GASTO\n`);
stream.write(`INSERT IGNORE INTO \`categorias_gasto\` (\`id_categoria\`,\`nombre\`,\`descripcion\`,\`activa\`) VALUES\n`);
stream.write(`  (1,'Materias primas','Compra de insumos y materiales base',TRUE),\n`);
stream.write(`  (2,'Transporte','Gastos de envío y movilización de mercancía',TRUE),\n`);
stream.write(`  (3,'Empaques','Bolsas, cajas y material de presentación',TRUE),\n`);
stream.write(`  (4,'Renta local','Pago de espacios físicos o bodegas',TRUE),\n`);
stream.write(`  (5,'Servicios básicos','Luz, agua, internet',TRUE),\n`);
stream.write(`  (6,'Marketing y publicidad','Redes sociales, impresión, fotografía',TRUE),\n`);
stream.write(`  (7,'Eventos y stands','Renta de espacios en ferias y bazares',TRUE),\n`);
stream.write(`  (8,'Nómina','Pagos de sueldos internos',TRUE),\n`);
stream.write(`  (9,'Equipo y herramientas','Compra o mantenimiento de maquinaria',TRUE),\n`);
stream.write(`  (10,'Gastos varios','Otros gastos operativos no clasificados',TRUE);\n\n`);
const categoriaGastoIds = [1,2,3,4,5,6,7,8,9,10];


// ── 8. USUARIOS ───────────────────────────────────────────────────────────────
// Schema: Usuario { id_usuario, username, rol_id, activo, ultimo_acceso, created_at }
// Nota: password_hash no está en el tipo graphql pero sí en la BD (campo oculto)
// Rangos:
//   1  –  10       → rol 1 (Admin) — siempre activos
//   11 – 20 000    → rol 2 (Empleado)
//   20 001 – 50 000→ rol 3 (Vendedor)
//   50 001 –100 000→ rol 4 (Cliente)
console.log('[08] usuarios...');
stream.write(`-- 8. USUARIOS (${TARGET.toLocaleString()})\n`);
const usuarioIds = [];
const adminIds   = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        let rolId;
        if      (i <= N_ADMINS)                                rolId = 1;
        else if (i <= N_EMPLEADOS)                             rolId = 2;
        else if (i <= N_EMPLEADOS + N_VENDEDORES)              rolId = 3;
        else                                                   rolId = 4;

        const esActivo = (rolId === 1) ? 'TRUE' : bool(rand() > 0.05);
        const ultimoAcceso = fmtDT(randDate(2023, 2025));
        const createdAt    = fmtDT(randDate(2020, 2023));

        rows.push(
            `${i},'user${String(i).padStart(7,'0')}',` +
            `'$2b$10$jG7tnzn7AKzyCjRrrf9wIurWuRgJWhapsjxQb6BCKYgroEch/aT0q',` +
            `${rolId},${esActivo},'${ultimoAcceso}','${createdAt}'`
        );
        usuarioIds.push(i);
        if (rolId === 1) adminIds.push(i);
    }
    insertBatch(stream, 'usuarios',
                ['id_usuario','username','password_hash','rol_id','activo','ultimo_acceso','created_at'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} usuarios (${N_ADMINS} admins)`);


// ── 9. EMPLEADOS ──────────────────────────────────────────────────────────────
// Schema: Empleado { id_empleado, usuario_id, nombre_completo, email, telefono,
//                    puesto, calle_y_numero, colonia, codigo_postal, municipio_id, activo }
// usuario_id UNIQUE → empleado_i = usuario_i (1:1, ids 1–20 000)
console.log('[09] empleados...');
stream.write(`-- 9. EMPLEADOS (${N_EMPLEADOS.toLocaleString()}, usuario_id 1–${N_EMPLEADOS})\n`);
const empleadoIds = [];
{
    const rows = [];
    for (let i = 1; i <= N_EMPLEADOS; i++) {
        const mun = pick(municipioIds);
        const cp  = `${50000 + randInt(0, 999)}`;
        const esActivo = (i <= N_ADMINS) ? 'TRUE' : bool(rand() > 0.05);
        rows.push(
            `${i},${i},'${nombre()} ${apellido()} ${apellido()}',` +
            `'emp${i}@conveme.mx','${tel_unico(i)}',` +
            `'${esc(pick(PUESTOS))}','Calle ${randInt(1,999)} #${randInt(1,99)}',` +
            `'${pick(COLONIAS)}','${cp}',${mun},${esActivo}`
        );
        empleadoIds.push(i);
    }
    insertBatch(stream, 'empleados',
                ['id_empleado','usuario_id','nombre_completo','email','telefono',
                'puesto','calle_y_numero','colonia','codigo_postal','municipio_id','activo'], rows);
    stream.write('\n');
}
console.log(`    ${N_EMPLEADOS.toLocaleString()} empleados`);


// ── 10. ESCUELAS ──────────────────────────────────────────────────────────────
// Schema: Escuela { id_escuela, nombre, siglas, municipio_id, activa }
console.log('[10] escuelas...');
stream.write(`-- 10. ESCUELAS (200)\n`);
const escuelaIds = [];
{
    const rows = [];
    for (let i = 1; i <= 200; i++) {
        const mun = pick(municipioIds);
        const nm  = esc(`${pick(NOMBRES_ESC)} ${pick(CAMPUS_ESC)} ${i}`);
        const sig = pick(NOMBRES_ESC).replace(/[^A-Z]/g, '').slice(0, 6) || 'ESC';
        rows.push(`${i},'${nm}','${sig}',${mun},${bool(rand() > 0.05)}`);
        escuelaIds.push(i);
    }
    insertBatch(stream, 'escuelas',
                ['id_escuela','nombre','siglas','municipio_id','activa'], rows);
    stream.write('\n');
}
console.log(`    200 escuelas`);


// ── 11. VENDEDORES ────────────────────────────────────────────────────────────
// Schema: Vendedor { id_vendedor, usuario_id, escuela_id, nombre_completo, email,
//                    telefono, instagram_handle, calle_y_numero, colonia,
//                    codigo_postal, municipio_id, facultad_o_campus,
//                    punto_entrega_habitual, estado_laboral,
//                    comision_fija_menudeo, comision_fija_mayoreo, meta_ventas_mensual }
// usuario_id UNIQUE → vendedor_i = usuario_(N_EMPLEADOS + i)
console.log('[11] vendedores...');
stream.write(`-- 11. VENDEDORES (${N_VENDEDORES.toLocaleString()}, usuario_id ${N_EMPLEADOS+1}–${N_EMPLEADOS+N_VENDEDORES})\n`);
const vendedorIds = [];
{
    const rows = [];
    for (let i = 1; i <= N_VENDEDORES; i++) {
        const usuId  = N_EMPLEADOS + i;
        const mun    = pick(municipioIds);
        const escId  = pick(escuelaIds);
        const cp     = `${50000 + randInt(0, 999)}`;
        // Comisiones reales del negocio: menudeo ~6-10, mayoreo ~2-5
        const comMen = (6  + rand() * 4).toFixed(2);
        const comMay = (2  + rand() * 3).toFixed(2);
        const meta   = (2000 + rand() * 8000).toFixed(2);
        rows.push(
            `${i},${usuId},${escId},` +
            `'${nombre()} ${apellido()} ${apellido()}',` +
            `'vend${i}@conveme.mx','${tel_unico(usuId)}',` +
            `'@conveme_${i}',` +
            `'Calle ${randInt(1,999)} #${randInt(1,99)}','${pick(COLONIAS)}','${cp}',${mun},` +
            `'${esc(pick(FACULTADES))}','${esc(pick(PUNTO_ENT))}','${pick(ESTADO_LAB)}',` +
            `${comMen},${comMay},${meta}`
        );
        vendedorIds.push(i);
    }
    insertBatch(stream, 'vendedores',
                ['id_vendedor','usuario_id','escuela_id','nombre_completo','email','telefono',
                'instagram_handle','calle_y_numero','colonia','codigo_postal','municipio_id',
                'facultad_o_campus','punto_entrega_habitual','estado_laboral',
                'comision_fija_menudeo','comision_fija_mayoreo','meta_ventas_mensual'], rows);
    stream.write('\n');
}
console.log(`    ${N_VENDEDORES.toLocaleString()} vendedores`);


// ── 12. CLIENTES ──────────────────────────────────────────────────────────────
// Schema: Cliente { id_cliente, usuario_id, nombre_completo, email, telefono,
//                   direccion_envio, fecha_registro }
// usuario_id UNIQUE (nullable) → cliente_i = usuario_(N_EMPLEADOS + N_VENDEDORES + i)
console.log('[12] clientes...');
stream.write(`-- 12. CLIENTES (${N_CLIENTES.toLocaleString()}, usuario_id ${N_EMPLEADOS+N_VENDEDORES+1}–${TARGET})\n`);
const clienteIds = [];
{
    const rows = [];
    for (let i = 1; i <= N_CLIENTES; i++) {
        const usuId = N_EMPLEADOS + N_VENDEDORES + i;
        const mun   = esc(pick(MUNICIPIOS_EDOMEX));
        const dir   = esc(`Calle ${randInt(1,999)} #${randInt(1,99)}, Col. ${pick(COLONIAS)}, ${mun}, Edo. Méx.`);
        const fecha = fmtDT(randDate(2020, 2025));
        rows.push(
            `${i},${usuId},'${nombre()} ${apellido()} ${apellido()}',` +
            `'cli${i}@gmail.com','${tel_unico(usuId)}','${dir}','${fecha}'`
        );
        clienteIds.push(i);
    }
    insertBatch(stream, 'clientes',
                ['id_cliente','usuario_id','nombre_completo','email','telefono',
                'direccion_envio','fecha_registro'], rows);
    stream.write('\n');
}
console.log(`    ${N_CLIENTES.toLocaleString()} clientes`);


// ── 13. INSUMOS ───────────────────────────────────────────────────────────────
// Schema: Insumo { id_insumo, nombre, unidad_medida, stock_actual, stock_minimo_alerta }
console.log('[13] insumos...');
stream.write(`-- 13. INSUMOS_MATERIA_PRIMA (${TARGET.toLocaleString()})\n`);
const insumoIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const nm    = esc(`${pick(TIPOS_INSUMO)} Lote-${String(i).padStart(6, '0')}`);
        const stock = (rand() * 1000).toFixed(4);
        const min   = (5 + rand() * 50).toFixed(4);
        rows.push(`${i},'${nm}','${pick(UNIDADES_INS)}',${stock},${min}`);
        insumoIds.push(i);
    }
    insertBatch(stream, 'insumos_materia_prima',
                ['id_insumo','nombre','unidad_medida','stock_actual','stock_minimo_alerta'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} insumos`);


// ── 14. COMPRAS_INSUMOS ───────────────────────────────────────────────────────
// Schema: CompraInsumo { id_compra_insumo, fecha_compra, proveedor, monto_total,
//                        empleado_id, comprobante_url, detalles }
console.log('[14] compras_insumos...');
stream.write(`-- 14. COMPRAS_INSUMOS (${TARGET.toLocaleString()})\n`);
const compraInsumoIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const empId = pick(empleadoIds);
        const fecha = fmtDT(randDate(2020, 2025));
        const monto = (500 + rand() * 9500).toFixed(2);
        rows.push(
            `${i},'${fecha}','${esc(pick(PROVEEDORES))}',${monto},${empId},` +
            `'https://docs.conveme.mx/compras/${i}.pdf'`
        );
        compraInsumoIds.push(i);
    }
    insertBatch(stream, 'compras_insumos',
                ['id_compra_insumo','fecha_compra','proveedor','monto_total',
                'empleado_id','comprobante_url'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} compras de insumos`);


// ── 15. DET_COMPRAS_INSUMOS ───────────────────────────────────────────────────
// Schema: DetCompraInsumo { id_det_compra, compra_insumo_id, insumo_id,
//                           cantidad_comprada, costo_unitario }
console.log('[15] det_compras_insumos...');
stream.write(`-- 15. DET_COMPRAS_INSUMOS (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const cId   = pick(compraInsumoIds);
        const insId = pick(insumoIds);
        const cant  = (1 + rand() * 100).toFixed(4);
        const costo = (5 + rand() * 200).toFixed(2);
        rows.push(`${i},${cId},${insId},${cant},${costo}`);
    }
    insertBatch(stream, 'det_compras_insumos',
                ['id_det_compra','compra_insumo_id','insumo_id','cantidad_comprada','costo_unitario'], rows);
    stream.write('\n');
}


// ── 16. PRODUCTOS ─────────────────────────────────────────────────────────────
// Schema: Producto { id_producto, sku, nombre, categoria_id, tamano_id,
//                    precio_unitario, precio_mayoreo, cantidad_minima_mayoreo,
//                    costo_produccion, activo }
console.log('[16] productos...');
stream.write(`-- 16. PRODUCTOS (${TARGET.toLocaleString()})\n`);
const productoIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const catId    = pick(categoriaIds);
        const tamId    = pick(tamanoIds);
        // Precio según categoría (pines más caros, stickers más baratos)
        const basePrice = (catId === 1 || catId === 7) ? 30 + rand() * 40   // Pines
        : (catId === 2 || catId === 8) ? 10 + rand() * 15   // Stickers
        : 20 + rand() * 60;                                  // Resto
        const precio    = basePrice.toFixed(2);
        const precioMay = (basePrice * 0.75).toFixed(2);
        const costo     = (basePrice * (0.25 + rand() * 0.15)).toFixed(2);
        const minMay    = randInt(6, 24);
        const nm        = esc(`${pick(TEMAS_PROD)} ${pick(ESTILOS_PROD)} ${i}`);
        rows.push(
            `${i},'SKU-${String(i).padStart(7,'0')}','${nm}',` +
            `${catId},${tamId},${precio},${precioMay},${minMay},${costo},${bool(rand() > 0.08)}`
        );
        productoIds.push(i);
    }
    insertBatch(stream, 'productos',
                ['id_producto','sku','nombre','categoria_id','tamaño_id',
                'precio_unitario','precio_mayoreo','cantidad_minima_mayoreo',
                'costo_produccion','activo'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} productos`);


// ── 17. INVENTARIO_PRODUCTOS ──────────────────────────────────────────────────
// Schema: InventarioProducto { id_inventario, producto_id, stock_actual, stock_minimo_alerta }
// IMPORTANTE: producto_id es UNIQUE → inventario_i = producto_i (1:1 directo)
console.log('[17] inventario_productos...');
stream.write(`-- 17. INVENTARIO_PRODUCTOS (producto_id UNIQUE → 1 fila por producto)\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        rows.push(`${i},${i},${randInt(0, 500)},${randInt(5, 25)}`);
    }
    insertBatch(stream, 'inventario_productos',
                ['id_inventario','producto_id','stock_actual','stock_minimo_alerta'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} registros de inventario`);


// ── 18. MOVIMIENTOS_INVENTARIO ────────────────────────────────────────────────
// Schema: MovimientoInventario { id_movimiento, producto_id, tipo_movimiento,
//                                cantidad, motivo, fecha_movimiento, empleado_id }
console.log('[18] movimientos_inventario...');
stream.write(`-- 18. MOVIMIENTOS_INVENTARIO (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const pId   = pick(productoIds);
        const empId = maybe(0.8) ? pick(empleadoIds) : 'NULL';
        const fecha = fmtDT(randDate(2020, 2025));
        rows.push(
            `${i},${pId},'${pick(TIPO_MOV)}',${randInt(1, 100)},` +
            `'${esc(pick(MOTIVOS_MOV))}','${fecha}',${empId}`
        );
    }
    insertBatch(stream, 'movimientos_inventario',
                ['id_movimiento','producto_id','tipo_movimiento','cantidad',
                'motivo','fecha_movimiento','empleado_id'], rows);
    stream.write('\n');
}


// ── 19. ORDENES_PRODUCCION ────────────────────────────────────────────────────
// Schema: OrdenProduccion { id_orden_produccion, producto_id, empleado_id,
//                           cantidad_a_producir, fecha_orden, estado, detalles }
console.log('[19] ordenes_produccion...');
stream.write(`-- 19. ORDENES_PRODUCCION (${TARGET.toLocaleString()})\n`);
const ordenIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const pId   = pick(productoIds);
        const empId = pick(empleadoIds);
        const fecha = fmtDT(randDate(2020, 2025));
        const cant  = randInt(10, 500);
        rows.push(`${i},${pId},${empId},${cant},'${fecha}','${pick(ESTADO_ORDEN)}'`);
        ordenIds.push(i);
    }
    insertBatch(stream, 'ordenes_produccion',
                ['id_orden_produccion','producto_id','empleado_id',
                'cantidad_a_producir','fecha_orden','estado'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} órdenes de producción`);


// ── 20. DET_ORDENES_PRODUCCION ────────────────────────────────────────────────
// Schema: DetOrdenProduccion { id_det_orden, orden_produccion_id, insumo_id,
//                              cantidad_consumida }
console.log('[20] det_ordenes_produccion...');
stream.write(`-- 20. DET_ORDENES_PRODUCCION (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const ordId = pick(ordenIds);
        const insId = pick(insumoIds);
        const cant  = (0.5 + rand() * 50).toFixed(4);
        rows.push(`${i},${ordId},${insId},${cant}`);
    }
    insertBatch(stream, 'det_ordenes_produccion',
                ['id_det_orden','orden_produccion_id','insumo_id','cantidad_consumida'], rows);
    stream.write('\n');
}


// ── 21. ASIGNACIONES_VENDEDOR ─────────────────────────────────────────────────
// Schema: AsignacionVendedor { id_asignacion, vendedor_id, fecha_asignacion,
//                              estado, detalles }
// Nota: el schema no muestra empleado_id en el tipo, pero la mutation sí lo acepta
console.log('[21] asignaciones_vendedor...');
stream.write(`-- 21. ASIGNACIONES_VENDEDOR (${TARGET.toLocaleString()})\n`);
const asignacionIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId   = pick(vendedorIds);
        const fecha = fmtDT(randDate(2020, 2025));
        rows.push(`${i},${vId},'${fecha}','${pick(ESTADO_ASIG)}'`);
        asignacionIds.push(i);
    }
    insertBatch(stream, 'asignaciones_vendedor',
                ['id_asignacion','vendedor_id','fecha_asignacion','estado'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} asignaciones`);


// ── 22. DET_ASIGNACIONES ──────────────────────────────────────────────────────
// Schema: DetAsignacion { id_det_asignacion, asignacion_id, producto_id,
//                         cantidad_asignada }
console.log('[22] det_asignaciones...');
stream.write(`-- 22. DET_ASIGNACIONES (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        rows.push(`${i},${pick(asignacionIds)},${pick(productoIds)},${randInt(1, 50)}`);
    }
    insertBatch(stream, 'det_asignaciones',
                ['id_det_asignacion','asignacion_id','producto_id','cantidad_asignada'], rows);
    stream.write('\n');
}


// ── 23. EVENTOS ───────────────────────────────────────────────────────────────
// Schema: Evento { id_evento, nombre, descripcion, fecha_inicio, fecha_fin,
//                  escuela_id, municipio_id, costo_stand, activo }
console.log('[23] eventos...');
stream.write(`-- 23. EVENTOS (${TARGET.toLocaleString()})\n`);
const eventoIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const fi    = randDate(2020, 2025);
        const ff    = addDays(fi, randInt(1, 5));
        const nm    = esc(`${pick(NOMBRES_EV)} ${i}`);
        const escId = maybe(0.7) ? pick(escuelaIds) : 'NULL';
        const munId = maybe(0.9) ? pick(municipioIds) : 'NULL';
        const costo = (150 + rand() * 850).toFixed(2);
        rows.push(
            `${i},'${nm}','Evento cultural universitario en el Estado de México',` +
            `'${fmtDT(fi)}','${fmtDT(ff)}',${escId},${munId},${costo},${bool(rand() > 0.15)}`
        );
        eventoIds.push(i);
    }
    insertBatch(stream, 'eventos',
                ['id_evento','nombre','descripcion','fecha_inicio','fecha_fin',
                'escuela_id','municipio_id','costo_stand','activo'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} eventos`);


// ── 24. PROMOCIONES ───────────────────────────────────────────────────────────
// Schema: Promocion { id_promocion, nombre, descripcion, tipo_promocion,
//                     valor_descuento, fecha_inicio, fecha_fin, activa }
console.log('[24] promociones...');
stream.write(`-- 24. PROMOCIONES (1 000)\n`);
const promocionIds = [];
{
    const rows = [];
    for (let i = 1; i <= 1000; i++) {
        const fi   = randDate(2020, 2025);
        const ff   = addDays(fi, randInt(3, 30));
        const tipo = pick(TIPO_PROMO);
        const val  = tipo === 'PORCENTAJE'
        ? randInt(5, 50).toFixed(2)
        : (10 + rand() * 90).toFixed(2);
        rows.push(
            `${i},'${esc(pick(NOMBRES_PROMO))} ${i}',` +
            `'Promoción especial para clientes CONVEME','${tipo}',${val},` +
            `'${fmtDT(fi)}','${fmtDT(ff)}',${bool(rand() > 0.25)}`
        );
        promocionIds.push(i);
    }
    insertBatch(stream, 'promociones',
                ['id_promocion','nombre','descripcion','tipo_promocion','valor_descuento',
                'fecha_inicio','fecha_fin','activa'], rows);
    stream.write('\n');
}
console.log(`    1 000 promociones`);


// ── 25. PEDIDOS ───────────────────────────────────────────────────────────────
// Schema: Pedido { id_pedido, cliente_id, vendedor_id, fecha_pedido,
//                  fecha_entrega_estimada, monto_total, anticipo, estado, detalles }
console.log('[25] pedidos...');
stream.write(`-- 25. PEDIDOS (${TARGET.toLocaleString()})\n`);
const pedidoIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const cliId  = maybe(0.85) ? pick(clienteIds) : 'NULL';
        const vId    = maybe(0.90) ? pick(vendedorIds) : 'NULL';
        const fecha  = fmtDT(randDate(2020, 2025));
        // fecha_entrega_estimada es tipo DATE en la BD real (no datetime)
        const entEst = fmtDate(addDays(new Date(fecha), randInt(3, 21)));
        const monto  = (50 + rand() * 2000).toFixed(2);
        const anticipo = (parseFloat(monto) * rand() * 0.5).toFixed(2);
        rows.push(
            // Orden columnas real: id, cliente_id, fecha_pedido, fecha_entrega_estimada,
            //                     monto_total, anticipo, estado, vendedor_id
            `${i},${cliId},'${fecha}','${entEst}',` +
            `${monto},${anticipo},'${pick(ESTADO_PEDIDO)}',${vId}`
        );
        pedidoIds.push(i);
    }
    insertBatch(stream, 'pedidos',
                ['id_pedido','cliente_id','fecha_pedido','fecha_entrega_estimada',
                'monto_total','anticipo','estado','vendedor_id'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} pedidos`);


// ── 26. DET_PEDIDOS ───────────────────────────────────────────────────────────
// Schema: DetPedido { id_det_pedido, pedido_id, producto_id, cantidad, precio_unitario }
console.log('[26] det_pedidos...');
stream.write(`-- 26. DET_PEDIDOS (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const pId  = pick(pedidoIds);
        const prId = pick(productoIds);
        const cant = randInt(1, 20);
        const precio = (10 + rand() * 160).toFixed(2);
        rows.push(`${i},${pId},${prId},${cant},${precio}`);
    }
    insertBatch(stream, 'det_pedidos',
                ['id_det_pedido','pedido_id','producto_id','cantidad','precio_unitario'], rows);
    stream.write('\n');
}


// ── 27. VENTAS ────────────────────────────────────────────────────────────────
// Schema: Venta { id_venta, fecha_venta, cliente_id, vendedor_id,
//                 monto_total, metodo_pago, estado, detalles }
console.log('[27] ventas...');
stream.write(`-- 27. VENTAS (${TARGET.toLocaleString()})\n`);
const ventaIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const cliId  = maybe(0.85) ? pick(clienteIds) : 'NULL';
        const vId    = maybe(0.90) ? pick(vendedorIds) : 'NULL';
        const fecha  = fmtDT(randDate(2020, 2025));
        const monto  = (50 + rand() * 2000).toFixed(2);
        rows.push(
            `${i},'${fecha}',${cliId},${vId},${monto},` +
            `'${pick(METODO_PAGO)}','${pick(ESTADO_VENTA)}'`
        );
        ventaIds.push(i);
    }
    insertBatch(stream, 'ventas',
                ['id_venta','fecha_venta','cliente_id','vendedor_id',
                'monto_total','metodo_pago','estado'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} ventas`);


// ── 28. DET_VENTAS ────────────────────────────────────────────────────────────
// Schema: DetVenta { id_det_venta, venta_id, producto_id, cantidad, precio_unitario }
console.log('[28] det_ventas...');
stream.write(`-- 28. DET_VENTAS (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId  = pick(ventaIds);
        const prId = pick(productoIds);
        const cant = randInt(1, 20);
        const precio = (10 + rand() * 160).toFixed(2);
        rows.push(`${i},${vId},${prId},${cant},${precio}`);
    }
    insertBatch(stream, 'det_ventas',
                ['id_det_venta','venta_id','producto_id','cantidad','precio_unitario'], rows);
    stream.write('\n');
}


// ── 29. CORTES_VENDEDOR ───────────────────────────────────────────────────────
// Schema: CorteVendedor { id_corte, vendedor_id, asignacion_id, fecha_corte,
//                         dinero_esperado, dinero_total_entregado,
//                         diferencia_corte, observaciones, detalles }
// IMPORTANTE: asignacion_id es UNIQUE → corte_i = asignacion_i (1:1)
console.log('[29] cortes_vendedor...');
stream.write(`-- 29. CORTES_VENDEDOR (asignacion_id UNIQUE → corte_i = asignacion_i)\n`);
const corteIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId      = pick(vendedorIds);
        const fecha    = fmtDT(randDate(2020, 2025));
        const esperado = (500 + rand() * 4500).toFixed(2);
        const entregado = (parseFloat(esperado) * (0.80 + rand() * 0.30)).toFixed(2);
        const diferencia = (parseFloat(entregado) - parseFloat(esperado)).toFixed(2);
        rows.push(
            `${i},${vId},${i},'${fecha}',` +
            `${esperado},${entregado},${diferencia},'Sin observaciones adicionales'`
        );
        corteIds.push(i);
    }
    insertBatch(stream, 'cortes_vendedor',
                ['id_corte','vendedor_id','asignacion_id','fecha_corte',
                'dinero_esperado','dinero_total_entregado','diferencia_corte','observaciones'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} cortes`);


// ── 30. DET_CORTES_INVENTARIO ─────────────────────────────────────────────────
// Schema: DetCorteInventario { id_det_corte, corte_id, producto_id,
//                              cantidad_vendida, cantidad_devuelta, merma_reportada }
console.log('[30] det_cortes_inventario...');
stream.write(`-- 30. DET_CORTES_INVENTARIO (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const cId   = pick(corteIds);
        const prId  = pick(productoIds);
        const vend  = randInt(0, 30);
        const dev   = randInt(0, Math.min(5, vend));
        const merma = randInt(0, 2);
        rows.push(`${i},${cId},${prId},${vend},${dev},${merma}`);
    }
    insertBatch(stream, 'det_cortes_inventario',
                ['id_det_corte','corte_id','producto_id','cantidad_vendida',
                'cantidad_devuelta','merma_reportada'], rows);
    stream.write('\n');
}


// ── 31. CUENTAS_BANCARIAS ─────────────────────────────────────────────────────
// Schema: CuentaBancaria { id_cuenta, vendedor_id, banco, titular_cuenta,
//                          numero_cuenta, clabe_interbancaria, activa }
console.log('[31] cuentas_bancarias...');
stream.write(`-- 31. CUENTAS_BANCARIAS_VENDEDOR (${TARGET.toLocaleString()})\n`);
const cuentaIds = [];
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId = pick(vendedorIds);
        rows.push(
            `${i},${vId},'${pick(BANCOS)}',` +
            `'${nombre()} ${apellido()} ${apellido()}',` +
            `'${String(randInt(1000000000, 9999999999))}',` +
            `'${clabe18(i * 17 + 3)}',${bool(rand() > 0.35)}`
        );
        cuentaIds.push(i);
    }
    insertBatch(stream, 'cuentas_bancarias_vendedor',
                ['id_cuenta','vendedor_id','banco','titular_cuenta',
                'numero_cuenta','clabe_interbancaria','activa'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} cuentas bancarias`);


// ── 32. SALDOS_VENDEDORES ─────────────────────────────────────────────────────
// Schema: SaldoVendedor { id_saldo, vendedor_id, saldo_actual }
// IMPORTANTE: vendedor_id es UNIQUE → saldo_i = vendedor_i (1:1, solo N_VENDEDORES filas)
console.log('[32] saldos_vendedores...');
stream.write(`-- 32. SALDO_VENDEDORES (vendedor_id UNIQUE → 1 saldo por vendedor, ${N_VENDEDORES.toLocaleString()} filas)\n`);
{
    const rows = [];
    for (let i = 1; i <= N_VENDEDORES; i++) {
        const saldo = (rand() * 5000).toFixed(2);
        rows.push(`${i},${i},${saldo}`);
    }
    insertBatch(stream, 'saldo_vendedores',
                ['id_saldo','vendedor_id','saldo_actual'], rows);
    stream.write('\n');
}
console.log(`    ${N_VENDEDORES.toLocaleString()} saldos (1 por vendedor)`);


// ── 33. PAGOS_VENDEDORES ──────────────────────────────────────────────────────
// Schema: PagoVendedor { id_pago, vendedor_id, fecha_pago, monto_pagado,
//                        metodo_pago, referencia_o_comprobante }
console.log('[33] pagos_vendedores...');
stream.write(`-- 33. PAGOS_VENDEDORES (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId  = pick(vendedorIds);
        const fecha = fmtDT(randDate(2020, 2025));
        const monto = (100 + rand() * 4900).toFixed(2);
        const ref   = `REF-${String(i).padStart(8,'0')}`;
        rows.push(
            `${i},${vId},'${fecha}',${monto},` +
            `'${pick(METODO_PAGO)}','${ref}'`
        );
    }
    insertBatch(stream, 'pagos_vendedores',
                ['id_pago','vendedor_id','fecha_pago','monto_pagado',
                'metodo_pago','referencia_o_comprobante'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} pagos a vendedores`);


// ── 34. GASTOS_OPERATIVOS ─────────────────────────────────────────────────────
// Schema: GastoOperativo { id_gasto, categoria_id, empleado_id, fecha_gasto,
//                          monto, descripcion, comprobante_url }
console.log('[34] gastos_operativos...');
stream.write(`-- 34. GASTOS_OPERATIVOS (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const catId  = pick(categoriaGastoIds);
        const empId  = maybe(0.75) ? pick(empleadoIds) : 'NULL';
        const fecha  = fmtDT(randDate(2020, 2025));
        const monto  = (50 + rand() * 5000).toFixed(2);
        const desc   = esc(pick(DETALLES_GASTO));
        rows.push(
            `${i},${catId},${empId},'${fecha}',${monto},` +
            `'${desc}','https://gastos.conveme.mx/${i}.pdf'`
        );
    }
    insertBatch(stream, 'gastos_operativos',
                ['id_gasto','categoria_id','empleado_id','fecha_gasto',
                'monto','descripcion','comprobante_url'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} gastos operativos`);


// ── 35. BITACORA_AUDITORIA ────────────────────────────────────────────────────
// Schema: BitacoraAuditoria { id_auditoria, empleado_id, accion,
//                             tabla_afectada, registro_id, detalles, fecha_hora }
console.log('[35] bitacora_auditoria...');
stream.write(`-- 35. BITACORA_AUDITORIA (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const empId     = maybe(0.9) ? pick(empleadoIds) : 'NULL';
        const regId     = randInt(1, TARGET);
        const accion    = pick(ACCIONES_AUD);
        const tabla     = pick(TABLAS_AUD);
        const detalles  = esc(`${accion} en ${tabla} registro #${regId}`);
        const fecha     = fmtDT(randDate(2020, 2025));
        rows.push(`${i},${empId},'${accion}','${tabla}',${regId},'${detalles}','${fecha}'`);
    }
    insertBatch(stream, 'bitacora_auditoria',
                ['id_auditoria','empleado_id','accion','tabla_afectada',
                'registro_id','detalles','fecha_hora'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} registros de auditoría`);


// ── 36. COMPROBANTES ──────────────────────────────────────────────────────────
// Schema: Comprobante { id_comprobante, vendedor_id, admin_id,
//                       total_vendido, comision_vendedor, monto_entregado,
//                       saldo_pendiente, fecha_corte, notas }
// Nota: admin_id → Usuario (no Empleado), por eso usamos adminIds
console.log('[36] comprobantes...');
stream.write(`-- 36. COMPROBANTES (${TARGET.toLocaleString()})\n`);
{
    const rows = [];
    for (let i = 1; i <= TARGET; i++) {
        const vId     = pick(vendedorIds);
        const admId   = pick(adminIds);       // admin_id es un Usuario con rol Admin
        const total   = (500 + rand() * 9500).toFixed(2);
        const comision = (parseFloat(total) * (0.06 + rand() * 0.04)).toFixed(2);
        const entregado = (parseFloat(total) - parseFloat(comision) - rand() * 50).toFixed(2);
        const pendiente = Math.max(0, (parseFloat(total) - parseFloat(entregado))).toFixed(2);
        const fecha   = fmtDT(randDate(2021, 2025));
        const notasVal = maybe(0.7)
        ? esc(`Corte ${maybe() ? 'sin' : 'con'} incidencias. ${pick(['Completado.','Revisado.','Aprobado.'])}`)
        : null;
        const notas = notasVal !== null ? `'${notasVal}'` : 'NULL';
        rows.push(
            `${i},${vId},${admId},${total},${comision},${entregado},${pendiente},'${fecha}',${notas}`
        );
    }
    insertBatch(stream, 'comprobantes',
                ['id_comprobante','vendedor_id','admin_id','total_vendido',
                'comision_vendedor','monto_entregado','saldo_pendiente','fecha_corte','notas'], rows);
    stream.write('\n');
}
console.log(`    ${TARGET.toLocaleString()} comprobantes`);


// ── FIN ───────────────────────────────────────────────────────────────────────
stream.write(`-- ================================================================\n`);
stream.write(`SET FOREIGN_KEY_CHECKS = 1;\n`);
stream.write(`COMMIT;\n\n`);
stream.write(`-- ================================================================\n`);
stream.write(`-- FIN DEL SEED — CONVEME (MariaDB)\n`);
stream.write(`-- Total tablas pobladas: 36\n`);
stream.write(`-- Registros en tablas principales: ${TARGET.toLocaleString()} c/u\n`);
stream.write(`-- Tablas de catálogo: roles(4), paises(1), estados(1),\n`);
stream.write(`--   municipios(${MUNICIPIOS_EDOMEX.length}), categorias(10), tamaños(6),\n`);
stream.write(`--   categorias_gasto(10), escuelas(200), promociones(1000)\n`);
stream.write(`-- ================================================================\n`);

stream.end(() => {
    const mb = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1);
    console.log(`\n✅  COMPLETADO`);
    console.log(`    Archivo : ${OUTPUT}`);
    console.log(`    Tamaño  : ${mb} MB`);
    console.log(`\n📦  Para importar en MariaDB:`);
    console.log(`    mysql -u root -p conveme_bd < seed_conveme.sql\n`);
});
