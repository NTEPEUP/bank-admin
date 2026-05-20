<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import vista360Service from '@/services/vista360Service'

const route = useRoute()
const router = useRouter()
const clienteId = route.query.clienteId || route.params.clienteId

const form = reactive({
    idCliente: '',
    numeroTarjeta: '',
    tipoTarjeta: 'TARJETA_DEBITO',
    limiteCredito: 0.0,
    saldoUtilizado: 0.0,
    estado: 'ACTIVA',
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
        await vista360Service.createTarjeta(form)
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
        <h2>Crear Tarjeta</h2>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-form @submit.prevent="submit">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.idCliente" label="ID Cliente" required disabled />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.numeroTarjeta" label="Número de tarjeta" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-select v-model="form.tipoTarjeta" :items="['TARJETA_DEBITO', 'TARJETA_CREDITO']" label="Tipo" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model.number="form.limiteCredito" label="Límite de crédito" type="number" />
                </v-col>
            </v-row>

            <div class="form-actions">
                <v-btn type="submit" color="primary" :loading="loading">Crear tarjeta</v-btn>
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
