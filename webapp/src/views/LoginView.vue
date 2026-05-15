<template>
  <div class="login section">
    <div class="container has-text-centered">
      <h1 class="title">ログイン</h1>
      <button class="button is-large is-info" @click="login">Googleでログイン</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const login = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        router.push('/dashboard');
      } catch (error) {
        console.error("Login failed", error);
      }
    };
    return { login };
  }
});
</script>
