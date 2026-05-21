<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = 'http://localhost:8080/api/auth/login'
const SESSION_KEY = 'bank-auth-session'

const router = useRouter()

const credentials = reactive({
    username: '',
    password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const valuePropositions = [
    {
        title: 'Core interno',
        text: 'Una experiencia para personal autorizado, enfocada en operación, seguridad y control.',
    },
    {
        title: 'Acceso seguro',
        text: 'Autenticación contra API, sesión persistente y redirección automática al panel operativo.',
    },
]

async function handleLogin() {
    error.value = ''
    loading.value = true

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        const payload = await response.json().catch(() => ({}))

        if (!response.ok) {
            throw new Error(payload?.message || 'No fue posible iniciar sesión')
        }

        const token = payload.token || payload.accessToken || payload.jwt || payload.access_token || ''

        if (!token) {
            throw new Error('La API no devolvió un token de acceso válido')
        }

        const session = {
            token,
            roleName: payload.roleName,
            nombres: payload.nombres,
            apellidos: payload.apellidos,
            username: credentials.username,
        }

        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        router.replace({ name: 'dashboard' })
    } catch (err) {
        error.value = err?.message || 'No fue posible iniciar sesión'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <section class="hero-panel">
            <div class="hero-panel__tag">CORE INTERNO</div>
            <h1>Acceso de personal para operación bancaria</h1>
            <p>
                Este acceso está reservado para empleados autorizados. Aquí se administran
                operaciones internas, validaciones y tareas críticas del banco.
            </p>

            <div class="hero-grid">
                <v-card v-for="item in valuePropositions" :key="item.title" class="hero-metric" variant="tonal"
                    color="primary">
                    <v-card-title>{{ item.title }}</v-card-title>
                    <v-card-text>{{ item.text }}</v-card-text>
                </v-card>
            </div>
        </section>

        <section class="login-panel">
            <v-card class="login-card" rounded="xl" elevation="14">
                <div class="login-card__header">
                    <div>
                        <div class="eyebrow">Acceso interno</div>
                        <h2>Inicia sesión</h2>
                        <p>Ingresa tus credenciales de empleado para continuar.</p>
                    </div>

                    <v-chip color="primary" variant="flat" size="small" prepend-icon="mdi-shield-check">
                        Personal autorizado
                    </v-chip>
                </div>

                <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                    {{ error }}
                </v-alert>

                <v-form class="login-form" @submit.prevent="handleLogin">
                    <v-text-field v-model="credentials.username" label="Usuario" placeholder="empleado001"
                        prepend-inner-icon="mdi-account-outline" variant="outlined" density="comfortable"
                        autocomplete="username" :disabled="loading" required />

                    <v-text-field v-model="credentials.password" :type="showPassword ? 'text' : 'password'"
                        label="Contraseña" placeholder="••••••••" prepend-inner-icon="mdi-lock-outline"
                        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" variant="outlined"
                        density="comfortable" autocomplete="current-password" :disabled="loading"
                        @click:append-inner="showPassword = !showPassword" required />

                    <div class="login-actions">
                        <span class="login-help">Core de empleados conectado a la API local.</span>

                        <v-btn type="submit" color="primary" size="large" block :loading="loading"
                            prepend-icon="mdi-login">
                            Entrar al core
                        </v-btn>
                    </div>
                </v-form>
            </v-card>
        </section>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(360px, 520px);
    background:
        radial-gradient(circle at 10% 15%, rgba(4, 99, 124, 0.22), transparent 26%),
        radial-gradient(circle at 92% 10%, rgba(0, 163, 136, 0.16), transparent 20%),
        linear-gradient(145deg, #e8f0f5 0%, #d7e4ee 100%);
}

.hero-panel,
.login-panel {
    display: flex;
    align-items: center;
}

.hero-panel {
    padding: clamp(2rem, 5vw, 5rem);
    color: #072e49;
}

.hero-panel__tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 0.9rem;
    border-radius: 999px;
    background: rgba(7, 46, 73, 0.12);
    color: #072e49;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    margin-bottom: 1.25rem;
}

.hero-panel h1 {
    margin: 0;
    max-width: 12ch;
    font-size: clamp(2.5rem, 4vw, 4.7rem);
    line-height: 0.98;
}

.hero-panel p {
    max-width: 38rem;
    margin: 1rem 0 0;
    color: rgba(7, 46, 73, 0.78);
    font-size: 1.06rem;
    line-height: 1.7;
}

.hero-grid {
    display: grid;
    gap: 1rem;
    margin-top: 0.5rem;
}

.hero-metric {
    min-height: 100%;
}

.hero-metric :deep(.v-card-title) {
    font-size: 1rem;
    font-weight: 700;
    padding-bottom: 0.35rem;
}

.hero-metric :deep(.v-card-text) {
    color: rgba(7, 46, 73, 0.78);
}

.login-panel {
    justify-content: center;
    padding: clamp(1rem, 2.5vw, 2rem);
}

.login-card {
    width: min(100%, 480px);
    padding: 1.5rem;
    border: 1px solid rgba(7, 46, 73, 0.08);
    backdrop-filter: blur(16px);
}

.login-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.eyebrow {
    color: #007a65;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.login-card h2 {
    margin: 0;
    color: #072e49;
    font-size: 1.9rem;
}

.login-card p {
    margin: 0.35rem 0 0;
    color: rgba(7, 46, 73, 0.72);
}

.login-form {
    display: grid;
    gap: 0.2rem;
}

.login-actions {
    display: grid;
    gap: 0.9rem;
    margin-top: 0.35rem;
}

.login-help {
    color: rgba(7, 46, 73, 0.64);
    font-size: 0.92rem;
}

@media (max-width: 1100px) {
    .login-page {
        grid-template-columns: 1fr;
    }

    .hero-panel {
        padding-bottom: 0;
    }

    .hero-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .hero-panel h1 {
        max-width: none;
    }

    .login-card {
        padding: 1rem;
    }

    .login-card__header {
        flex-direction: column;
    }
}
</style>