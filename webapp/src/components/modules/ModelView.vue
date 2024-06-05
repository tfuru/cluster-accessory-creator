<template>
    <div id="modelview">
        <canvas id="canvas"></canvas>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import VRMParser from './VRMParser';

export default defineComponent({
    name: 'ModelView',
    props: {
        accessoryTemplateName: String,
        width: Number,
        height: Number,
    },
    emits: [
        'onTexture',
    ],
    setup(props, { emit }) {
        const scene = new THREE.Scene();
        let camera: any = null;
        let renderer: any = null;
        let controls: OrbitControls | null = null;

        // props.accessoryTemplateName の変更を監視    
        watch(() => props.accessoryTemplateName, (newVal, oldVal) => {
            console.log(`accessoryTemplateName ${newVal}`);
            // 3D モデル表示卵 初期化
            initView();

            // glbを読み込み表示
            loadShowGlb(`/accessory-template/${newVal}-accessory/accessory_template.glb`);
        });

        // アップデート
        const updateView = () => {
            if ((renderer == null) || (camera == null)) return;
            renderer.render(scene, camera);
            controls?.update();
        };

        // 3D モデル表示卵 初期化
        const initView = () => {
            const viewerElement = document.getElementById("canvas");
            if (viewerElement == null) return;
                // すでに表示されている モデルを検索して削除
            const gltf = scene.getObjectByName("gltf");
            if (gltf != null) {
                scene.remove(gltf);
            }

            // camera = new THREE.PerspectiveCamera(75, props.width! / props.height!, 0.1, 100);
            // 平行投影カメラ
            const size = 0.2;
            camera = new THREE.OrthographicCamera(-size, +size, size, -size, 0, 100);
            camera.position.set(0, 0, 1);

            renderer = new THREE.WebGLRenderer({ canvas: viewerElement, preserveDrawingBuffer: true });
            renderer.setSize(props.width!, props.height!);
            renderer.setClearColor(0x7fbfff, 1.0);

            // 環境光
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
            scene.add(ambientLight);

            // ライトを作成
            const intensity = 1.5;
            {
                const light = new THREE.DirectionalLight(0xffffff, intensity);
                light.position.set(0, 2, -2);
                scene.add(light);
            }
            {
                const light = new THREE.DirectionalLight(0xffffff, intensity);
                light.position.set(0, 2, 2);
                scene.add(light);      
            }

            // コントローラーを追加
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping
            controls.update();
            
            const animate = () => {
                requestAnimationFrame(animate);
                updateView();
            };
            animate();
        };
        initView();

        // Glbを読み込み表示
        const loadShowGlb = (path: string) => {
            const loader = new GLTFLoader();
            loader.load(path, (gltf: any) => {
                console.log("gltf", gltf);
                // 検索するために名前を設定
                gltf.scene.name = "gltf";
                gltf.scene.position.set(0, -0.15, 0);
                scene.add( gltf.scene );
            });

            // path のファイルを blob として取得
            fetch(path).then((response) => {
                return response.blob();
            }).then((blob) => {
                // path からファイル名を取得
                const fileName = path.split('/').pop() ?? "sample.glb";
                // blob を VRMParser で読み込み
                const file = new File([blob], fileName, { type: blob.type })
                VRMParser.parse(file, (vrm: any) => {
                    console.log("vrm", vrm);
                    // テクスチャを取り出す images, bufferViews
                    VRMParser.images.forEach((image: any) => {
                        console.log("image", image);
                    });
                    // テクスチャを表示
                    emit('onTexture', VRMParser.images[0].src);
                });
            });

        };

        // テクスチャをリサイズする
        const resizeTexture = (dataUrl: string, width: number, height: number, callback: (dataUrl: string)=> void) => {
            // console.log("resizeTexture", raw);
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx == null) return;
                ctx.drawImage(image, 0, 0, width, height);
                const dataUrl = canvas.toDataURL("image/png");
                callback(dataUrl);
            };
            image.src = dataUrl;
        };

        // サムネイル画像を撮影する
        const takeThumbnail = (callback: (dataUrl: string)=> void) => {
            const viewerElement = document.getElementById("canvas");
            if (viewerElement == null) return;
            const canvas = viewerElement as HTMLCanvasElement;
            const dataUrl = canvas.toDataURL("image/png");
            callback(dataUrl);
            /*
            const size = 256;
            resizeTexture(dataUrl, size, size, (dataUrl: string) => {
                callback(dataUrl);
            });
            */
        };

        // テクスチャを置き換える
        const replaceTexture = (raw: ArrayBuffer, callback: ()=>void) => {
            // console.log("replaceTexture", raw);
            VRMParser.replaceImage(VRMParser.images[0], raw)
                .then(() => {
                    VRMParser.createVRMFile()
                        .then((file: File) => {
                            console.log("createVRMFile", file);
                            loadShowGlb(URL.createObjectURL(file));
                        });
                 
                    callback();
                });
        };

        const glb = async () => {
            return await VRMParser.createVRMFile();
        };

    return {
        takeThumbnail,
        replaceTexture,
        glb
    }
}
});
</script>
  
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#canvas {
    width: 100%;
    height: 100%;
}
</style>
  