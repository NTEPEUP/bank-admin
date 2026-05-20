<template>
    <v-main class="dashboard-main">
        <div class="dashboard-shell">
            <section class="hero-card">
                <div>
                    <div class="hero-card__eyebrow">Panel interno</div>
                    <h1>Bienvenido, {{ fullName }}</h1>
                    <p>
                        Aquí se concentra la operación diaria del empleado: autorizaciones, cierres,
                        seguimiento operativo y control de seguridad.
                    </p>
                </div>

                <v-card class="hero-summary" variant="flat">
                    <div class="hero-summary__label">Perfil interno autenticado</div>
                    <div class="hero-summary__value">{{ roleName }}</div>
                    <div class="hero-summary__sub">Token y datos de sesión almacenados localmente.</div>
                </v-card>
            </section>

            <v-row class="metric-grid" dense>
                <v-col v-for="metric in metrics" :key="metric.label" cols="12" md="4">
                    <v-card class="metric-card" rounded="xl" elevation="4">
                        <div class="metric-card__icon">
                            <v-icon :icon="metric.icon" size="22" />
                        </div>
                        <div class="metric-card__label">{{ metric.label }}</div>
                        <div class="metric-card__value">{{ metric.value }}</div>
                        <div class="metric-card__detail">{{ metric.detail }}</div>
                    </v-card>
                </v-col>
            </v-row>

            <v-row dense>
                <v-col cols="12" lg="8">
                    <v-card class="panel-card" rounded="xl" elevation="4">
                        <v-card-title class="panel-card__title">Actividad operativa reciente</v-card-title>
                        <v-divider />
                        <v-list lines="two">
                            <v-list-item v-for="item in activity" :key="item.time" :title="item.title"
                                :subtitle="item.detail">
                                <template #prepend>
                                    <v-avatar color="primary" variant="tonal" size="40">{{ item.time }}</v-avatar>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </v-col>

                <v-col cols="12" lg="4">
                    <v-card class="panel-card panel-card--accent" rounded="xl" elevation="4">
                        <v-card-title class="panel-card__title">Acciones rápidas</v-card-title>
                        <v-divider />
                        <v-card-text class="quick-actions">
                            <v-btn color="primary" block prepend-icon="mdi-swap-horizontal">Nueva autorización</v-btn>
                            <v-btn variant="tonal" color="primary" block prepend-icon="mdi-eye-outline">Consultar
                                operaciones</v-btn>
                            <v-btn variant="tonal" color="primary" block
                                prepend-icon="mdi-shield-lock-outline">Seguridad
                                interna</v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </v-main>
</template>

<script setup>
import { computed } from 'vue'

const SESSION_KEY = 'bank-auth-session'

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

const session = readSession() || {}

const fullName = computed(() => `${session.nombres || ''} ${session.apellidos || ''}`.trim() || 'Empleado')
const roleName = computed(() => session.roleName || 'EMPLEADO')

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
</script>

<style scoped>
/* styles reused from DashboardView for the home content */
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

.hero-summary {
    padding: 1.15rem;
    background: linear-gradient(135deg, rgba(6, 57, 108, 0.96), rgba(0, 122, 101, 0.96));
    color: white;
    border-radius: 22px;
}

.metric-card {
    padding: 1.2rem;
    border: 1px solid rgba(7, 46, 73, 0.08);
}

.panel-card {
    overflow: hidden;
    border: 1px solid rgba(7, 46, 73, 0.08);
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
