<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import clientService from '@/services/clientService'
import vista360Service from '@/services/vista360Service'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const error = ref('')
const searching = ref(false)
const detailDialog = ref(false)
const detailLoading = ref(false)
const selectedClient = ref(null)

const filters = reactive({
    dpi: '',
    codigoCliente: '',
})

const selectedClientDisplayName = computed(() => {
    const client = selectedClient.value

    if (!client) {
        return 'Cliente'
    }

    return `${client.nombres || ''} ${client.apellidos || ''}`.trim() || 'Cliente'
})

function normalizeClient(client) {
    return {
        ...client,
        clientId: client?.id ?? client?.idCliente ?? client?.clienteId ?? null,
    }
}

function normalizeItems(data) {
    const sourceItems = Array.isArray(data) ? data : data?.items || data ? [data] : []
    return sourceItems.filter(Boolean).map(normalizeClient)
}

async function load() {
    loading.value = true
    error.value = ''
    try {
        const data = await clientService.fetchClients()
        items.value = normalizeItems(data)
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

async function searchByDpi() {
    if (!filters.dpi.trim()) {
        error.value = 'Ingrese un DPI para buscar'
        return
    }

    searching.value = true
    error.value = ''

    try {
        const data = await vista360Service.getByDpi(filters.dpi.trim())
        items.value = normalizeItems(data)
        if (!items.value.length) {
            error.value = 'No se encontraron clientes con ese DPI'
        }
    } catch (err) {
        error.value = err.message || String(err)
        items.value = []
    } finally {
        searching.value = false
    }
}

async function searchByCodigoCliente() {
    if (!filters.codigoCliente.trim()) {
        error.value = 'Ingrese un código de cliente para buscar'
        return
    }

    searching.value = true
    error.value = ''

    try {
        const data = await vista360Service.getByCodigo(filters.codigoCliente.trim())
        items.value = normalizeItems(data)
        if (!items.value.length) {
            error.value = 'No se encontraron clientes con ese código'
        }
    } catch (err) {
        error.value = err.message || String(err)
        items.value = []
    } finally {
        searching.value = false
    }
}

async function searchClients() {
    const dpi = filters.dpi.trim()
    const codigoCliente = filters.codigoCliente.trim()

    if (!dpi && !codigoCliente) {
        error.value = 'Ingrese un DPI o un código de cliente para buscar'
        return
    }

    if (dpi) {
        await searchByDpi()
        return
    }

    await searchByCodigoCliente()
}

function clearSearch() {
    filters.dpi = ''
    filters.codigoCliente = ''
    load()
}

function goNew() {
    router.push({ name: 'client-new' })
}

function closeDetailDialog() {
    detailDialog.value = false
    selectedClient.value = null
}

async function viewInfo(item) {
    const clientId = unwrapItem(item).clientId

    if (!clientId) {
        error.value = 'No se pudo identificar el cliente para visualizarlo'
        return
    }

    error.value = ''
    detailDialog.value = true
    detailLoading.value = true

    const baseClient = normalizeClient(unwrapItem(item))
    selectedClient.value = baseClient

    try {
        const detail = await clientService.fetchClient(clientId)
        selectedClient.value = normalizeClient({
            ...baseClient,
            ...(detail || {}),
        })
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        detailLoading.value = false
    }
}

function edit(id) {
    if (!id) {
        error.value = 'No se pudo identificar el cliente para editarlo'
        return
    }

    router.push({ name: 'client-edit', params: { id } })
}

function unwrapItem(item) {
    return item?.raw ?? item ?? {}
}

onMounted(load)
</script>

<template>
    <div>
        <div class="page-header justify-content-between">
            <v-chip color="success">
                   <h1>Clientes</h1>
            </v-chip>
            <v-btn color="success" @click="goNew" prepend-icon="mdi-plus">Crear cliente</v-btn>
        </div>

        <v-card class="search-panel" rounded="xl" >
            <v-card-title>Buscar cliente</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filters.dpi" label="Buscar por DPI" placeholder="Ingresa el DPI"
                         clearable />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filters.codigoCliente" label="Buscar por código de cliente"
                            placeholder="Ingresa el códigoCliente" clearable />
                    </v-col>
                    <v-col cols="12" md="4" class="search-actions">
                        <v-btn color="primary" :loading="searching" :disabled="searching" @click="searchClients"
                            prepend-icon="mdi-magnify">
                            Buscar
                        </v-btn>
                        <v-btn variant="text" :disabled="searching && loading" @click="clearSearch"
                            prepend-icon="mdi-filter-remove-outline">
                            Limpiar
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>

        <v-dialog v-model="detailDialog" max-width="820" scrollable>
            <v-card rounded="xl">
                <v-card-title class="detail-dialog__header">
                    <div>
                        <div class="detail-dialog__eyebrow">Información del cliente</div>
                        <div>{{ selectedClientDisplayName }}</div>
                    </div>
                    <v-btn icon variant="text" @click="closeDetailDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-progress-linear v-if="detailLoading" indeterminate color="primary" class="mb-4" />

                    <v-row v-if="selectedClient">
                        <v-col cols="12" md="6">
                            <div class="detail-field"><span>DPI:</span> {{ selectedClient.dpi || 'No disponible' }}</div>
                            <div class="detail-field"><span>Código cliente:</span> {{ selectedClient.codigoCliente || selectedClient.codigo || selectedClient.clientCode || 'No disponible' }}</div>
                            <div class="detail-field"><span>Usuario:</span> {{ selectedClient.username || 'No disponible' }}</div>
                            <div class="detail-field"><span>Estado:</span> {{ selectedClient.estadoCliente || 'No disponible' }}</div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="detail-field"><span>Correo:</span> {{ selectedClient.correo || 'No disponible' }}</div>
                            <div class="detail-field"><span>Teléfono:</span> {{ selectedClient.telefono || 'No disponible' }}</div>
                            <div class="detail-field"><span>Dirección:</span> {{ selectedClient.direccion || 'No disponible' }}</div>
                            <div class="detail-field"><span>Fecha nacimiento:</span> {{ selectedClient.fechaNacimiento || 'No disponible' }}</div>
                        </v-col>
                    </v-row>

                    <v-alert v-else type="info" variant="tonal">
                        No hay información disponible para este cliente.
                    </v-alert>
                </v-card-text>

                <v-divider />

                <v-card-actions class="justify-end">
                    <v-btn color="primary" variant="tonal" @click="closeDetailDialog">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-data-table :items="items" :loading="loading" density="comfortable">
            <template #headers>
                <tr>
                    <th>Id</th>
                    <th>DPI</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </template>
            <template #item="{ item }">
                <tr>
                    <td>{{ unwrapItem(item).clientId }}</td>
                    <td>{{ unwrapItem(item).dpi }}</td>
                    <td>{{ unwrapItem(item).nombres }} {{ unwrapItem(item).apellidos }}</td>
                    <td>{{ unwrapItem(item).correo }}</td>
                    <td>{{ unwrapItem(item).estadoCliente }}</td>
                    <td>
                        <v-btn icon size="small" variant="text" :disabled="!unwrapItem(item).clientId"
                            @click.stop="viewInfo(item)">
                            <v-icon>mdi-eye-outline</v-icon>
                        </v-btn>
                        <v-btn icon size="small" variant="text" :disabled="!unwrapItem(item).clientId"
                            @click.stop="edit(unwrapItem(item).clientId)">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.search-panel {
    margin-bottom: 1rem;
}

.search-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
}

.detail-dialog__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.detail-dialog__eyebrow {
    margin-bottom: 0.25rem;
    color: rgba(7, 46, 73, 0.62);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.detail-field {
    margin-bottom: 0.85rem;
    color: #072e49;
    line-height: 1.5;
}

.detail-field span {
    font-weight: 700;
}
</style>
