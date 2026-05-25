<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getByDpi } from '@/services/vista360Service'
import { createUser } from '@/services/userService'

const router = useRouter()

const search = reactive({ dpi: '' })
const form = reactive({
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
  roleName: 'CLIENTE',
  idCliente: null,
})

const client = ref(null)
const searching = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const snackbar = ref(false)

const hasClient = computed(() => Boolean(client.value?.idCliente || client.value?.id))

function syncClientData(data) {
  client.value = data
  form.nombres = data?.nombres || ''
  form.apellidos = data?.apellidos || ''
  form.correo = data?.correo || ''
  form.telefono = data?.telefono || ''
  form.direccion = data?.direccion || ''
  form.idCliente = data?.idCliente ?? data?.id ?? null
  form.roleName = 'CLIENTE'
}

async function searchClient() {
  error.value = ''
  if (!search.dpi?.trim()) {
    error.value = 'Ingrese un DPI para buscar al cliente.'
    return
  }

  searching.value = true
  try {
    const data = await getByDpi(search.dpi.trim())
    syncClientData(data)
  } catch (err) {
    client.value = null
    form.idCliente = null
    error.value = err.message || String(err)
  } finally {
    searching.value = false
  }
}

async function submit() {
  error.value = ''
  if (!hasClient.value) {
    error.value = 'Primero debe buscar y seleccionar un cliente.'
    return
  }

  loading.value = true
  try {
    await createUser({
      username: form.username,
      password: form.password,
      nombres: form.nombres,
      apellidos: form.apellidos,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      roleName: 'CLIENTE',
      idCliente: form.idCliente,
    })

    successMessage.value = 'Usuario de banca en línea creado exitosamente'
    snackbar.value = true

    search.dpi = ''
    client.value = null
    form.username = ''
    form.password = ''
    form.nombres = ''
    form.apellidos = ''
    form.correo = ''
    form.telefono = ''
    form.direccion = ''
    form.idCliente = null
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <v-card class="header-card" elevation="4">
      <div>
        <div class="eyebrow">Banca en línea</div>
        <h1>Crear usuario desde cliente</h1>
        <p>
          Busca al cliente por DPI, precarga su información y crea el usuario con <strong>roleName = CLIENTE</strong>.
          Aquí sí se envía <strong>idCliente</strong>.
        </p>
      </div>

      <v-chip color="success" variant="tonal" label>
        <v-icon start size="small">mdi-card-account-details</v-icon>
        Flujo asistido
      </v-chip>
    </v-card>

    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card class="search-card" elevation="3">
      <v-card-text>
        <div class="section-title">1. Buscar cliente</div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field v-model="search.dpi" label="DPI del cliente" prepend-inner-icon="mdi-card-account-details" />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn block color="primary" :loading="searching" @click="searchClient">Buscar cliente</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="client-card" elevation="3" v-if="hasClient">
      <v-card-text>
        <div class="section-title">2. Datos del cliente</div>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field :model-value="client?.nombres" label="Nombres" readonly variant="solo-filled" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :model-value="client?.apellidos" label="Apellidos" readonly variant="solo-filled" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :model-value="client?.correo" label="Correo" readonly variant="solo-filled" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :model-value="client?.telefono" label="Teléfono" readonly variant="solo-filled" />
          </v-col>
          <v-col cols="12">
            <v-text-field :model-value="client?.direccion" label="Dirección" readonly variant="solo-filled" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="form-card" elevation="3">
      <v-card-text>
        <div class="section-title">3. Crear usuario</div>
        <v-form @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="Usuario" prepend-inner-icon="mdi-account" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.password" label="Contraseña" type="password" prepend-inner-icon="mdi-lock" required />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.nombres" label="Nombres" readonly variant="solo-filled" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.apellidos" label="Apellidos" readonly variant="solo-filled" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.correo" label="Correo" readonly variant="solo-filled" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.telefono" label="Teléfono" readonly variant="solo-filled" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.direccion" label="Dirección" readonly variant="solo-filled" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field :model-value="form.roleName" label="Rol" readonly variant="solo-filled" prepend-inner-icon="mdi-shield-account" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field :model-value="form.idCliente" label="Cliente asociado" readonly variant="solo-filled" prepend-inner-icon="mdi-link-variant" />
            </v-col>
          </v-row>

          <div class="actions">
            <v-btn type="submit" color="success" :loading="loading" size="large">Crear usuario de cliente</v-btn>
            <v-btn variant="text" @click="$router.back()">Cancelar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  <v-snackbar v-model="snackbar" color="success" timeout="3000" location="top right">
    {{ successMessage }}
    <template #actions>
      <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1rem, 2vw, 1.6rem);
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(0, 122, 101, 0.96), rgba(6, 57, 108, 0.94));
  color: white;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.header-card h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.header-card p {
  margin: 0.75rem 0 0;
  max-width: 68ch;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.7;
}

.search-card,
.client-card,
.form-card {
  border-radius: 18px;
}

.section-title {
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(7, 46, 73, 0.7);
  margin-bottom: 0.85rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 700px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>