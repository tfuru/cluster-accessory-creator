<template>
  <div class="top-editor">
    <div class="columns is-variable is-3 mb-0 editor-main">
      <!-- 左側: 3Dプレビュー (固定) -->
      <div class="column is-6-widescreen is-7-desktop is-12-tablet preview-column p-4 has-background-light">
        <div class="card editor-card is-flex is-flex-direction-column h-100">
          <!-- 構成ヘッダー -->
          <div class="card-header-custom p-4 border-bottom">
            <div class="field mb-4">
              <label class="label is-small has-text-grey">アクセサリー名</label>
              <div class="control has-icons-left">
                <input class="input is-rounded is-small" type="text" placeholder="アクセサリー名を入力" v-model="accessoryName" />
                <span class="icon is-small is-left"><i class="fa fa-tag"></i></span>
              </div>
            </div>
            <div class="columns is-mobile is-variable is-1">
              <div class="column">
                <label class="label is-small has-text-grey">テンプレート</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth is-rounded is-small">
                    <select v-model="accessoryTemplateName">
                      <option value="">選択してください</option>
                      <option v-for="item in accessoryTemplateList" :key="item.name" :value="item.name">{{ item.label }}</option>
                    </select>
                  </div>
                  <span class="icon is-small is-left"><i class="fa fa-cube"></i></span>
                </div>
              </div>
              <div class="column is-narrow is-flex is-align-items-flex-end">
                <div class="file is-info is-light is-rounded">
                  <label class="file-label">
                    <input class="file-input" type="file" @change="clickUploadGlbFile" />
                    <span class="file-cta px-4">
                      <span class="file-icon"><i class="fa fa-upload"></i></span>
                      <span class="file-label">GLB読込</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 3D表示エリア -->
          <div class="card-content p-0 is-flex-grow-1 is-relative is-flex is-justify-content-center is-align-items-center" style="background-color: #f8fafc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; overflow: hidden;">
            <ModelView ref="modelView" class="modelview-full" @onTexture="onTexture" :accessoryTemplateName="accessoryTemplateName" />
            <div class="preview-overlay p-3">
              <button v-if="isGlbDownload" class="button is-dark is-rounded opacity-80" @click="clickDownloadGlb">
                <span class="icon"><i class="fa fa-download"></i></span>
                <span>GLB保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側: カスタマイズ設定 (スクロール可) -->
      <div class="column settings-column p-4 has-background-light">
        <div class="columns is-multiline" style="height: 100%;">
          <!-- テクスチャ設定 -->
          <div class="column is-6-desktop is-12-tablet is-flex">
            <div class="card editor-card is-flex-grow-1">
              <div class="card-header-custom p-3 border-bottom is-flex is-align-items-center">
                <span class="icon has-text-info mr-2"><i class="fa fa-pencil"></i></span>
                <h2 class="subtitle is-6 mb-0 font-weight-bold">テクスチャ</h2>
              </div>
              <div class="card-content p-4 is-flex is-flex-direction-column is-flex-grow-1">
                <div class="texture-preview-container mb-4">
                  <figure class="image preview-box">
                    <img :src="textureSrc" alt="texture" class="preview-img">
                  </figure>
                </div>
                <div class="is-flex is-justify-content-center is-align-items-center mt-auto" style="gap: 10px;">
                  <div class="file is-info is-light is-rounded mb-0">
                    <label class="file-label">
                      <input class="file-input" type="file" @change="clickUploadTexture" />
                      <span class="file-cta px-4">
                        <span class="file-icon"><i class="fa fa-upload"></i></span>
                        <span class="file-label">読込</span>
                      </span>
                    </label>
                  </div>
                  <button class="button is-light is-rounded px-4 mb-0" @click="clickDownloadTexture">
                    <span class="icon"><i class="fa fa-save"></i></span>
                    <span>保存</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- サムネイル設定 -->
          <div class="column is-6-desktop is-12-tablet is-flex">
            <div class="card editor-card is-flex-grow-1">
              <div class="card-header-custom p-3 border-bottom is-flex is-align-items-center">
                <span class="icon has-text-info mr-2"><i class="fa fa-camera"></i></span>
                <h2 class="subtitle is-6 mb-0 font-weight-bold">サムネイル</h2>
              </div>
              <div class="card-content p-4 is-flex is-flex-direction-column is-flex-grow-1">
                <div class="texture-preview-container mb-4">
                  <figure class="image preview-box">
                    <img :src="thumbnailSrc" alt="thumbnail" class="preview-img">
                  </figure>
                </div>
                <div class="buttons is-centered mt-auto">
                  <button class="button is-info is-light is-rounded is-fullwidth mx-4" @click="clickTakeThumbnail">
                    <span class="icon"><i class="fa fa-camera"></i></span>
                    <span>プレビューを撮影</span>
                  </button>
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
              <button class="button is-success is-rounded px-5" v-if="user" @click="clickSaveAccessory">
                <span class="icon"><i class="fa fa-save"></i></span>
                <span>保存</span>
              </button>
            </p>
            <p class="control">
              <button class="button is-info is-rounded px-5" @click="clickUploadAccessory">
                <span class="icon"><i class="fa fa-cloud-upload"></i></span>
                <span>cluster連携</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知トースト -->
    <transition name="fade">
      <div v-if="notification.visible" class="notification-toast" :class="'is-' + notification.type">
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRoute } from 'vue-router';

import localStorage from 'localStorage';
import { auth, googleProvider, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRoute } from 'vue-router';

