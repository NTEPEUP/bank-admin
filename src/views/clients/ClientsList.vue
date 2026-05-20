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
        items.value = Array.isArray(data) ? data : data.items || []
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
    router.push({ name: 'client-edit', params: { id } })
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

        <v-data-table :items="items" :loading="loading" dense>
            <template #item.actions="{ item }">
                <v-btn icon small @click="edit(item.id)">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </template>

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
                    <td>{{ item.id }}</td>
                    <td>{{ item.dpi }}</td>
                    <td>{{ item.nombres }} {{ item.apellidos }}</td>
                    <td>{{ item.correo }}</td>
                    <td>{{ item.estadoCliente }}</td>
                    <td>
                        <v-btn icon small @click="edit(item.id)"><v-icon>mdi-pencil</v-icon></v-btn>
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
