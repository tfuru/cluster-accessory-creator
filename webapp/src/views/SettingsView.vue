<template>
  <div class="settings-page section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-8-desktop is-10-tablet">
          <div class="level mb-5">
            <div class="level-left">
              <h1 class="title is-3">設定</h1>
            </div>
          </div>
          
          <div class="card settings-card">
            <div class="card-header border-bottom p-4">
              <p class="card-header-title">
                <span class="icon has-text-info mr-2"><i class="fa fa-key"></i></span>
                連携設定
              </p>
            </div>
            <div class="card-content p-5">
              <div class="field">
                <label class="label">Creator Kit トークン</label>
                <div class="control has-icons-left">
                  <input class="input is-rounded" type="password" placeholder="トークンを入力" v-model="accessToken" />
                  <span class="icon is-small is-left"><i class="fa fa-lock"></i></span>
                </div>
                <div class="notification is-light mt-4 is-size-7">
                  <p><strong>トークンの取得方法:</strong></p>
                  <ol class="ml-4 mt-2">
                    <li>cluster公式サイトの「<a href="https://cluster.mu/account/tokens" target="_blank">アクセストークン</a>」ページにアクセスします。</li>
                    <li>「新しいトークンを発行する」ボタンをクリックします。</li>
                    <li>発行されたトークンをコピーし、この入力欄に貼り付けて「保存」してください。</li>
                  </ol>
                  <p class="mt-2 has-text-grey">※ トークンはアクセサリーのアップロード時にのみ使用され、安全に保管されます。</p>
                </div>
              </div>
            </div>
            <div class="card-footer p-4 is-justify-content-flex-end">
              <button class="button is-info is-rounded px-6" :class="{'is-loading': saving}" @click="saveSettings">
                <span class="icon">
                  <i class="fa fa-save"></i>
                </span>
                <span>設定を保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default defineComponent({
  name: 'SettingsView',
  setup() {
    const accessToken = ref("");
    const saving = ref(false);

    const loadSettings = async (uid: string) => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        accessToken.value = docSnap.data().accessToken || "";
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          loadSettings(user.uid);
        }
      });
    });

    const saveSettings = async () => {
      if (!auth.currentUser) return;
      saving.value = true;
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          accessToken: accessToken.value,
          updatedAt: new Date()
        }, { merge: true });
        // 他の画面と同様の通知メッセージがあれば良いが、現状はalertで対応
        alert("設定を保存しました");
      } catch (e) {
        console.error("Save failed", e);
        alert("保存に失敗しました");
      } finally {
        saving.value = false;
      }
    };

    return { accessToken, saving, saveSettings };
  }
});
</script>

<style scoped>
.settings-page {
  background-color: #fafafa;
  min-height: calc(100vh - 70px);
}

.settings-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  overflow: hidden;
}

.border-bottom {
  border-bottom: 1px solid #eee;
}

.card-footer {
  border-top: 1px solid #eee;
}

.notification a {
  color: #3e8ed0;
  text-decoration: underline;
}
</style>