import ModelView from './modules/ModelView.vue';
import CreatorKitItemApi from './modules/CreatorKitItemApi';
import AccessoryService from './modules/AccessoryService';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultImage = require('@/assets/512x512.png');

interface TypeModelView {
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

    const textureSrc = ref(defaultImage);
    const thumbnailSrc = ref(defaultImage);

    const accessoryTemplateName = ref("");
    const modelView = ref<TypeModelView | null>(null);

    watch(accessoryTemplateName, () => {
      textureSrc.value = defaultImage;
      thumbnailSrc.value = defaultImage;
    });

    const accessToken = ref("");
    const accessoryName = ref("");
    const route = useRoute();
    const currentAccessoryId = ref<string | undefined>(props.id || (route.params.id as string));

    accessoryName.value = localStorage.getItem('accessoryName') ?? ""

    onAuthStateChanged(auth, async (u) => {
      user.value = u;
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          accessToken.value = docSnap.data().accessToken || "";
        }

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
      textureSrc.value = dataUrl;
    };

    const clickTakeThumbnail = () => {
      if (modelView.value == null) return;
      modelView.value.takeThumbnail((dataUrl: string) => {
        thumbnailSrc.value = dataUrl;
      });
    };

    const clickDownloadTexture = () => {
      const a = document.createElement("a");
      a.href = textureSrc.value;
      a.download = "texture.png";
      a.click();
    };

    const clickUploadTexture = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        if (modelView.value == null) return;
        modelView.value.replaceTexture(event.target.result, () => {
          showNotification("テクスチャを更新しました");
        });
      };
      fileReader.readAsArrayBuffer(file);
    };

    const clickUploadGlbFile = (event: any) => {
      const file = event.target.files[0];
      if (modelView.value) {
        modelView.value.loadShowGlb(file);
        showNotification("GLBファイルを読み込みました");
      }
    };

    const convertDataUrl = async (dataUrl: string) => { 
      return await (await fetch(dataUrl)).blob()
    }

    const clickUploadAccessory = async () => {
      if (modelView.value == null) return;
      if (accessToken.value == "") {
        showNotification("トークンを設定してください", "danger");
        return;
      }
      
      try {
        const thumbnailBlob = await convertDataUrl(thumbnailSrc.value);
        const glb = await modelView.value.glb();
        const icon = new File([thumbnailBlob], "icon.png", { type: "image/png" });

        showNotification("アップロード中...", "info");
        await CreatorKitItemApi.uploadAccessory(accessToken.value, accessoryName.value,  glb, icon, (status) =>{
          if(status === "COMPLETED") {
            showUploadSuccessModal.value = true;
            notification.visible = false;
          } else if(status === "ERROR" || status === "TIMEOUT") {
            showNotification(`アップロード失敗: ${status}`, "danger");
          }
        });
      } catch (e) {
        showNotification("アップロード中にエラーが発生しました", "danger");
      }
    };

    const clickSaveAccessory = async () => {
      if (!user.value || !modelView.value) return;
      try {
        const thumbnailBlob = await convertDataUrl(thumbnailSrc.value);
        const glb = await modelView.value.glb();
        const id = await AccessoryService.saveAccessory(user.value.uid, accessoryName.value, glb, thumbnailBlob, currentAccessoryId.value);
        currentAccessoryId.value = id;
        showNotification("保存しました", "success");
        emit('saved', id);
      } catch (error) {
        showNotification("保存に失敗しました", "danger");
      }
    };

    const clickDownloadGlb = async () => {
      if (modelView.value == null) return;
      const glb = await modelView.value.glb();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(glb);
      a.download = `${accessoryName.value || 'accessory'}.glb`;
      a.click();
    };

    onMounted(() => {
      isGlbDownload.value = (location.hostname === "localhost");
    });

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

<style scoped>
.top-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
}

.editor-main {
  flex: 1;
  overflow: hidden;
  margin: 0 !important;
}

.preview-column, .settings-column {
  height: calc(100vh - 200px);
  min-height: 600px;
}

.settings-column {
  display: flex;
  flex-direction: column;
}

.settings-column > .columns {
  flex: 1; /* 親要素の高さをいっぱいに使う */
}

.settings-column .column {
  display: flex;
  flex-direction: column;
  padding: 0.75rem; /* 標準のパディング */
}

.editor-card {
  flex: 1;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.card-header-custom {
  background-color: #fff;
}

.border-bottom {
  border-bottom: 1px solid #eee;
}

.modelview-full {
  display: block;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 500px;
  max-height: 500px;
  margin-bottom: 2rem;
  background-color: #7fbfff;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 10;
}

.texture-preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8fafc; /* 少し明るめの背景に */
  border-radius: 12px;
  padding: 15px;
  border: 2px dashed #e2e8f0;
  min-height: 0; /* flexアイテム内での縮小を許可 */
}

.preview-box {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-width: 250px;
  max-height: 250px;
  margin: 0 auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.editor-action-bar {
  z-index: 100;
  border-top: 1px solid #eee;
}

.shadow-up {
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 50px;
  color: white;
  z-index: 9999;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  font-weight: 600;
}

.notification-toast.is-success { background: #48c78e; }
.notification-toast.is-info { background: #3e8ed0; }
.notification-toast.is-danger { background: #f14668; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.opacity-80 {
  opacity: 0.8;
}

.font-weight-bold {
  font-weight: 700;
}

@media screen and (max-width: 1023px) {
  .preview-column, .settings-column {
    height: auto;
    overflow: visible;
  }
  .top-editor {
    overflow-y: auto;
  }
}
</style>