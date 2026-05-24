<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import vista360Service from '@/services/vista360Service'
const route = useRoute()
const router = useRouter()
const clienteId = route.query.clienteId || route.params.clienteId

const form = reactive({
    idCliente: '',
    tipo: 'GENERAL',
    titulo: '',
    descripcion: '',
    estado: 'PENDIENTE',
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
function submit() {
    error.value = ''
    loading.value = true
    vista360Service.createReclamo(form)
        .then(() => router.push({ name: 'vista360-detail', params: { id: form.idCliente } }))
        .catch(err => error.value = err.message || String(err))
        .finally(() => loading.value = false)
}

</script>