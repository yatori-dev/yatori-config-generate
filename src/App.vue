<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3.0 + Vite" /> -->
  <YamlConfigEditor></YamlConfigEditor>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import YamlConfigEditor from './components/YamlConfigEditor.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    YamlConfigEditor
  }
}
</script>
