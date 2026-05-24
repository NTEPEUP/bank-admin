<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import vista360Service from '@/services/vista360Service'
import clientService from '@/services/clientService'

const route = useRoute()
const id = route.params.id
const router = useRouter()

const client = ref(null)
const cuentas = ref([])
const tarjetas = ref([])
const prestamos = ref([])
const reclamos = ref([])
const historial = ref([])

const loading = ref(false)
const error = ref('')
const activeTab = ref(0)
const productsTab = ref(0)
const productsLoaded = ref(false)

async function safeLoad(targetRef, loader, fallback = []) {
    try {
        const value = await loader()
        targetRef.value = value
    } catch (err) {
        console.warn(err)
        targetRef.value = fallback
    }
}

async function loadProducts() {
    if (productsLoaded.value) return
    await safeLoad(cuentas, () => vista360Service.fetchCuentas(id))
    await safeLoad(tarjetas, () => vista360Service.fetchTarjetas(id))
    await safeLoad(prestamos, () => vista360Service.fetchPrestamos(id))
    productsLoaded.value = true
}

async function deleteCuenta(cuentaId) {
    if (!confirm('¿Eliminar la cuenta?')) return
    try {
        loading.value = true
        await vista360Service.deleteCuenta(cuentaId)
        await safeLoad(cuentas, () => vista360Service.fetchCuentas(id))
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

async function deleteTarjeta(tarjetaId) {
    if (!confirm('¿Eliminar la tarjeta?')) return
    try {
        loading.value = true
        await vista360Service.deleteTarjeta(tarjetaId)
        await safeLoad(tarjetas, () => vista360Service.fetchTarjetas(id))
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

async function deletePrestamo(prestamoId) {
    if (!confirm('¿Eliminar el préstamo?')) return
    try {
        loading.value = true
        await vista360Service.deletePrestamo(prestamoId)
        await safeLoad(prestamos, () => vista360Service.fetchPrestamos(id))
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

async function loadAll() {
    if (!id) return
    loading.value = true
    error.value = ''
    try {
        client.value = await clientService.fetchClient(id)
        // normalize id field: API may return `id` or `idCliente`; prefer `idCliente`
        if (client.value) {
            if (client.value.idCliente == null && client.value.id != null) {
                client.value.idCliente = client.value.id
            }
            if (client.value.id == null && client.value.idCliente != null) {
                client.value.id = client.value.idCliente
            }
        }
        await safeLoad(reclamos, () => vista360Service.fetchReclamos(id))
        await safeLoad(historial, () => vista360Service.fetchHistorial(id))
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

onMounted(loadAll)

function goBack() {
    router.push({ name: 'vista360' })
}

function refresh() {
    productsLoaded.value = false
    loadAll()
}
</script>

<template>
    <div>
        <v-toolbar flat color="transparent" class="px-0">
            <v-btn icon @click="goBack" aria-label="Regresar">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="ml-2">
                <div class="title-line">Vista 360</div>
                <div class="subtitle-line">{{ client?.nombres ? `${client.nombres} ${client.apellidos}` : 'Cliente' }}</div>
            </v-toolbar-title>
            <v-spacer />
            <v-btn text small @click="refresh">
                <v-icon left>mdi-refresh</v-icon>
                Refrescar
            </v-btn>
            <v-btn text small color="primary" @click="$router.push({ name: 'client-edit', params: { id: client?.idCliente } })" v-if="client?.idCliente">
                <v-icon left>mdi-account-edit</v-icon>
                Editar cliente
            </v-btn>
        </v-toolbar>

        <div class="muted">DPI: {{ client?.dpi }} — ID: {{ client?.idCliente }}</div>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>

        <div class="card-wrapper mt-4">
            <transition name="fade">
                <v-card>
            <v-tabs v-model="activeTab" background-color="transparent">
                <v-tab>Datos generales</v-tab>
                <v-tab @click="loadProducts">Productos</v-tab>
                <v-tab>Solicitudes / Reclamos</v-tab>
                <v-tab>Historial atención</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
                <v-window-item :value="0">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <div v-if="loading" class="skeleton">
                                    <div class="skeleton-line" style="width:70%"></div>
                                    <div class="skeleton-line" style="width:50%"></div>
                                    <div class="skeleton-line" style="width:40%"></div>
                                </div>
                                <div v-else>
                                    <div><strong>Nombre:</strong> {{ client?.nombres }} {{ client?.apellidos }}</div>
                                    <div><strong>Correo:</strong> {{ client?.correo }}</div>
                                    <div><strong>Teléfono:</strong> {{ client?.telefono }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div v-if="loading" class="skeleton">
                                    <div class="skeleton-line" style="width:80%"></div>
                                    <div class="skeleton-line" style="width:60%"></div>
                                    <div class="skeleton-line" style="width:40%"></div>
                                </div>
                                <div v-else>
                                    <div><strong>Dirección:</strong> {{ client?.direccion }}</div>
                                    <div><strong>Fecha nacimiento:</strong> {{ client?.fechaNacimiento }}</div>
                                    <div><strong>Estado:</strong> {{ client?.estadoCliente }}</div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="1">
                    <v-card-text v-if="activeTab === 1">
                        <v-progress-linear v-if="loading && !productsLoaded" indeterminate color="primary"
                            class="mb-3" />
                        <v-tabs v-model="productsTab" background-color="transparent">
                            <v-tab :value="0">Cuentas</v-tab>
                            <v-tab :value="1">Tarjetas</v-tab>
                            <v-tab :value="2">Préstamos</v-tab>
                        </v-tabs>

                        <v-window v-model="productsTab">
                            <v-window-item :value="0">
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Cuentas ({{ cuentas?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'cuenta-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>

                                    <v-list v-if="cuentas && cuentas.length">
                                        <v-list-item v-for="c in cuentas" :key="c.id"
                                            :title="`${c.numeroCuenta} — ${c.tipoCuenta}`"
                                            :subtitle="`Saldo: ${c.saldo}`">
                                            <template #append>
                                                <v-btn size="small" color="error"
                                                    @click="deleteCuenta(c.id)">Eliminar</v-btn>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay cuentas</div>
                                </v-card-text>
                            </v-window-item>

                            <v-window-item :value="1">
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Tarjetas ({{ tarjetas?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'tarjeta-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>

                                    <v-list v-if="tarjetas && tarjetas.length">
                                        <v-list-item v-for="t in tarjetas" :key="t.id"
                                            :title="`${t.numeroTarjeta} — ${t.tipo}`" :subtitle="`Estado: ${t.estado}`">
                                            <template #append>
                                                <v-btn size="small" color="error"
                                                    @click="deleteTarjeta(t.id)">Eliminar</v-btn>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay tarjetas</div>
                                </v-card-text>
                            </v-window-item>

                            <v-window-item :value="2">
                                <v-card-text>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Préstamos ({{ prestamos?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'prestamo-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>

                                    <v-list v-if="prestamos && prestamos.length">
                                        <v-list-item v-for="p in prestamos" :key="p.id"
                                            :title="`No. de Préstamo: ${p.idPrestamo}`"
                                            :subtitle="`Monto: ${p.monto} — Estado: ${p.estado}`">
                                            <template #append>
                                                <v-btn size="small" color="error"
                                                    @click="deletePrestamo(p.id)">Eliminar</v-btn>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay préstamos</div>
                                </v-card-text>
                            </v-window-item>
                        </v-window>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="2">
                    <v-card-text>
                        <div v-if="reclamos && reclamos.length">
                            <v-btn small color="primary" class="mb-3"
                                @click="$router.push({ name: 'reclamo-create', query: { clienteId: client?.idCliente } })">
                                <v-icon left>mdi-plus</v-icon>
                                Nuevo Reclamo
                            </v-btn>
                            <v-list>
                                <v-data-table :items="reclamos" :headers="[
                                    { title: 'Caso', key: 'titulo' },
                                    { title: 'Tipo', key: 'tipoCaso' },
                                    {title: 'Categoría', key: 'categoria' },
                                    {title: 'Descripción', key: 'descripcion' },
                                    { title: 'Estado', key: 'estado' },
                                    { title: 'Fecha creación', key: 'fechaCreacion' }
                                ]" class="elevation-1">
                                    <template #item="{ item }">
                                        <tr>
                                            <td>{{ item.titulo || item.tipoCaso }}</td>
                                            <td>{{ item.tipoCaso }}</td>
                                            <td>{{ item.categoria }}</td>
                                            <td>{{ item.descripcion }}</td>
                                            <td>{{ item.estado }}</td>
                                            <td>{{ item.fechaCreacion }}</td>
                                        </tr>
                                    </template>

                                </v-data-table>
                                <v-list-item v-for="r in reclamos" :key="r.id" :title="r.titulo || r.tipo"
                                    :subtitle="`${r.estado} — ${r.fechaCreacion}`" />
                            </v-list>
                        </div>
                        <div v-else>No hay solicitudes o reclamos</div>
                    </v-card-text>
                </v-window-item>

                <v-window-item :value="3">
                    <v-card-text>
                        <div v-if="historial && historial.length">
                            <v-list>
                                <v-list-item v-for="h in historial" :key="h.id" :title="h.asunto || h.tipo"
                                    :subtitle="`${h.fecha} — ${h.resumen}`" />
                            </v-list>
                        </div>
                        <div v-else>No hay historial de atención</div>
                    </v-card-text>
                </v-window-item>
            </v-window>
                </v-card>
            </transition>

            <div v-if="loading" class="overlay">
                <v-progress-circular indeterminate color="primary" size="56"></v-progress-circular>
                <div class="overlay-text">Cargando...</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center
}

.muted {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.95rem
}

.title-line {
    font-weight: 600;
    font-size: 1rem;
}

.subtitle-line {
    font-size: 0.9rem;
    color: rgba(0,0,0,0.65);
}

.px-0 {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
    transition: opacity 220ms ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

/* Overlay */
.card-wrapper { position: relative; }
.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.7);
    z-index: 20;
}
.overlay-text {
    margin-top: 10px;
    color: rgba(0,0,0,0.7);
}

/* Skeleton */
.skeleton { display:flex; flex-direction:column; gap:8px; }
.skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
    border-radius: 6px;
}
@keyframes shimmer {
    0% { background-position: 200% 0 }
    100% { background-position: -200% 0 }
}
</style>
