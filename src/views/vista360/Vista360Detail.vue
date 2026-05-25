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
                <div class="subtitle-line">{{ client?.nombres ? `${client.nombres} ${client.apellidos}` : 'Cliente' }}
                </div>
            </v-toolbar-title>
            <v-spacer />
            <v-btn text small @click="refresh">
                <v-icon left>mdi-refresh</v-icon>
                Refrescar
            </v-btn>
            <v-btn text small color="primary"
                @click="$router.push({ name: 'client-edit', params: { id: client?.idCliente } })"
                v-if="client?.idCliente">
                <v-icon left>mdi-account-edit</v-icon>
                Editar cliente
            </v-btn>
        </v-toolbar>

        <v-card class="hero-card mt-2" elevation="0">
            <v-card-text class="hero-content">
                <div>
                    <div class="hero-kicker">Perfil de cliente</div>
                    <div class="hero-name">
                        {{ client?.nombres ? `${client.nombres} ${client.apellidos}` : 'Cliente' }}
                    </div>
                    <div class="hero-meta">
                        <span>DPI {{ client?.dpi || 'N/D' }}</span>
                        <span>ID {{ client?.idCliente || 'N/D' }}</span>
                    </div>
                </div>
                <div class="hero-status-wrap">
                    <v-chip size="small" color="primary" variant="tonal" class="hero-chip">
                        {{ client?.estadoCliente || 'Sin estado' }}
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>

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
                                <div class="section-heading mb-4">
                                    <div>
                                        <div class="section-kicker">Datos generales</div>
                                        <div class="section-title">Información principal del cliente</div>
                                    </div>
                                </div>

                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-card class="info-panel" variant="flat">
                                            <v-card-title class="info-panel__title">Identificación</v-card-title>
                                            <v-card-text>
                                                <div v-if="loading" class="skeleton">
                                                    <div class="skeleton-line" style="width:70%"></div>
                                                    <div class="skeleton-line" style="width:50%"></div>
                                                    <div class="skeleton-line" style="width:40%"></div>
                                                </div>
                                                <div v-else class="detail-list">
                                                    <div class="detail-row">
                                                        <span class="detail-label">Nombre completo</span>
                                                        <span class="detail-value">{{ client?.nombres }} {{
                                                            client?.apellidos }}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">DPI</span>
                                                        <span class="detail-value">{{ client?.dpi || 'N/D' }}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Estado</span>
                                                        <span class="detail-value">
                                                            <v-chip size="x-small" color="primary" variant="tonal">
                                                                {{ client?.estadoCliente || 'Sin estado' }}
                                                            </v-chip>
                                                        </span>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-card class="info-panel" variant="flat">
                                            <v-card-title class="info-panel__title">Contacto y ubicación</v-card-title>
                                            <v-card-text>
                                                <div v-if="loading" class="skeleton">
                                                    <div class="skeleton-line" style="width:80%"></div>
                                                    <div class="skeleton-line" style="width:60%"></div>
                                                    <div class="skeleton-line" style="width:40%"></div>
                                                </div>
                                                <div v-else class="detail-list">
                                                    <div class="detail-row">
                                                        <span class="detail-label">Correo</span>
                                                        <span class="detail-value">{{ client?.correo || 'N/D' }}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Teléfono</span>
                                                        <span class="detail-value">{{ client?.telefono || 'N/D'
                                                        }}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Dirección</span>
                                                        <span class="detail-value">{{ client?.direccion || 'N/D'
                                                        }}</span>
                                                    </div>
                                                    <div class="detail-row">
                                                        <span class="detail-label">Fecha de nacimiento</span>
                                                        <span class="detail-value">{{ client?.fechaNacimiento || 'N/D'
                                                        }}</span>
                                                    </div>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-window-item>

                        <v-window-item :value="1">
                            <v-card-text v-if="activeTab === 1">
                                <v-progress-linear v-if="loading && !productsLoaded" indeterminate color="primary"
                                    class="mb-3" />

                                <div class="section-heading section-heading--tight mb-4">
                                    <div>
                                        <div class="section-kicker">Productos</div>
                                        <div class="section-title">Resumen de productos asociados</div>
                                    </div>
                                    <div class="product-stats">
                                        <v-chip size="small" variant="tonal" color="primary">Cuentas {{ cuentas?.length
                                            || 0 }}</v-chip>
                                        <v-chip size="small" variant="tonal" color="primary">Tarjetas {{
                                            tarjetas?.length || 0 }}</v-chip>
                                        <v-chip size="small" variant="tonal" color="primary">Préstamos {{
                                            prestamos?.length || 0 }}</v-chip>
                                    </div>
                                </div>

                                <v-tabs v-model="productsTab" background-color="transparent">
                                    <v-tab :value="0">Cuentas</v-tab>
                                    <v-tab :value="1">Tarjetas</v-tab>
                                    <v-tab :value="2">Préstamos</v-tab>
                                </v-tabs>

                                <v-window v-model="productsTab">
                                    <v-window-item :value="0">
                                        <v-card-text>
                                            <div class="product-header">
                                                <div>
                                                    <div class="product-title">Cuentas</div>
                                                    <div class="product-subtitle">{{ cuentas?.length || 0 }} cuenta(s)
                                                        registradas</div>
                                                </div>
                                                <v-btn size="large" color="success" variant="flat"
                                                    @click="$router.push({ name: 'cuenta-create', query: { clienteId: client?.idCliente } })">
                                                    Crear
                                                </v-btn>
                                            </div>

                                            <div v-if="cuentas && cuentas.length" class="product-list">
                                                <v-card v-for="c in cuentas" :key="c.id" class="product-item"
                                                    variant="flat">
                                                    <v-card-text class="product-item__content">
                                                        <div>
                                                            <div class="product-item__title">{{ c.numeroCuenta }}</div>
                                                            <div class="product-item__meta">{{ c.tipoCuenta }}</div>
                                                        </div>
                                                        <div class="product-item__actions">
                                                            <div class="product-badge">Saldo: {{ c.saldo }}</div>
                                                            <!-- <v-btn size="small" variant="text" color="error"
                                                                @click="deleteCuenta(c.id)">Eliminar</v-btn> -->
                                                        </div>
                                                    </v-card-text>
                                                </v-card>
                                            </div>
                                            <div v-else class="empty-state">No hay cuentas</div>
                                        </v-card-text>
                                    </v-window-item>

                                    <v-window-item :value="1">
                                        <v-card-text>
                                            <div class="product-header">
                                                <div>
                                                    <div class="product-title">Tarjetas</div>
                                                    <div class="product-subtitle">{{ tarjetas?.length || 0 }} tarjeta(s)
                                                        registradas</div>
                                                </div>
                                                <v-btn size="large" color="success" variant="flat"
                                                    @click="$router.push({ name: 'tarjeta-create', query: { clienteId: client?.idCliente } })">
                                                    Crear
                                                </v-btn>
                                            </div>

                                            <div v-if="tarjetas && tarjetas.length" class="product-list">
                                                <v-card v-for="t in tarjetas" :key="t.id" class="product-item"
                                                    variant="flat">
                                                    <v-card-text class="product-item__content">
                                                        <div>
                                                            <div class="product-item__title">{{ t.numeroTarjeta }}</div>
                                                            <div class="product-item__meta">{{ t.tipo }}</div>
                                                        </div>
                                                        <div class="product-item__actions">
                                                            <div class="product-badge">Estado: {{ t.estado }}</div>
                                                            <!--  <v-btn size="small" variant="text" color="error"
                                                                @click="deleteTarjeta(t.id)">Eliminar</v-btn> -->
                                                        </div>
                                                    </v-card-text>
                                                </v-card>
                                            </div>
                                            <div v-else class="empty-state">No hay tarjetas</div>
                                        </v-card-text>
                                    </v-window-item>

                                    <v-window-item :value="2">
                                        <v-card-text>
                                            <div class="product-header">
                                                <div>
                                                    <div class="product-title">Préstamos</div>
                                                    <div class="product-subtitle">{{ prestamos?.length || 0 }}
                                                        préstamo(s) registrados</div>
                                                </div>
                                                <v-btn size="large" color="success" variant="flat"
                                                    @click="$router.push({ name: 'prestamo-create', query: { clienteId: client?.idCliente } })">
                                                    Crear
                                                </v-btn>
                                            </div>

                                            <div v-if="prestamos && prestamos.length" class="product-list">
                                                <v-card v-for="p in prestamos" :key="p.id" class="product-item"
                                                    variant="flat">
                                                    <v-card-text class="product-item__content">
                                                        <div>
                                                            <div class="product-item__title">No. de Préstamo: {{
                                                                p.idPrestamo }}</div>
                                                            <div class="product-item__meta">Monto: {{ p.monto }}</div>
                                                        </div>
                                                        <div class="product-item__actions">
                                                            <div class="product-badge">Estado: {{ p.estado }}</div>
                                                            <!-- <v-btn size="small" variant="text" color="error"
                                                                @click="deletePrestamo(p.id)">Eliminar</v-btn> -->
                                                        </div>
                                                    </v-card-text>
                                                </v-card>
                                            </div>
                                            <div v-else class="empty-state">No hay préstamos</div>
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
                                            { title: 'Categoría', key: 'categoria' },
                                            { title: 'Descripción', key: 'descripcion' },
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

