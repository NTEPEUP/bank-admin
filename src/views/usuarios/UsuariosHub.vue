<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const cards = [
  {
    title: 'Listado y control',
    subtitle: 'Consulta usuarios por tipo, busca por username y activa o desactiva con un clic.',
    icon: 'mdi-format-list-bulleted-square',
    routeName: 'usuarios-listado',
    color: 'indigo',
    accent: 'Tabs por rol y control de estado',
  },
  {
    title: 'Usuarios internos',
    subtitle: 'Creación manual para empleados, cajeros, supervisores y otros perfiles internos.',
    icon: 'mdi-account-hard-hat',
    routeName: 'usuarios-internos',
    color: 'primary',
    accent: 'Profesional y directo',
  },
  {
    title: 'Banca en línea',
    subtitle: 'Busca al cliente por DPI y precarga su información para crear el usuario sin reingresar datos.',
    icon: 'mdi-bank-outline',
    routeName: 'usuarios-banca-en-linea',
    color: 'success',
    accent: 'Flujo asistido para clientes',
  },
]

function go(routeName) {
  router.push({ name: routeName })
}
</script>

<template>
  <div class="users-shell">
    <v-card class="hero-card" elevation="4">
      <div class="hero-copy">
        <div class="eyebrow">Módulo de usuarios</div>
        <h1>Gestión de usuarios profesionales</h1>
        <p>
          Centraliza la creación de usuarios internos y de banca en línea con una experiencia clara,
          segura y separada por flujo.
        </p>
      </div>

      <v-card class="hero-panel" variant="tonal" color="primary">
        <div class="hero-panel__title">Reglas del módulo</div>
        <ul class="hero-list">
        </ul>
      </v-card>
    </v-card>

    <v-row class="mt-4">
      <v-col v-for="card in cards" :key="card.title" cols="12" md="6">
        <v-card class="module-card" elevation="2" @click="go(card.routeName)">
          <v-card-text>
            <div class="module-card__top">
              <v-avatar :color="card.color" variant="tonal" size="52">
                <v-icon :icon="card.icon" size="28" />
              </v-avatar>
              <v-chip size="small" variant="tonal" :color="card.color">{{ card.accent }}</v-chip>
            </div>

            <h2>{{ card.title }}</h2>
            <p>{{ card.subtitle }}</p>

            <div class="module-card__actions">
              <v-btn :color="card.color" variant="flat" @click.stop="go(card.routeName)">
                Abrir módulo
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.users-shell {
  display: grid;
  gap: 1.25rem;
  padding: clamp(1rem, 2vw, 1.6rem);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(6, 57, 108, 0.96), rgba(0, 122, 101, 0.94));
  color: white;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.7rem);
  line-height: 1.05;
}

.hero-copy p {
  margin: 0.85rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.7;
}

.hero-panel {
  border-radius: 18px;
  padding: 1rem;
}

.hero-panel__title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.hero-list {
  margin: 0;
  padding-left: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
}

.module-card {
  height: 100%;
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  background: rgba(255, 255, 255, 0.92);
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(7, 46, 73, 0.12);
}

.module-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.module-card h2 {
  margin: 0;
  font-size: 1.25rem;
}

.module-card p {
  margin: 0.6rem 0 0;
  color: rgba(7, 46, 73, 0.72);
  line-height: 1.7;
}

.module-card__actions {
  margin-top: 1.25rem;
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }
}
</style>