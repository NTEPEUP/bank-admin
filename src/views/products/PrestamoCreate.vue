<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import vista360Service from '@/services/vista360Service'

const route = useRoute()
const router = useRouter()
const clienteId = route.query.clienteId || route.params.clienteId

const form = reactive({
    idCliente: '',
    monto: 0.0,
    saldoPendiente: 0.0,
    tasaInteres: 0.0,
    plazoMeses: 12,
    estado: 'ACTIVO',
})

const loading = ref(false)
const error = ref('')

onMounted(() => {
    if (clienteId) {
        form.idCliente = clienteId
    } else {
        error.value = 'Falta id de cliente'
        setTimeout(() => router.back(), 1200)
    }
})

async function submit() {
    error.value = ''
    loading.value = true
    try {
        await vista360Service.createPrestamo(form)
        router.push({ name: 'vista360-detail', params: { id: form.idCliente } })
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div>
        <h2>Crear Préstamo</h2>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-form @submit.prevent="submit">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.idCliente" label="ID Cliente" required disabled />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model.number="form.monto" label="Monto" type="number" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model.number="form.tasaInteres" label="Tasa interés (%)" type="number" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model.number="form.plazoMeses" label="Plazo (meses)" type="number" />
                </v-col>
            </v-row>

            <div class="form-actions">
                <v-btn type="submit" color="primary" :loading="loading">Crear préstamo</v-btn>
                <v-btn variant="text" @click="$router.back()">Cancelar</v-btn>
            </div>
        </v-form>
    </div>
</template>

<style scoped>
.form-actions {
    margin-top: 1rem;
    display: flex;
    gap: 0.75rem
}
</style>
