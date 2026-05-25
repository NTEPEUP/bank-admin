<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRoles, createUser } from '@/services/userService'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
  roleName: '',
})

const roles = ref([])
const loading = ref(false)
const loadingRoles = ref(false)
const error = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')

const roleItems = computed(() => roles.value.map((role) => ({
  title: role.label || role.nombre || role.name || role.roleName || String(role),
  value: role.value || role.nombre || role.name || role.roleName || role,
})))

async function loadRoles() {
  loadingRoles.value = true
  try {
    const data = await fetchRoles()
    roles.value = Array.isArray(data) ? data : data?.data || []
    if (!form.roleName && roleItems.value.length) {
      form.roleName = roleItems.value[0].value
    }
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loadingRoles.value = false
  }
}

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await createUser({ ...form })
    snackbarMessage.value = 'Usuario interno creado exitosamente'
    snackbar.value = true
    form.username = ''
    form.password = ''
    form.nombres = ''
    form.apellidos = ''
    form.correo = ''
    form.telefono = ''
    form.direccion = ''
    form.roleName = roleItems.value[0]?.value || ''
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadRoles)
</script>

<template>
  <div class="page-shell">
    <v-card class="header-card" elevation="4">
      <div>
        <div class="eyebrow">Usuarios internos</div>
        <h1>Crear usuario manualmente</h1>
      </div>

      <v-chip color="primary" variant="tonal" label>
        <v-icon start size="small">mdi-account-hard-hat</v-icon>
        Sin `idCliente`
      </v-chip>
    </v-card>

    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <v-card class="form-card" elevation="3">
      <v-card-text>
        <v-form @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.username" label="Usuario" prepend-inner-icon="mdi-account" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.password" label="Contraseña" type="password" prepend-inner-icon="mdi-lock"
                required />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.nombres" label="Nombres" prepend-inner-icon="mdi-account" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.apellidos" label="Apellidos" prepend-inner-icon="mdi-account" required />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="form.correo" label="Correo" type="email" prepend-inner-icon="mdi-email" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.telefono" label="Teléfono" prepend-inner-icon="mdi-phone" />
            </v-col>

            <v-col cols="12">
              <v-text-field v-model="form.direccion" label="Dirección" prepend-inner-icon="mdi-map-marker" />
            </v-col>

            <v-col cols="12" md="6">
              <v-select v-model="form.roleName" :items="roleItems" item-title="title" item-value="value"
                :loading="loadingRoles" label="Rol" prepend-inner-icon="mdi-shield-account"
                hint="Selecciona un rol interno" persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field value="No aplica" label="Cliente asociado" readonly variant="solo-filled"
                prepend-inner-icon="mdi-link-variant" />
            </v-col>
          </v-row>

          <div class="actions">
            <v-btn type="submit" color="primary" :loading="loading" size="large">Crear usuario</v-btn>
            <v-btn variant="text" @click="$router.back()">Cancelar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>

  <v-snackbar v-model="snackbar" color="success" timeout="3000" location="top right">
    {{ snackbarMessage }}
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
  background: linear-gradient(135deg, rgba(6, 57, 108, 0.96), rgba(0, 122, 101, 0.94));
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

.form-card {
  border-radius: 18px;
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