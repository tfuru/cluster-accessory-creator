<template>
  <div class="top">
    
    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <h1>[非公式] cluster アクセサリークリエイター </h1>
        <div>cluster上でアバターに装着できるアクセサリーアイテムを Webブラウザから作成できるツールです</div>
      </div>
    </div>

    <div class="columns container">
      <div class="column is-half">
        <div class="model">
          <div class="select">
            <select v-model="accessoryTemplateName">
              <option value="">作りたいアクセサリを選択してください</option>
              <option value="umbrella">開いた傘</option>
              <option value="kimoneze">キモネーゼ</option>
            </select>
            <ModelView ref="modelView" class="modelview" @onTexture="onTexture" :accessoryTemplateName="accessoryTemplateName" :width="512" :height="512" />
          </div>
        </div>
      </div>

      <div class="column">
        <div class="texture">
          <div>テクスチャ</div>
          <figure class="image">
            <img :src="textureSrc" alt="texture">
          </figure>

          <div class="buttons">
            <button class="button is-success" @click="clickDownloadTexture">
              <span class="icon is-small">
                <i class="fas fa-camera"></i>
              </span>
              <span>ダウンロード</span>
            </button>
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
        <div class="thumbnail">
          <div>サムネイル</div>
          <figure class="image">
            <img :src="thumbnailSrc" alt="texture" >
          </figure>
          <div class="buttons">
            <button class="button is-success" @click="clickTakeThumbnail" >
              <span class="icon is-small">
                <i class="fas fa-camera"></i>
              </span>
              <span>サムネイル撮影</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <!-- Creator Kit トークン -->
        <input class="input" type="text" placeholder="Creator Kit トークン" v-model="accessToken" />
        <div>※&nbsp;<a href="https://cluster.mu/account/tokens">Creator Kit トークン</a>はリンク先で取得する</div>
        <div>アップロード処理の為に一時的に作者サーバに送信されますが、<br>サーバに保存などはしていない為、比較的安全です</div>
      </div>
    </div>

    <!--
    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <input class="input" type="text" placeholder="アクセサリー名" v-model="accessoryName" />
      </div>
    </div>
    -->

    <div class="columns">
      <div class="column is-half is-offset-one-quarter">
        <button class="button is-info" @click="clickUploadAccessory">
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

    const accessoryName = ref("");
    accessoryName.value = localStorage.getItem('accessoryName') ?? ""

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

    const convertDataUrl = async (dataUrl: string) => { 
      return await (await fetch(dataUrl)).blob()
    }

    const clickUploadAccessory = async (event: any) => {
      console.log("clickUploadAccessory");
      // アクセサリをアップロードする
      if (modelView.value == null) return;
      if (accessToken.value == "") return;
      localStorage.setItem('accessToken', accessToken.value);
      localStorage.setItem('accessoryName', accessoryName.value);
      
      const thumbnailBlob = await convertDataUrl(thumbnailSrc.value);

      const glb = await modelView.value.glb();
      const icon = new File([thumbnailBlob], "icon.png", { type: "image/png" });

      await CreatorKitItemApi.uploadAccessory(accessToken.value, accessoryName.value,  glb, icon, (status) =>{
        console.log("uploadAccessory", status);
        // TODO アップロード状況 を 画面更新
        switch(status) {
          case "COMPLETED":
            alert("アップロードが完了しました");
            break;
          case "TIMEOUT":
          case "ERROR":
            alert(`アップロードに失敗しました ステータス: ${status}`);
            break;
          default:
            break;
        }
      });
    };

    return {
      accessoryTemplateName,
      textureSrc,
      thumbnailSrc,
      modelView,
      accessToken,
      accessoryName,
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

.container > .column {
  border: 1px solid #ccc;
  text-align: left;

  .buttons {
    margin-top: 10px;
  }
}

.file-label, .image {
  margin: 0 auto;
}

.modelview {
  width: 512px;
  height: 512px;
  background-color: lightblue;
}

.texture > .image, .thumbnail > .image {
  margin: 0;
  width: 256px;
  height: 256px;
}

@media screen and (max-width: 768px) {
  .container > .column {
    border: none;
  }

  .column > .model, .column > .texture {
    display: block;
    margin: auto 0;
  }
  
  .column > .model {
    width: 560px;
    height: 560px;
  }

  .texture > .image, .thumbnail > .image {
    margin: 0;
    width: 256px;
    height: 256px;
  }
  
}
</style>
