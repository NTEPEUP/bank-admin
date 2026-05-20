<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import vista360Service from '@/services/vista360Service'

const router = useRouter()
const dpi = ref('')
const codigo = ref('')
const loading = ref(false)
const error = ref('')

async function searchByDpi() {
    error.value = ''
    if (!dpi.value) { error.value = 'Ingrese un DPI'; return }
    loading.value = true
    try {
        const res = await vista360Service.getByDpi(dpi.value)
        const id = res?.id || res?.clienteId || res?.idCliente
        if (!id) throw new Error('Cliente no encontrado')
        router.push({ name: 'vista360-detail', params: { id } })
    } catch (err) {
        error.value = err.message || String(err)
    } finally { loading.value = false }
}

async function searchByCodigo() {
    error.value = ''
    if (!codigo.value) { error.value = 'Ingrese un código'; return }
    loading.value = true
    try {
        const res = await vista360Service.getByCodigo(codigo.value)
        const id = res?.id || res?.clienteId || res?.idCliente
        if (!id) throw new Error('Cliente no encontrado')
        router.push({ name: 'vista360-detail', params: { id } })
    } catch (err) {
        error.value = err.message || String(err)
    } finally { loading.value = false }
}
</script>

<template>
    <div>
        <h2>Vista 360 — Buscar cliente</h2>
        <v-card class="pa-4">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="dpi" label="Buscar por DPI" clearable />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                    <v-btn color="primary" @click="searchByDpi" :loading="loading">Buscar</v-btn>
                </v-col>

                <v-col cols="12" md="6">
                    <v-text-field v-model="codigo" label="Buscar por código" clearable />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                    <v-btn color="primary" @click="searchByCodigo" :loading="loading">Buscar</v-btn>
                </v-col>
            </v-row>

            <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
        </v-card>
    </div>
</template>

<style scoped>
h2 {
    margin-bottom: 0.75rem
}
</style>
