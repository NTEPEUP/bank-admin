<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const SESSION_KEY = 'bank-auth-session'

const router = useRouter()
const session = ref(null)

const navItems = [
    { title: 'Resumen', icon: 'mdi-view-dashboard-outline' },
    { title: 'Operaciones', icon: 'mdi-cog-outline' },
    { title: 'Autorizaciones', icon: 'mdi-shield-check-outline' },
    { title: 'Clientes', icon: 'mdi-account-multiple', to: { name: 'clients' } },
    { title: 'Vista 360', icon: 'mdi-eye', to: { name: 'vista360' } },
    { title: 'Cierres', icon: 'mdi-calendar-check-outline' },
    { title: 'Seguridad', icon: 'mdi-shield-lock-outline' },
]

const metrics = [
    { label: 'Operaciones hoy', value: '128', detail: '32 aprobadas / 96 en consulta', icon: 'mdi-chart-line' },
    { label: 'Autorizaciones', value: '21', detail: 'Requieren revisión', icon: 'mdi-shield-check-outline' },
    { label: 'Alertas activas', value: '3', detail: 'Sin incidencias críticas', icon: 'mdi-bell-outline' },
]

const activity = [
    { time: '10:42', title: 'Autorización de transferencia', detail: 'Q 12,500.00 validada por cajero supervisor' },
    { time: '09:15', title: 'Consulta operativa', detail: 'Cuenta ahorro principal' },
    { time: '08:23', title: 'Cierre de lote', detail: 'Proceso de conciliación completado' },
    { time: '07:58', title: 'Bloqueo preventivo', detail: 'Usuario temporalmente restringido' },
]

function readSession() {
    const rawSession = localStorage.getItem(SESSION_KEY)

    if (!rawSession) {
        return null
    }

    try {
        return JSON.parse(rawSession)
    } catch {
        return null
    }
}

const fullName = computed(() => {
    if (!session.value) {
        return 'Empleado'
    }

    return `${session.value.nombres || ''} ${session.value.apellidos || ''}`.trim() || 'Empleado'
})

const roleName = computed(() => session.value?.roleName || 'EMPLEADO')
const initials = computed(() => {
    if (!session.value) {
        return 'EM'
    }

    const first = session.value.nombres?.[0] || 'C'
    const last = session.value.apellidos?.[0] || 'L'

    return `${first}${last}`.toUpperCase()
})

function logout() {
    localStorage.removeItem(SESSION_KEY)
    router.replace({ name: 'login' })
}

onMounted(() => {
    session.value = readSession()
})
</script>

<template>
    <v-app-bar class="dashboard-topbar" elevation="0">
        <template #prepend>
            <div class="topbar-brand">
                <div class="topbar-brand__mark">BB</div>
                <div>
                    <div class="topbar-brand__label">Core bancario</div>
                    <div class="topbar-brand__sub">Panel interno de empleados</div>
                </div>
            </div>
        </template>

        <v-spacer />

        <v-chip class="mr-3" color="success" variant="tonal" prepend-icon="mdi-shield-check">
            Sesión activa
        </v-chip>

        <v-btn variant="text" prepend-icon="mdi-logout" @click="logout">Salir</v-btn>
    </v-app-bar>

    <v-navigation-drawer class="dashboard-drawer" permanent width="286">
        <div class="drawer-brand">
            <div class="drawer-brand__icon">{{ initials }}</div>
            <div>
                <div class="drawer-brand__name">{{ fullName }}</div>
                <div class="drawer-brand__meta">{{ roleName }}</div>
            </div>
        </div>

        <v-list nav density="comfortable" class="mt-4">
            <v-list-item v-for="item in navItems" :key="item.title" :prepend-icon="item.icon" :title="item.title"
                :to="item.to" clickable />
        </v-list>

        <v-card class="drawer-note" variant="tonal" color="primary">
            <v-card-title class="text-subtitle-1 font-weight-bold">Acceso interno</v-card-title>
            <v-card-text>
                Este espacio representa el core de empleados. El acceso de clientes vive en otro flujo con
                otro diseño y otras reglas.
            </v-card-text>
        </v-card>
    </v-navigation-drawer>

    <v-main class="dashboard-main">
        <router-view />
    </v-main>
</template>

<style scoped>
.dashboard-topbar {
    padding-inline: 1rem;
    background: rgba(245, 249, 252, 0.92);
    backdrop-filter: blur(16px);
}

.topbar-brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.topbar-brand__mark,
.drawer-brand__icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: linear-gradient(135deg, #06396c 0%, #007a65 100%);
    color: white;
    font-weight: 800;
    letter-spacing: 0.05em;
}

.topbar-brand__label,
.drawer-brand__name {
    color: #072e49;
    font-weight: 800;
}

.topbar-brand__sub,
.drawer-brand__meta {
    color: rgba(7, 46, 73, 0.64);
    font-size: 0.92rem;
}

.dashboard-drawer {
    background: linear-gradient(180deg, #f7fbfd 0%, #eff5f9 100%);
    border-right: 1px solid rgba(7, 46, 73, 0.08);
}

.drawer-brand {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1.25rem 1rem 0;
}

.drawer-note {
    margin: 1rem;
}

.dashboard-main {
    background:
        radial-gradient(circle at top right, rgba(0, 122, 101, 0.09), transparent 18%),
        linear-gradient(180deg, #eef4f8 0%, #e6edf3 100%);
}

.dashboard-shell {
    display: grid;
    gap: 1.2rem;
    padding: clamp(1rem, 2vw, 1.6rem);
}

.hero-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
    gap: 1rem;
    align-items: center;
}

.hero-card__eyebrow {
    color: #007a65;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 0.65rem;
}

.hero-card h1 {
    margin: 0;
    color: #072e49;
    font-size: clamp(2rem, 3vw, 3.25rem);
    line-height: 1.05;
}

.hero-card p {
    margin: 0.9rem 0 0;
    max-width: 60ch;
    color: rgba(7, 46, 73, 0.72);
    line-height: 1.7;
}

.hero-summary {
    padding: 1.15rem;
    background: linear-gradient(135deg, rgba(6, 57, 108, 0.96), rgba(0, 122, 101, 0.96));
    color: white;
    border-radius: 22px;
}

.hero-summary__label {
    opacity: 0.8;
    font-size: 0.82rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.hero-summary__value {
    margin-top: 0.6rem;
    font-size: 1.55rem;
    font-weight: 800;
}

.hero-summary__sub {
    margin-top: 0.5rem;
    opacity: 0.82;
    line-height: 1.6;
}

.metric-card {
    padding: 1.2rem;
    border: 1px solid rgba(7, 46, 73, 0.08);
}

.metric-card__icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(6, 57, 108, 0.08);
    color: #06396c;
    margin-bottom: 0.9rem;
}

.metric-card__label {
    color: rgba(7, 46, 73, 0.68);
    font-size: 0.93rem;
}

.metric-card__value {
    margin-top: 0.3rem;
    color: #072e49;
    font-size: 1.75rem;
    font-weight: 800;
}

.metric-card__detail {
    margin-top: 0.3rem;
    color: rgba(7, 46, 73, 0.7);
}

.panel-card {
    overflow: hidden;
    border: 1px solid rgba(7, 46, 73, 0.08);
}

.panel-card__title {
    color: #072e49;
    font-weight: 800;
}

.quick-actions {
    display: grid;
    gap: 0.8rem;
}

@media (max-width: 1260px) {
    .hero-card {
        grid-template-columns: 1fr;
    }
}
</style>