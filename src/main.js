import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import Antd from 'ant-design-vue'
const app = createApp(App)
app.use(Antd)
app.mount('#app')
