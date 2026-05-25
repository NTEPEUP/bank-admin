<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchUsers, updateUserStatus } from '@/services/userService'

const loading = ref(false)
const toggling = ref(false)
const error = ref('')
const snackbar = ref(false)
const snackbarMessage = ref('')

const search = ref('')
const activeTab = ref('clientes')
const users = ref([])

const confirmDialog = ref(false)
const selectedUser = ref(null)
const targetStatus = ref(true)

const tableHeaders = [
  { title: 'Usuario', key: 'username' },
  { title: 'Nombre', key: 'nombres' },
  { title: 'Apellido', key: 'apellidos' },
  { title: 'Correo', key: 'correo' },
  { title: 'Rol', key: 'roleName' },
  { title: 'Estado', key: 'estadoVisual' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

function normalizeUsers(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function getUserId(user) {
  return user?.id ?? user?.idUsuario ?? user?.usuarioId ?? user?.id_user ?? null
}

function isClientRole(user) {
  return String(user?.roleName || '').trim().toUpperCase() === 'CLIENTE'
}

function getIsActive(user) {
  if (typeof user?.activo === 'boolean') return user.activo
  if (typeof user?.enabled === 'boolean') return user.enabled
  const estado = String(user?.estado || '').trim().toUpperCase()
  if (estado === 'ACTIVO') return true
  if (estado === 'INACTIVO') return false
  return true
}

function stateLabel(user) {
  return getIsActive(user) ? 'Activo' : 'Inactivo'
}

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()

  return users.value
    .filter((u) => {
      if (activeTab.value === 'clientes') return isClientRole(u)
      return !isClientRole(u)
    })
    .filter((u) => {
      if (!q) return true
      return String(u?.username || '').toLowerCase().includes(q)
    })
    .map((u) => ({
      ...u,
      estadoVisual: stateLabel(u),
    }))
})

const countClientes = computed(() => users.value.filter(isClientRole).length)
const countInternos = computed(() => users.value.filter((u) => !isClientRole(u)).length)

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetchUsers()
    users.value = normalizeUsers(response)
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
}

function askToggle(user) {
  selectedUser.value = user
  targetStatus.value = !getIsActive(user)
  confirmDialog.value = true
}

async function confirmToggle() {
  if (!selectedUser.value) return

  const userId = getUserId(selectedUser.value)
  if (!userId) {
    error.value = 'No se encontró el ID del usuario para actualizar su estado.'
    confirmDialog.value = false
    return
  }

  toggling.value = true
  error.value = ''

  try {
    await updateUserStatus(userId, targetStatus.value)

    users.value = users.value.map((u) => {
      if (getUserId(u) !== userId) return u
      return {
        ...u,
        activo: targetStatus.value,
        estado: targetStatus.value ? 'ACTIVO' : 'INACTIVO',
      }
    })

    snackbarMessage.value = targetStatus.value
      ? 'Usuario activado exitosamente.'
      : 'Usuario desactivado exitosamente.'
    snackbar.value = true
    confirmDialog.value = false
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    toggling.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="page-shell">
    <v-card class="header-card" elevation="4">
      <div>
        <div class="eyebrow">Gestión operativa</div>
        <h1>Listado de usuarios</h1>

      </div>

      <v-btn color="primary" variant="tonal" :loading="loading" @click="loadUsers">
        <v-icon start>mdi-refresh</v-icon>
        Recargar
      </v-btn>
    </v-card>

    <v-alert v-if="error" type="error" class="mb-2">{{ error }}</v-alert>

    <v-card class="toolbar-card" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field v-model="search" label="Buscar por usuario" prepend-inner-icon="mdi-magnify" clearable />
          </v-col>
          <v-col cols="12" md="4" class="chips-col">
            <v-chip color="success" variant="tonal">Clientes: {{ countClientes }}</v-chip>
            <v-chip color="primary" variant="tonal">Internos: {{ countInternos }}</v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="table-card" elevation="3">
      <v-tabs v-model="activeTab" class="px-3 pt-2">
        <v-tab value="clientes">Clientes</v-tab>
        <v-tab value="internos">Internos</v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text>
        <v-data-table :headers="tableHeaders" :items="filteredUsers" :loading="loading" item-value="id"
          loading-text="Cargando usuarios..." no-data-text="No hay usuarios para los filtros seleccionados">
          <template #item.estadoVisual="{ item }">
            <v-chip :color="getIsActive(item) ? 'success' : 'error'" size="small" variant="tonal">
              {{ stateLabel(item) }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" :color="getIsActive(item) ? 'warning' : 'success'" @click="askToggle(item)">
              {{ getIsActive(item) ? 'Desactivar' : 'Activar' }}
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>

  <v-dialog v-model="confirmDialog" max-width="460">
    <v-card>
      <v-card-title>{{ targetStatus ? 'Activar usuario' : 'Desactivar usuario' }}</v-card-title>
      <v-card-text>
        ¿Seguro que deseas {{ targetStatus ? 'activar' : 'desactivar' }} al usuario
        <strong>{{ selectedUser?.username }}</strong>?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmDialog = false">Cancelar</v-btn>
        <v-btn :color="targetStatus ? 'success' : 'warning'" :loading="toggling" @click="confirmToggle">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" color="success" timeout="2800" location="top right">
    {{ snackbarMessage }}
    <template #actions>
      <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 1rem;
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
  font-size: clamp(1.6rem, 2.8vw, 2.4rem);
}

.header-card p {
  margin: 0.75rem 0 0;
  max-width: 72ch;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.7;
}

.toolbar-card,
.table-card {
  border-radius: 18px;
}

.chips-col {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .chips-col {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>