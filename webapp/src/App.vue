<template>
  <div class="content">

    <div class="columns">
      <div class="column is-12-mobile is-half-desktop is-offset-one-quarter-desktop">
        <nav>
          <router-link to="/">ホーム</router-link>
          | <router-link to="/about">使い方</router-link>
          | <a href="https://forms.gle/pz1HamLdBKB5RrHq7">アイテム応募</a>
        </nav>        
      </div>
    </div>

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
