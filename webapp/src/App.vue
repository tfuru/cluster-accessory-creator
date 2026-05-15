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
            <router-link class="navbar-item" to="/">ホーム</router-link>
            <router-link class="navbar-item" to="/settings">設定</router-link>
            <router-link class="navbar-item" to="/about">使い方</router-link>
            <a class="navbar-item" href="https://forms.gle/pz1HamLdBKB5RrHq7" target="_blank">アイテム応募</a>
          </div>
        </div>
      </div>
    </nav>
    
    <router-view/>
  </div>
</template>

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
