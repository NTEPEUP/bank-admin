<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import clientService from '@/services/clientService'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
    loading.value = true
    error.value = ''
    try {
        const data = await clientService.fetchClients()
        const sourceItems = Array.isArray(data) ? data : data.items || []
        items.value = sourceItems.map((client) => ({
            ...client,
            clientId: client?.id ?? client?.idCliente ?? client?.clienteId ?? null,
        }))
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

function goNew() {
    router.push({ name: 'client-new' })
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
        <div class="page-header">
            <h2>Clientes</h2>
            <v-btn color="primary" @click="goNew" prepend-icon="mdi-plus">Nuevo cliente</v-btn>
        </div>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>

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
                        <v-btn icon size="small" :disabled="!unwrapItem(item).clientId"
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
</style>
