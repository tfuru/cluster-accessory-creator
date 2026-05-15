<template>
  <div id="modelview-root" ref="container" style="width: 100%; height: 100%; overflow: hidden;">
    <canvas ref="canvas" style="display: block; width: 100%; height: 100%;"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import VRMParser from './VRMParser';

export default defineComponent({
  name: 'ModelView',
  props: {
    accessoryTemplateName: String
  },
  emits: ['onTexture'],
  setup(props, { emit }) {
    const container = ref<HTMLElement | null>(null);
    const canvas = ref<HTMLCanvasElement | null>(null);
    
    const scene = new THREE.Scene();
    let camera: THREE.OrthographicCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let animationId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const clearGltf = () => {
      const oldGltf = scene.getObjectByName("gltf");
      if (oldGltf != null) {
        scene.remove(oldGltf);
      }
    };

    let currentSize = 0.3;
    const boundingBox = new THREE.Box3();

    const fitCameraToObject = (object: THREE.Object3D) => {
      boundingBox.setFromObject(object);
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      // モデルを原点中心に移動（プレビュー用）
      object.position.x += (object.position.x - center.x);
      object.position.y += (object.position.y - center.y);
      object.position.z += (object.position.z - center.z);

      // 最大の寸法に基づいてカメラのサイズを決定
      const maxDim = Math.max(size.x, size.y, size.z);
      currentSize = maxDim * 0.55; // 余白を詰めてより大きく表示

      if (camera && container.value) {
        const rect = container.value.getBoundingClientRect();
        const aspect = rect.width / rect.height;
        camera.left = -currentSize * aspect;
        camera.right = currentSize * aspect;
        camera.top = currentSize;
        camera.bottom = -currentSize;
        camera.updateProjectionMatrix();
        
        // 描画領域のサイズも同期させる
        renderer?.setSize(rect.width, rect.height);
        
        // カメラを正面に配置
        camera.position.set(0, 0, 1.0);
        controls?.reset();
      }
    };

    const initEngine = () => {
      if (!canvas.value || !container.value) return;

      const rect = container.value.getBoundingClientRect();
      const aspect = rect.width / rect.height;
      
      camera = new THREE.OrthographicCamera(
        -currentSize * aspect, currentSize * aspect, 
        currentSize, -currentSize, 
        0, 10
      );
      camera.position.set(0, 0, 1.0);

      renderer = new THREE.WebGLRenderer({ 
        canvas: canvas.value, 
        preserveDrawingBuffer: true,
        antialias: true
      });
      renderer.setSize(rect.width, rect.height);
      renderer.setClearColor(0x7fbfff, 1.0);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);

      const intensity = 1.5 * 3;
      const light1 = new THREE.DirectionalLight(0xffffff, intensity);
      light1.position.set(0, 2, -2);
      scene.add(light1);
      
      const light2 = new THREE.DirectionalLight(0xffffff, intensity);
      light2.position.set(0, 2, 2);
      scene.add(light2);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        if (renderer && camera) {
          renderer.render(scene, camera);
          controls?.update();
        }
      };
      animate();

      // リサイズ監視
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries.length || !renderer || !camera) return;
        const { width, height } = entries[0].contentRect;
        renderer.setSize(width, height);
        
        const aspect = width / height;
        camera.left = -currentSize * aspect;
        camera.right = currentSize * aspect;
        camera.top = currentSize;
        camera.bottom = -currentSize;
        camera.updateProjectionMatrix();
      });
      resizeObserver.observe(container.value);
    };

    onMounted(() => {
      initEngine();
      if (props.accessoryTemplateName) {
        loadShowGlb(`/accessory-template/${props.accessoryTemplateName}-accessory/accessory_template.glb`);
      }
    });

    onUnmounted(() => {
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) renderer.dispose();
    });

    watch(() => props.accessoryTemplateName, (newVal) => {
      if (newVal) {
        clearGltf();
        loadShowGlb(`/accessory-template/${newVal}-accessory/accessory_template.glb`);
      }
    });

    const loadShowGlb = (source: string | File) => {
      const loader = new GLTFLoader();
      const url = (typeof source === 'string') ? source : URL.createObjectURL(source);

      loader.load(url, (gltf: any) => {
        clearGltf();
        gltf.scene.name = "gltf";
        scene.add(gltf.scene);
        
        // オブジェクトに合わせてカメラをフィットさせる
        fitCameraToObject(gltf.scene);
      });

      const getBlob = async () => {
        if (typeof source === 'string') {
          const response = await fetch(source);
          return await response.blob();
        } else {
          return source;
        }
      };

      getBlob().then((blob) => {
        const fileName = (typeof source === 'string') ? source.split('/').pop() ?? "sample.glb" : source.name;
        const file = new File([blob], fileName, { type: blob.type })
        VRMParser.parse(file, (vrm: any) => {
          if (VRMParser.images.length > 0) {
            emit('onTexture', VRMParser.images[0].src);
          }
        });
      });
    };

    const takeThumbnail = (callback: (dataUrl: string) => void) => {
      if (!canvas.value) return;
      callback(canvas.value.toDataURL("image/png"));
    };

    const replaceTexture = (raw: ArrayBuffer, callback: () => void) => {
      VRMParser.replaceImage(VRMParser.images[0], raw).then(() => {
        VRMParser.createVRMFile().then((file: File) => {
          loadShowGlb(URL.createObjectURL(file));
          callback();
        });
      });
    };

    const glb = async () => {
      return await VRMParser.createVRMFile();
    };

    return {
      container,
      canvas,
      loadShowGlb,
      takeThumbnail,
      replaceTexture,
      glb
    };
  }
});
</script>

<style scoped>
#modelview-root {
  background-color: #7fbfff;
}
</style>