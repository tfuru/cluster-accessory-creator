<template>
  <div class="settings section">
    <div class="container">
      <h1 class="title">設定</h1>
      <div class="box">
        <div class="field">
          <label class="label">Creator Kit トークン</label>
          <div class="control">
            <input class="input" type="password" placeholder="トークンを入力" v-model="accessToken" />
          </div>
          <p class="help mt-3">
            <strong>トークンの取得方法:</strong><br>
            1. cluster公式サイトの「<a href="https://cluster.mu/account/tokens" target="_blank">アクセストークン</a>」ページにアクセスします。<br>
            2. 「新しいトークンを発行する」ボタンをクリックします。<br>
            3. 発行されたトークンをコピーし、この入力欄に貼り付けて「保存」してください。<br>
            <span class="has-text-grey-light">※ トークンはアクセサリーのアップロード時にのみ使用され、安全に保管されます。</span>
          </p>
        </div>
        <div class="field mt-5">
          <button class="button is-link" :class="{'is-loading': saving}" @click="saveSettings">
            <span class="icon is-small">
              <i class="fa fa-save"></i>
            </span>
            <span>保存</span>
          </button>
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
.help a {
  text-decoration: underline;
}
</style>
