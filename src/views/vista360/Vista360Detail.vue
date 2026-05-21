<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import vista360Service from '@/services/vista360Service'
import clientService from '@/services/clientService'

const route = useRoute()
const id = route.params.id

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
</script>

<template>
    <div>
        <div class="header-row">
            <div>
                <h2>Vista 360 — {{ client?.nombres ? `${client.nombres} ${client.apellidos}` : 'Cliente' }}</h2>
                <div class="muted">DPI: {{ client?.dpi }} — ID: {{ client?.idCliente }}</div>
            </div>
        </div>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>

        <v-card class="mt-4">
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
                                <div><strong>Nombre:</strong> {{ client?.nombres }} {{ client?.apellidos }}</div>
                                <div><strong>Correo:</strong> {{ client?.correo }}</div>
                                <div><strong>Teléfono:</strong> {{ client?.telefono }}</div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div><strong>Dirección:</strong> {{ client?.direccion }}</div>
                                <div><strong>Fecha nacimiento:</strong> {{ client?.fechaNacimiento }}</div>
                                <div><strong>Estado:</strong> {{ client?.estadoCliente }}</div>
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
                            <v-list>
                                <v-list-item v-for="r in reclamos" :key="r.id" :title="r.titulo || r.tipo"
                                    :subtitle="`${r.estado} — ${r.creadoEn}`" />
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
</style>