.hero-card {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.9));
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.hero-content {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
}

.hero-kicker,
.section-kicker {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(37, 99, 235, 0.9);
}

.hero-name {
    margin-top: 4px;
    font-size: 1.45rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.96);
}

.hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
    color: rgba(71, 85, 105, 0.9);
    font-size: 0.94rem;
}

.hero-status-wrap {
    display: flex;
    justify-content: flex-end;
    min-width: 140px;
}

.hero-chip {
    font-weight: 600;
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
}

.section-heading--tight {
    align-items: center;
}

.section-title {
    margin-top: 2px;
    font-size: 1.05rem;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.96);
}

.info-panel {
    height: 100%;
    border-radius: 18px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

.info-panel__title {
    font-size: 1rem;
    font-weight: 700;
    padding-bottom: 0;
    color: rgba(15, 23, 42, 0.96);
}

.detail-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.detail-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
}

.detail-label {
    color: rgba(100, 116, 139, 0.95);
    font-size: 0.92rem;
    font-weight: 500;
}

.detail-value {
    color: rgba(15, 23, 42, 0.96);
    font-weight: 600;
    text-align: right;
}

.product-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
}

.product-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
}

.product-title {
    font-weight: 700;
    font-size: 1rem;
    color: rgba(15, 23, 42, 0.96);
}

