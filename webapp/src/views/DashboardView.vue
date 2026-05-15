<template>
  <div class="dashboard section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <h1 class="title">ダッシュボード</h1>
        </div>
        <div class="level-right">
          <button class="button is-primary" @click="openEditor()">
            <span class="icon">
              <i class="fa fa-plus"></i>
            </span>
            <span>新規作成</span>
          </button>
        </div>
      </div>

      <hr>

      <div v-if="loading" class="section has-text-centered">
        <span class="icon is-large">
          <i class="fa fa-spinner fa-pulse fa-3x"></i>
        </span>
        <p class="mt-4">読み込み中...</p>
      </div>

      <div v-else-if="accessories.length === 0" class="section has-text-centered">
        <div class="notification is-light">
          保存されたアクセサリーはありません。「新規作成」からアクセサリーを作ってみましょう！
        </div>
      </div>

      <div v-else class="columns is-multiline">
        <div v-for="item in accessories" :key="item.id" class="column is-12-mobile is-6-tablet is-4-desktop is-3-widescreen">
          <div class="box has-text-centered p-5 h-100 flex-column">
            <!-- サムネイル (さらに大きく) -->
            <figure class="image is-square mb-4">
              <img :src="item.thumbnailUrl" alt="Thumbnail" style="border-radius: 12px; object-fit: cover; background: #fafafa; border: 1px solid #eee;">
            </figure>
            
            <!-- 名前と日付 (画像の下に配置) -->
            <div class="mb-4 flex-grow-1">
              <p class="title is-5 mb-2">{{ item.name }}</p>
              <p class="subtitle is-7 has-text-grey">更新: {{ formatDate(item.updatedAt || item.createdAt) }}</p>
            </div>
            
            <!-- 操作ボタン (大きく) -->
            <div class="buttons is-centered">
              <button class="button is-light is-fullwidth mb-2" @click="openEditor(item.id)">
                <span class="icon">
                  <i class="fa fa-edit"></i>
                </span>
                <span>編集</span>
              </button>
              <button class="button is-info is-outlined is-fullwidth mb-2" 
                      @click="uploadToCluster(item)" 
                      :class="{'is-loading': uploadingMap[item.id!]}"
                      :disabled="uploadingMap[item.id!]">
                <span class="icon">
                  <i class="fa fa-cloud-upload"></i>
                </span>
                <span>clusterへ連携</span>
              </button>
              <button class="button is-danger is-light is-fullwidth" @click="deleteItem(item.id)">
                <span class="icon">
                  <i class="fa fa-trash"></i>
                </span>
                <span>削除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal Overlay -->
    <div class="modal" :class="{'is-active': showEditorModal}">
      <div class="modal-background" @click="closeEditor"></div>
      <div class="modal-card" style="width: 95%; max-width: 1400px; height: 95vh; max-height: 95vh;">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ editingId ? 'アクセサリー編集' : 'アクセサリー新規作成' }}</p>
          <button class="delete" aria-label="close" @click="closeEditor"></button>
        </header>
        <section class="modal-card-body">
          <TopComponent v-if="showEditorModal" :id="editingId" @saved="onSaved" />
        </section>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AccessoryService, { AccessoryMetadata } from '../components/modules/AccessoryService';
import TopComponent from '../components/Top.vue';

export default defineComponent({
  name: 'DashboardView',
  components: {
    TopComponent
  },
  setup() {
    const accessories = ref<AccessoryMetadata[]>([]);
    const loading = ref(true);
    const showEditorModal = ref(false);
    const editingId = ref<string | undefined>(undefined);
    const uploadingMap = ref<{[key: string]: boolean}>({});
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

    const fetchAccessories = async (uid: string) => {
      loading.value = true;
      try {
        accessories.value = await AccessoryService.getAccessories(uid);
      } catch (e) {
        console.error("Failed to fetch accessories", e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchAccessories(user.uid);
        }
      });
    });

    const openEditor = (id?: string) => {
      editingId.value = id;
      showEditorModal.value = true;
    };

    const closeEditor = () => {
      showEditorModal.value = false;
      editingId.value = undefined;
    };

    const onSaved = () => {
      if (auth.currentUser) {
        fetchAccessories(auth.currentUser.uid);
      }
    };

    const uploadToCluster = async (accessory: AccessoryMetadata) => {
      if (!auth.currentUser || !accessory.id) return;
      
      uploadingMap.value[accessory.id] = true;
      try {
        await AccessoryService.uploadToCluster(auth.currentUser.uid, accessory, (status) => {
          console.log(`Upload status for ${accessory.name}: ${status}`);
        });
        showNotification(`「${accessory.name}」を cluster にアップロードしました！`, "success");
        showUploadSuccessModal.value = true;
      } catch (error: any) {
        console.error("Upload failed", error);
        showNotification(`アップロードに失敗しました: ${error.message}`, "danger");
      } finally {
        uploadingMap.value[accessory.id] = false;
      }
    };

    const deleteItem = async (id?: string) => {
      if (!id || !auth.currentUser) return;
      if (confirm("このアクセサリーを削除しますか？ストレージからも完全に削除されます。")) {
        try {
          await AccessoryService.deleteAccessory(auth.currentUser.uid, id);
          await fetchAccessories(auth.currentUser.uid);
          showNotification("アクセサリーを削除しました", "success");
        } catch (error) {
          console.error("Delete failed", error);
          showNotification("削除に失敗しました", "danger");
        }
      }
    };

    const formatDate = (timestamp: any) => {
      if (!timestamp) return "-";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return { 
      accessories, 
      loading, 
      showEditorModal, 
      editingId, 
      uploadingMap,
      notification,
      showUploadSuccessModal,
      openEditor, 
      closeEditor, 
      onSaved, 
      uploadToCluster,
      deleteItem, 
      formatDate 
    };
  }
});
</script>

<style scoped>
/* 通知スタイル */
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

.h-100 {
  height: 100%;
}
.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-grow-1 {
  flex-grow: 1;
}
.box {
  transition: transform 0.2s;
}
.box:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.image img {
  border: 1px solid #eee;
}
.modal-card-body {
  padding: 0;
}
</style>
