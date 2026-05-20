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

async function loadAll() {
    if (!id) return
    loading.value = true
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
        cuentas.value = await vista360Service.fetchCuentas(id)
        tarjetas.value = await vista360Service.fetchTarjetas(id)
        prestamos.value = await vista360Service.fetchPrestamos(id)
        reclamos.value = await vista360Service.fetchReclamos(id)
        historial.value = await vista360Service.fetchHistorial(id)
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
                <v-tab>Productos</v-tab>
                <v-tab>Solicitudes / Reclamos</v-tab>
                <v-tab>Historial atención</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
                <v-tab-item>
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
                </v-tab-item>

                <v-tab-item>
                    <v-card-text>
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Cuentas ({{ cuentas?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'cuenta-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-list v-if="cuentas && cuentas.length">
                                        <v-list-item v-for="c in cuentas" :key="c.id">
                                            <v-list-item-content>
                                                <v-list-item-title>{{ c.numeroCuenta }} — {{ c.tipo
                                                    }}</v-list-item-title>
                                                <v-list-item-subtitle>Saldo: {{ c.saldo }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay cuentas</div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Tarjetas ({{ tarjetas?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'tarjeta-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-list v-if="tarjetas && tarjetas.length">
                                        <v-list-item v-for="t in tarjetas" :key="t.id">
                                            <v-list-item-content>
                                                <v-list-item-title>{{ t.numeroTarjeta }} — {{ t.tipo
                                                    }}</v-list-item-title>
                                                <v-list-item-subtitle>Estado: {{ t.estado }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay tarjetas</div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                            <v-expansion-panel>
                                <v-expansion-panel-title>
                                    <div class="d-flex align-center justify-space-between" style="width:100%">
                                        <div>Préstamos ({{ prestamos?.length || 0 }})</div>
                                        <v-btn small color="primary"
                                            @click="$router.push({ name: 'prestamo-create', query: { clienteId: client?.idCliente } })">Crear</v-btn>
                                    </div>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-list v-if="prestamos && prestamos.length">
                                        <v-list-item v-for="p in prestamos" :key="p.id">
                                            <v-list-item-content>
                                                <v-list-item-title>{{ p.tipo }} — {{ p.monto }}</v-list-item-title>
                                                <v-list-item-subtitle>Estado: {{ p.estado }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                    <div v-else>No hay préstamos</div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>

                        </v-expansion-panels>
                    </v-card-text>
                </v-tab-item>

                <v-tab-item>
                    <v-card-text>
                        <div v-if="reclamos && reclamos.length">
                            <v-list>
                                <v-list-item v-for="r in reclamos" :key="r.id">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ r.titulo || r.tipo }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ r.estado }} — {{ r.creadoEn }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </div>
                        <div v-else>No hay solicitudes o reclamos</div>
                    </v-card-text>
                </v-tab-item>

                <v-tab-item>
                    <v-card-text>
                        <div v-if="historial && historial.length">
                            <v-list>
                                <v-list-item v-for="h in historial" :key="h.id">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ h.asunto || h.tipo }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ h.fecha }} — {{ h.resumen }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </div>
                        <div v-else>No hay historial de atención</div>
                    </v-card-text>
                </v-tab-item>
            </v-tabs-items>
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
