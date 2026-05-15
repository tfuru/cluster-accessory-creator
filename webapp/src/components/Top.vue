<template>
  <div class="top-editor">
    <div class="columns is-gapless mb-0 editor-main">
      <!-- 左側: 3Dプレビュー (固定) -->
      <div class="column is-5-widescreen is-6-desktop is-12-tablet preview-column p-4">
        <div class="sticky-preview">
          <div class="card editor-card is-flex is-flex-direction-column h-100">
            <!-- 構成ヘッダー -->
            <div class="card-content p-4 border-bottom has-background-white-bis">
              <div class="field mb-3">
                <label class="label is-size-7 mb-1">アクセサリー名</label>
                <div class="control has-icons-left">
                  <input class="input is-small is-rounded" type="text" v-model="accessoryName" placeholder="名前を入力">
                  <span class="icon is-small is-left"><i class="fa fa-tag"></i></span>
                </div>
              </div>

              <div class="field mb-0">
                <label class="label is-size-7 mb-1">テンプレート / GLBファイル</label>
                <div class="columns is-mobile is-variable is-1">
                  <div class="column">
                    <div class="select is-fullwidth is-small is-rounded">
                      <select v-model="accessoryTemplateName">
                        <option value="">選択してください</option>
                        <option v-for="item,i in accessoryTemplateList" v-bind:key="i" :value="item.name">{{ item.label }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="column">
                    <div class="file is-info is-small is-fullwidth">
                      <label class="file-label" style="width: 100%;">
                        <input class="file-input" type="file" accept=".glb" @change="clickUploadGlbFile"/>
                        <span class="file-cta is-rounded" style="width: 100%; justify-content: center; background-color: #3e8ed0; height: 32px;">
                          <span class="file-icon"><i class="fa fa-upload"></i></span>
                          <span class="file-label">GLB読込</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- プレビュー本体 -->
            <div class="card-content p-0 is-flex-grow-1 has-background-black" style="position: relative; min-height: 300px;">
              <ModelView ref="modelView" class="modelview" @onTexture="onTexture" :accessoryTemplateName="accessoryTemplateName" />
            </div>

            <!-- フッターアクション -->
            <footer class="card-footer p-2 has-background-white-bis" style="justify-content: center; border-top: 1px solid var(--border-color);">
              <button v-if="isGlbDownload" class="button is-success is-small is-rounded px-4" style="height: 32px;" @click="clickDownloadGlb">
                <span class="icon is-small"><i class="fa fa-download"></i></span>
                <span>GLB保存</span>
              </button>
              <div v-else class="is-size-7 has-text-grey-light py-1">プレビュー</div>
            </footer>
          </div>
        </div>
      </div>

      <!-- 右側: 設定項目 -->
      <div class="column settings-column p-4 has-background-light">
        <div class="customization-stack">
          <div class="columns is-multiline is-variable is-1 is-flex-tablet">
            <!-- テクスチャ設定 -->
            <div class="column is-6 is-flex">
              <div class="card editor-card is-flex-grow-1 is-flex is-flex-direction-column">
                <header class="card-header has-background-white-ter">
                  <p class="card-header-title is-size-7 py-2">
                    <span class="icon mr-1 has-text-info"><i class="fa fa-paint-brush"></i></span>
                    テクスチャ
                  </p>
                </header>
                <div class="card-content p-3 is-flex-grow-1 is-flex is-flex-direction-column">
                  <div class="texture-preview-box mb-3 is-flex-grow-1 is-flex is-align-items-center is-justify-content-center">
                    <figure class="image is-4by3" style="width: 100%;">
                      <img :src="textureSrc" alt="texture" class="texture-preview-img">
                    </figure>
                  </div>
                  <div class="columns is-mobile is-variable is-1 mb-0 mt-auto">
                    <div class="column is-6">
                      <div class="file is-info is-small is-fullwidth">
                        <label class="file-label">
                          <input class="file-input" type="file" @change="clickUploadTexture"/>
                          <span class="file-cta is-rounded" style="width: 100%; justify-content: center; height: 32px;">
                            <span class="file-icon"><i class="fa fa-upload"></i></span>
                            <span class="file-label">読込</span>
                          </span>
                        </label>
                      </div>
                    </div>
                    <div class="column is-6">
                      <button class="button is-success is-light is-fullwidth is-rounded is-small" style="height: 32px;" @click="clickDownloadTexture">
                        <span class="icon is-small"><i class="fa fa-download"></i></span>
                        <span>保存</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- サムネイル設定 -->
            <div class="column is-6 is-flex">
              <div class="card editor-card is-flex-grow-1 is-flex is-flex-direction-column">
                <header class="card-header has-background-white-ter">
                  <p class="card-header-title is-size-7 py-2">
                    <span class="icon mr-1 has-text-info"><i class="fa fa-camera"></i></span>
                    サムネイル
                  </p>
                </header>
                <div class="card-content p-3 is-flex-grow-1 is-flex is-flex-direction-column">
                  <div class="thumbnail-preview-box mb-3 is-flex-grow-1 is-flex is-align-items-center is-justify-content-center">
                    <figure class="image is-4by3" style="width: 100%;">
                      <img :src="thumbnailSrc" alt="thumbnail" class="thumbnail-preview-img">
                    </figure>
                  </div>
                  <div class="mt-auto">
                    <button class="button is-info is-fullwidth is-rounded is-small" style="height: 32px;" @click="clickTakeThumbnail">
                      <span class="icon is-small"><i class="fa fa-camera"></i></span>
                      <span>プレビューを撮影</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>

    <!-- 連携完了モーダル -->
    <div class="modal" :class="{'is-active': showUploadSuccessModal}">
      <div class="modal-background" @click="showUploadSuccessModal = false"></div>
      <div class="modal-card" style="max-width: 500px;">
        <header class="modal-card-head has-background-info">
          <p class="modal-card-title has-text-white">連携完了！</p>
          <button class="delete" aria-label="close" @click="showUploadSuccessModal = false"></button>
        </header>
        <section class="modal-card-body has-text-centered p-6">
          <span class="icon is-large has-text-info mb-5">
            <i class="fa fa-cloud-upload fa-3x"></i>
          </span>
          <h3 class="title is-4">clusterへの連携が完了しました</h3>
          <p class="subtitle is-6 has-text-grey">
            アップロードしたアクセサリーは、cluster公式サイトの「マイコンテンツ」から確認・公開設定ができます。
          </p>
          <div class="buttons is-centered mt-5">
            <a href="https://cluster.mu/account/contents/accessories" target="_blank" class="button is-info is-rounded">
              <span class="icon"><i class="fa fa-external-link"></i></span>
              <span>公式サイトで確認する</span>
            </a>
            <button class="button is-light is-rounded" @click="showUploadSuccessModal = false">閉じる</button>
          </div>
        </section>
      </div>
    </div>

    <!-- アクションバー (下部固定) -->
    <div class="editor-action-bar p-3 has-background-white border-top shadow-up">
      <div class="container is-fluid">
        <div class="is-flex is-justify-content-flex-end">
          <div class="field is-grouped">
            <p class="control">
              <button class="button is-success is-rounded is-small px-5" v-if="user" @click="clickSaveAccessory">
                <span class="icon"><i class="fa fa-save"></i></span>
                <span>保存</span>
              </button>
            </p>
            <p class="control">
              <button class="button is-info is-rounded is-small px-5" @click="clickUploadAccessory">
                <span class="icon"><i class="fa fa-cloud-upload"></i></span>
                <span>cluster連携</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- トースト通知 -->
    <transition name="toast">
      <div v-if="notification.visible" class="notification-toast" :class="'is-' + notification.type">
        <span class="icon mr-2">
          <i class="fa" :class="notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        </span>
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';

import localStorage from 'localStorage';
import { auth, googleProvider, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRoute } from 'vue-router';

import ModelView from './modules/ModelView.vue';
import CreatorKitItemApi from './modules/CreatorKitItemApi';
import AccessoryService from './modules/AccessoryService';

interface TypeModelView {
  // Define the properties and methods of a ModelView instance here
  loadShowGlb: (source: string | File) => void;
  takeThumbnail: (callback: (dataUrl: string) => void) => void;
  replaceTexture: (raw: ArrayBuffer, callback: ()=>void) => void;
  glb: () => File;
}

export default defineComponent({
  name: 'TopComponent',
  components: {
    ModelView,
  },
  props: {
    id: {
      type: String,
      default: undefined
    }
  },
  emits: ['saved', 'close'],
  setup(props, { emit }) {
    const isGlbDownload = ref(false);
    const user = ref<User | null>(null);
    const showUploadSuccessModal = ref(false);

    // 通知用ステート
    const notification = reactive({
      message: "",
      type: "info",
      visible: false
    });

    const showNotification = (message: string, type = "success") => {
      notification.message = message;
      notification.type = type;
      notification.visible = true;
      setTimeout(() => {
        notification.visible = false;
      }, 3000);
    };

    const accessoryTemplateList = [
      { name: "roundpaperfan", label: "うちわ" },
      { name: "tasuki", label: "シンプルなたすき [かわしぃ]" },
      { name: "suzuri-badge", label: "缶バッチ" },
      { name: "umbrella", label: "開いた傘" },
      { name: "kimoneze", label: "キモネーゼ" },
    ];

    const textureSrc = ref("");
    textureSrc.value = require('@/assets/512x512.png');

    const accessoryTemplateName = ref("");
    const modelView = ref<TypeModelView | null>(null);
    const thumbnailSrc = ref("");
    thumbnailSrc.value = require("@/assets/512x512.png");

    const accessToken = ref("");
    const accessoryName = ref("");
    const route = useRoute();
    const currentAccessoryId = ref<string | undefined>(props.id || (route.params.id as string));

    accessoryName.value = localStorage.getItem('accessoryName') ?? ""

    onAuthStateChanged(auth, async (u) => {
      user.value = u;
      if (u) {
        // Firestoreからトークンを読み込む
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          accessToken.value = docSnap.data().accessToken || "";
        }

        // ID指定がある場合はデータを読み込む
        if (currentAccessoryId.value) {
          const metadata = await AccessoryService.getAccessory(u.uid, currentAccessoryId.value);
          if (metadata) {
            accessoryName.value = metadata.name;
            thumbnailSrc.value = metadata.thumbnailUrl;
            if (modelView.value) {
              modelView.value.loadShowGlb(metadata.glbUrl);
            }
          }
        }
      } else {
        accessToken.value = localStorage.getItem('accessToken') ?? "";
      }
    });

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

    const clickUploadGlbFile = (event: any) => {
      console.log("clickUploadGlbFile");
      const file = event.target.files[0];
      if (modelView.value == null || !file) return;
      modelView.value.loadShowGlb(file);
    };

    const convertDataUrl = async (dataUrl: string) => { 
      return await (await fetch(dataUrl)).blob()
    }

    const clickUploadAccessory = async (event: any) => {
      console.log("clickUploadAccessory");
      // アクセサリをアップロードする
      if (modelView.value == null) return;
      if (accessToken.value == "") return;
      
      if (user.value) {
        await setDoc(doc(db, "users", user.value.uid), {
          accessToken: accessToken.value,
          updatedAt: new Date()
        }, { merge: true });
      } else {
        localStorage.setItem('accessToken', accessToken.value);
      }
      localStorage.setItem('accessoryName', accessoryName.value);
      
      const thumbnailBlob = await convertDataUrl(thumbnailSrc.value);

      const glb = await modelView.value.glb();
      const icon = new File([thumbnailBlob], "icon.png", { type: "image/png" });

      await CreatorKitItemApi.uploadAccessory(accessToken.value, accessoryName.value,  glb, icon, (status) =>{
        console.log("uploadAccessory", status);
        // TODO アップロード状況 を 画面更新
        switch(status) {
          case "COMPLETED":
            showNotification("アップロードが完了しました", "success");
            showUploadSuccessModal.value = true;
            break;
          case "TIMEOUT":
          case "ERROR":
            showNotification(`アップロードに失敗しました ステータス: ${status}`, "danger");
            break;
          default:
            break;
        }
      });
    };

    const clickSaveAccessory = async () => {
      if (!user.value || !modelView.value) return;
      
      try {
        const thumbnailBlob = await convertDataUrl(thumbnailSrc.value);
        const glb = await modelView.value.glb();
        
        const id = await AccessoryService.saveAccessory(
          user.value.uid, 
          accessoryName.value, 
          glb, 
          thumbnailBlob, 
          currentAccessoryId.value
        );
        currentAccessoryId.value = id;
        showNotification("ダッシュボードに保存しました", "success");
        emit('saved', id);
      } catch (error) {
        console.error("Save failed", error);
        showNotification("保存に失敗しました", "danger");
      }
    };

    const clickDownloadGlb = async (event: any) => {
      console.log("clickDownloadGlb");
      // glb をダウンロードする
      if (modelView.value == null) return;
      const glb = await modelView.value.glb();

      const a = document.createElement("a");
      a.href = URL.createObjectURL(glb);
      a.download = "accessory_template.glb";
      a.click();
    };

    // localhost の場合 isGlbDownload を true にする
    isGlbDownload.value = (location.hostname === "localhost");

    return {
      isGlbDownload,
      accessoryTemplateList,
      accessoryTemplateName,
      textureSrc,
      thumbnailSrc,
      modelView,
      accessToken,
      accessoryName,
      user,
      showUploadSuccessModal,
      notification,
      clickTakeThumbnail,
      onTexture,
      clickDownloadTexture,
      clickUploadTexture,
      clickUploadGlbFile,
      clickUploadAccessory,
      clickSaveAccessory,
      clickDownloadGlb
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* テーマカラーの定義 */
.top-editor {
  --bg-color: #ffffff;
  --bg-sidebar: #f0f4f7;
  --bg-card: #ffffff;
  --text-main: #363636;
  --text-grey: #7a7a7a;
  --border-color: #e1e8ed;
  --primary-blue: #3273dc;
  --primary-blue-hover: #276cda;
  --accent-light: #eef3fc;
  --shadow-color: rgba(0, 0, 0, 0.05);
  
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
  color: var(--text-main);
  overflow-x: hidden;
}

/* ダークモードの設定 */
@media (prefers-color-scheme: dark) {
  .top-editor {
    --bg-color: #0f172a;
    --bg-sidebar: #1e293b;
    --bg-card: #1e293b;
    --text-main: #f1f5f9;
    --text-grey: #94a3b8;
    --border-color: #334155;
    --primary-blue: #3b82f6;
    --primary-blue-hover: #60a5fa;
    --accent-light: #1e293b;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }
}

/* トースト通知のスタイル */
.notification-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 24px;
  border-radius: 50px;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.notification-toast.is-success {
  background-color: #48c78e;
}

.notification-toast.is-danger {
  background-color: #f14668;
}

.notification-toast.is-info {
  background-color: var(--primary-blue);
}

/* アニメーション */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.editor-main {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.preview-column {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sticky-preview {
  position: sticky;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  z-index: 5;
}

.preview-header .title {
  color: var(--text-main) !important;
}

.preview-header .label {
  color: var(--text-main) !important;
}

.modelview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-sidebar);
}

.modelview-card {
  flex: 1;
  position: relative;
  background-color: #000;
  border: 1px solid var(--border-color);
  border-radius: 16px; /* 角丸を少し強調 */
  overflow: hidden;
}

.shadow-premium {
  box-shadow: 0 10px 30px var(--shadow-color);
}

@media (prefers-color-scheme: dark) {
  .modelview-card {
    border-color: #475569; /* ダークモードでの境界線をより明瞭に */
  }
}

.modelview {
  width: 100% !important;
  height: 100% !important;
}

.settings-column {
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--bg-color);
}

.settings-column .title {
  color: var(--text-main) !important;
}

.editor-card {
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.editor-card .card-header-title {
  color: var(--text-main) !important;
}

.editor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.texture-preview-box, .thumbnail-preview-box {
  background: var(--bg-sidebar);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 10px;
}

.texture-preview-img, .thumbnail-preview-img {
  object-fit: contain;
  border-radius: 4px;
}

.editor-action-bar {
  z-index: 100;
  background-color: var(--bg-card) !important;
}

.shadow-up {
  box-shadow: 0 -4px 15px var(--shadow-color);
}

.border-bottom {
  border-bottom: 1px solid var(--border-color);
}

.border-top {
  border-top: 1px solid var(--border-color);
}

.h-100 {
  height: 100%;
}

/* Bulmaのオーバーライド */
.input, .select select {
  background-color: var(--bg-card) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

.input::placeholder {
  color: var(--text-grey) !important;
}

.button.is-light {
  background-color: var(--bg-sidebar) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

.message.is-info {
  background-color: var(--accent-light) !important;
}

.message.is-info .message-body {
  color: var(--text-main) !important;
  border-color: var(--primary-blue) !important;
}

.has-background-white-bis {
  background-color: var(--bg-sidebar) !important;
}

.has-background-white-ter {
  background-color: var(--bg-sidebar) !important;
}

.has-background-light {
  background-color: var(--bg-color) !important;
}

@media screen and (max-width: 768px) {
  .editor-main {
    flex-direction: column;
    overflow-y: auto;
  }
  
  .preview-column {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    min-height: 400px;
    height: auto;
  }
  
  .sticky-preview {
    position: relative;
  }
}
</style>