.product-subtitle {
    margin-top: 2px;
    color: rgba(100, 116, 139, 0.95);
    font-size: 0.92rem;
}

.product-list {
    display: grid;
    gap: 12px;
}

.product-item {
    border-radius: 16px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
}

.product-item__content {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
}

.product-item__title {
    font-weight: 700;
    color: rgba(15, 23, 42, 0.96);
}

.product-item__meta {
    margin-top: 2px;
    color: rgba(100, 116, 139, 0.95);
    font-size: 0.92rem;
}

.product-item__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.product-badge {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.08);
    color: rgba(30, 64, 175, 0.96);
    font-weight: 600;
    font-size: 0.88rem;
}

.empty-state {
    padding: 22px;
    text-align: center;
    color: rgba(100, 116, 139, 0.95);
    border: 1px dashed rgba(148, 163, 184, 0.5);
    border-radius: 16px;
    background: rgba(248, 250, 252, 0.8);
}

.title-line {
    font-weight: 600;
    font-size: 1rem;
}

.subtitle-line {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.65);
}

.px-0 {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

@media (max-width: 960px) {

    .hero-content,
    .section-heading,
    .product-header,
    .product-item__content,
    .detail-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .hero-status-wrap,
    .product-stats,
    .product-item__actions,
    .detail-value {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
    }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 220ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Overlay */
.card-wrapper {
    position: relative;
}

.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    z-index: 20;
}

.overlay-text {
    margin-top: 10px;
    color: rgba(0, 0, 0, 0.7);
}

/* Skeleton */
.skeleton {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
    border-radius: 6px;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0
    }

    100% {
        background-position: -200% 0
    }
}
</style>
