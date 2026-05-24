import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { clearSession, hasSession, readSession } from '../services/api.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
      redirect: { name: 'dashboard-home' },
      children: [
        { path: '', name: 'dashboard-home', component: () => import('../views/DashboardHome.vue') },
        {
          path: 'clientes',
          name: 'clients',
          component: () => import('../views/clients/ClientsList.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'clientes/create',
          name: 'client-new',
          component: () => import('../views/clients/ClientForm.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'clientes/:id/edit',
          name: 'client-edit',
          component: () => import('../views/clients/ClientForm.vue'),
          meta: { requiresAuth: true },
          props: true,
        },
        {
          path: 'vista360',
          name: 'vista360',
          component: () => import('../views/vista360/Vista360Search.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'vista360/:id',
          name: 'vista360-detail',
          component: () => import('../views/vista360/Vista360Detail.vue'),
          meta: { requiresAuth: true },
          props: true,
        },
        {
          path: 'cuentas/create',
          name: 'cuenta-create',
          component: () => import('../views/products/CuentaCreate.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'tarjetas/create',
          name: 'tarjeta-create',
          component: () => import('../views/products/TarjetaCreate.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'prestamos/create',
          name: 'prestamo-create',
          component: () => import('../views/products/PrestamoCreate.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'banking-user',
          name: 'banking-user',
          redirect: { name: 'users-hub' },
          meta: { requiresAuth: true },
        },
        {
          path: 'usuarios',
          name: 'users-hub',
          component: () => import('../views/usuarios/UsuariosHub.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'usuarios/listado',
          name: 'usuarios-listado',
          component: () => import('../views/usuarios/UsuariosListView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'usuarios/internos',
          name: 'usuarios-internos',
          component: () => import('../views/usuarios/UsuariosInternosView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'usuarios/banca-en-linea',
          name: 'usuarios-banca-en-linea',
          component: () => import('../views/usuarios/UsuariosBancaEnLineaView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'reclamos/create',
          name: 'reclamo-create',
          component: () => import('../views/products/ReclamoCreate.vue'),
          meta: { requiresAuth: true },
        }
      ],
    },
  ],
})

router.beforeEach((to) => {
  const session = readSession()
  const roleName = session?.roleName?.toString().trim().toUpperCase() || ''

  if (roleName === 'CLIENTE') {
    clearSession()
    return { name: 'login' }
  }

  if (to.meta.requiresAuth && !hasSession()) {
    return { name: 'login' }
  }

  if (to.name === 'login' && hasSession()) {
    return { name: 'dashboard-home' }
  }

  return true
})

export default router
