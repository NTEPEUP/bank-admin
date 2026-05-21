<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import clientService from '@/services/clientService'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const form = reactive({
    dpi: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    correo: '',
    telefono: '',
    direccion: '',
    estadoCliente: 'ACTIVO',
})

const loading = ref(false)
const error = ref('')

async function load() {
    if (!id) return
    loading.value = true
    try {
        const data = await clientService.fetchClient(id)
        Object.assign(form, data)
    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}
const snackbar = ref(false)
const snackbarMessage = ref('')

async function submit() {
    error.value = ''
    loading.value = true

    try {
        if (id) {
            await clientService.updateClient(id, form)
            snackbarMessage.value = 'Cliente actualizado exitosamente'
        } else {
            await clientService.createClient(form)
            snackbarMessage.value = 'Cliente creado exitosamente'
        }

        snackbar.value = true

        await new Promise(resolve => setTimeout(resolve, 1500))

        router.push({ name: 'clients' })

    } catch (err) {
        error.value = err.message || String(err)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<template>
    <div>
        <h2>{{ id ? 'Editar cliente' : 'Crear cliente' }}</h2>

        <v-alert v-if="error" type="error">{{ error }}</v-alert>

        <v-form @submit.prevent="submit">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.dpi" label="DPI" required />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.fechaNacimiento" label="Fecha nacimiento" type="date" />
                </v-col>

                <v-col cols="12" md="6">
                    <v-text-field v-model="form.nombres" label="Nombres" required />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.apellidos" label="Apellidos" required />
                </v-col>

                <v-col cols="12" md="6">
                    <v-text-field v-model="form.correo" label="Correo" type="email" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="form.telefono" label="Teléfono" />
                </v-col>

                <v-col cols="12">
                    <v-text-field v-model="form.direccion" label="Dirección" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.estadoCliente" :items="['ACTIVO', 'INACTIVO']" label="Estado" />
                </v-col>
            </v-row>

            <div class="form-actions">
                <v-btn type="submit" color="primary" :loading="loading">{{ id ? 'Actualizar' : 'Crear' }}</v-btn>
                <v-btn variant="text" @click="$router.back()">Cancelar</v-btn>
            </div>
        </v-form>
    </div>
    <v-snackbar v-model="snackbar" color="success" timeout="3000" location="top right">
        {{ snackbarMessage }}
        <template #actions>
            <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
        </template>
    </v-snackbar>
</template>
<style scoped>
.form-actions {
    margin-top: 1rem;
    display: flex;
    gap: 0.75rem
}
</style>
