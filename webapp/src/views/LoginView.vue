<template>
  <div class="login-page">
    <div class="container">
      <div class="columns is-centered is-vcentered" style="min-height: 80vh;">
        <div class="column is-5-desktop is-8-tablet">
          <div class="card login-card p-6">
            <div class="has-text-centered mb-6">
              <span class="icon is-large has-text-info mb-4">
                <i class="fa fa-cube fa-4x"></i>
              </span>
              <h1 class="title is-3">Accessory Creator</h1>
              <p class="subtitle is-6 has-text-grey">clusterアクセサリーをWebで手軽に作成</p>
            </div>
            
            <div class="login-actions">
              <button class="button is-info is-large is-fullwidth is-rounded shadow-blue" @click="login">
                <span class="icon">
                  <i class="fa fa-google"></i>
                </span>
                <span>Googleでログイン</span>
              </button>
            </div>

            <div class="mt-6 has-text-centered">
              <p class="is-size-7 has-text-grey-light">
                ログインすることで利用規約に同意したことになります
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          router.push('/dashboard');
        }
      });
    });

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

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
}

.login-card {
  border-radius: 24px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.shadow-blue {
  box-shadow: 0 4px 15px rgba(62, 142, 208, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.shadow-blue:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(62, 142, 208, 0.4);
}
</style>
