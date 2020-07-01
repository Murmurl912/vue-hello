import Vue from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

export const bus = new Vue()


new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')

