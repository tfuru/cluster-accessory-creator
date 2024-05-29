<template>
  <div class="home">
    <Top />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Top from '@/components/Top.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    Top,
  },
});
</script>
