<template>
  <div class="top">
    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <div class="select">
          <select v-model="accessoryTemplateName">
            <option value="">アクセサリを選択してください</option>
            <option value="umbrella">開いた傘</option>
            <option value="kimoneze">キモネーゼ</option>
          </select>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <ModelView ref="modelView" class="model" @onTexture="onTexture" :accessoryTemplateName="accessoryTemplateName" :width="512" :height="512" />
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <div>テクスチャ</div>
        <figure class="image">
          <img :src="textureSrc" alt="texture">
        </figure>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <button class="button is-success" @click="clickDownloadTexture">
          <span class="icon is-small">
            <i class="fas fa-camera"></i>
          </span>
          <span>ダウンロード</span>
        </button>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <div class="file is-center">
          <label class="file-label">
            <input class="file-input" type="file" name="resume" @change="clickUploadTexture"/>
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label">アップロード</span>
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <div>サムネイル</div>
        <figure class="image">
          <img :src="thumbnailSrc" alt="texture" >
        </figure>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <button class="button is-success" @click="clickTakeThumbnail" >
          <span class="icon is-small">
            <i class="fas fa-camera"></i>
          </span>
          <span>サムネイル撮影</span>
        </button>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <!-- Creator Kit トークン -->
        <input class="input" type="text" placeholder="Creator Kit トークン" v-model="accessToken" />
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <button class="button is-success" @click="clickUploadAccessory">
          <span class="icon is-small">
            <i class="fas fa-upload"></i>
          </span>
          <span>clusterにアップロード</span>
        </button>
      </div>
    </div>    

  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import localStorage from 'localStorage';
import ModelView from './modules/ModelView.vue';
import CreatorKitItemApi from './modules/CreatorKitItemApi';

interface TypeModelView {
  // Define the properties and methods of a ModelView instance here
  takeThumbnail: (callback: (dataUrl: string) => void) => void;
  replaceTexture: (raw: ArrayBuffer, callback: ()=>void) => void;
  glb: () => File;
}

export default defineComponent({
  name: 'TopComponent',
  components: {
    ModelView,
  },
  setup(props, { emit }) {
    const textureSrc = ref("");
    textureSrc.value = require('@/assets/512x512.png');

    const accessoryTemplateName = ref("");
    const modelView = ref<TypeModelView | null>(null);
    const thumbnailSrc = ref("");
    thumbnailSrc.value = require("@/assets/512x512.png");

    const accessToken = ref("");
    accessToken.value = localStorage.getItem('accessToken') ?? ""

    const onTexture = (dataUrl: string) => {
      console.log("onTexture", dataUrl);
      textureSrc.value = dataUrl;
    };

    // 撮影したサムネイル画像を受け取り表示する
    const clickTakeThumbnail = (event: any) => {
      if (modelView.value == null) return;
      modelView.value.takeThumbnail((dataUrl: string) => {
        // console.log(`dataUrl ${dataUrl}`);
        thumbnailSrc.value = dataUrl;
      });
    };

    const clickDownloadTexture = (event: any) => {
      console.log("clickDownloadTexture");
      // textureSrc をダウンロードする
      const a = document.createElement("a");
      a.href = textureSrc.value;
      a.download = "texture.png";
      a.click();
    };

    const clickUploadTexture = (event: any) => {
      console.log("clickUploadTexture");
      // アップロードされたファイルを取得
      const file = event.target.files[0];

      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        if (modelView.value == null) return;
        modelView.value.replaceTexture(event.target.result, () => {
          console.log("replaceTexture success");
        });
      };
      fileReader.readAsArrayBuffer(file);
    };

    const clickUploadAccessory = (event: any) => {
      console.log("clickUploadAccessory");
      // アクセサリをアップロードする
      if (modelView.value == null) return;
      if (accessToken.value == "") return;
      localStorage.setItem('accessToken', accessToken.value);

      const glb = new File([modelView.value.glb()], "item_template.glb", { type: "model/gltf-binary" });
      const icon = new File([thumbnailSrc.value], "thumbnail.png", { type: "image/png" });

      CreatorKitItemApi.uploadAccessory(accessToken.value, glb, icon)
        .then((response) => {
          console.log("uploadAccessory success", response);
        })
        .catch((error) => {
          console.error("uploadAccessory error", error);
        });
    };

    return {
      accessoryTemplateName,
      textureSrc,
      thumbnailSrc,
      modelView,
      accessToken,
      clickTakeThumbnail,
      onTexture,
      clickDownloadTexture,
      clickUploadTexture,
      clickUploadAccessory
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.model, .image {
  margin: 0 auto;
  width: 512px;
  height: 512px;

  background-color: lightblue;
}

.file-label, .image {
  margin: 0 auto;
}

</style>
