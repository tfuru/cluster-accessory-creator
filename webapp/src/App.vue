<template>
  <div id="app">
    <nav class="navbar is-white border-bottom mb-5" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <router-link class="navbar-item has-text-weight-bold is-size-5" to="/">
            Accessory Creator
          </router-link>
        </div>

        <div class="navbar-menu is-active">
          <div class="navbar-end">
            <div class="navbar-item">
              <div class="field is-grouped">
                <p class="control" v-if="user">
                  <router-link class="button is-ghost" to="/dashboard">ダッシュボード</router-link>
                </p>
                <p class="control" v-if="user">
                  <router-link class="button is-ghost" to="/settings">設定</router-link>
                </p>
                <p class="control">
                  <router-link class="button is-ghost" to="/about">使い方</router-link>
                </p>
                <p class="control">
                  <a class="button is-ghost" href="https://forms.gle/pz1HamLdBKB5RrHq7" target="_blank">アイテム応募</a>
                </p>
                <p class="control" v-if="user">
                  <button class="button is-light is-rounded" @click="logout">ログアウト</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <router-view/>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'App',
  setup() {
    const user = ref<User | null>(null);
    const router = useRouter();

    onMounted(() => {
      onAuthStateChanged(auth, (u) => {
        user.value = u;
      });
    });

    const logout = async () => {
      await signOut(auth);
      router.push('/login');
    };

    return { user, logout };
  },
});
</script>

<style>
@import "../node_modules/font-awesome/css/font-awesome.min.css";
@import "../node_modules/bulma/css/bulma.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #fafafa;
}

.border-bottom {
  border-bottom: 1px solid #eee !important;
}

.navbar-item {
  font-weight: 500;
}
</style>
