<template>
  <div id="app">
    <nav class="navbar is-light" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <router-link class="navbar-item" to="/">
            <strong class="is-size-5">Cluster Accessory Creator</strong>
          </router-link>
        </div>

        <div class="navbar-menu is-active">
          <div class="navbar-start" v-if="user">
            <router-link class="navbar-item" to="/dashboard">ダッシュボード</router-link>
            <router-link class="navbar-item" to="/settings">設定</router-link>
          </div>

          <div class="navbar-end">
            <div class="navbar-item">
              <div class="field is-grouped">
                <p class="control">
                  <router-link class="button is-ghost" to="/about">使い方</router-link>
                </p>
                <p class="control">
                  <a class="button is-ghost" href="https://forms.gle/pz1HamLdBKB5RrHq7">アイテム応募</a>
                </p>
                <p class="control" v-if="user">
                  <button class="button is-light" @click="logout">ログアウト</button>
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
  text-align: center;
  /* color: #2c3e50; */
}

nav {
  padding: 20px;
  /* background-color: #f0f0f0; */
  a {
    font-size: large;
  }
}

</style>
