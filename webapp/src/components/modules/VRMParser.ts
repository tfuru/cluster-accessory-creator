/** VRMParser
 *  VRMの解析とテクスチャ置き換え等の機能をもつ
 * 
 *  Copyright (c) 2022 Nobuyuki Furukawa (tfuru)
 *  This software is released under the MIT License, see LICENSE.
 */
class VRMParser {
    /* * ファイルフォーマット ドキュメント
    * glTF2.0 glb フォーマット
    * https://www.khronos.org/registry/glTF/specs/2.0/glTF-2.0.html#glb-file-format-specification
    * 
    * VRM 0.0 フォーマット
    * https://github.com/vrm-c/vrm-specification/blob/master/specification/0.0/README.ja.md 
    */

    static IS_LITTLE_ENDIAN = true
    static HEADER_MAGIC = 0x46546C67
    static CHUNK_TYPE_JSON = 0x4E4F534A
    static CHUNK_TYPE_BIN = 0x004E4942

    static CHUNK_HEADER_SIZE = 12
    static CHUNK_LENGTH_SIZE = 4
    static CHUNK_TYPE_SIZE = 4

    static json?: any
    static images: any[] = []

    static filename?: string
    static header?: any
    static chunk0?: any
    static chunk1?: any

    static callback: (json: any, images: any[]) => void

    //VRM パース
    public static parse = (file: File, callback: (json: any, images: any[]) => void) => {
        console.log('parse', file)
        VRMParser.filename = file.name
        VRMParser.callback = callback;

        const reader = new FileReader()
        reader.onload = VRMParser.onLoadVRMFile
        reader.readAsArrayBuffer(file)
    }

    private static onLoadVRMFile = async (event: any) => {
        // console.log('onLoadVRMFile', event)
        // console.log('total', event.total)        
        const raw: ArrayBuffer = event.currentTarget.result
        // DataView バイナリデータ読み書きオブジェクト
        const src = new DataView(raw)
        // Header, Chunks を取り出す
        // Header 12-byte        
        VRMParser.header = VRMParser.parseHeader(src)
        // console.log('magic', header.magicToStr)
        if (VRMParser.header.magic != VRMParser.HEADER_MAGIC) {
            // glb じゃなかった
            console.warn('file is not GLB file');
            return;
        }
        console.log('magic', VRMParser.toHexStr(VRMParser.header.magic))
        console.log('version', VRMParser.header.version)
        console.log('length', VRMParser.header.length)

        // Chunks 0 を jsonとしてパース
        VRMParser.chunk0 = VRMParser.parseChunk0(src, VRMParser.CHUNK_HEADER_SIZE)
        if (typeof VRMParser.chunk0  == 'undefined') {
            return
        }
        console.log('chunk0', VRMParser.chunk0 )
        VRMParser.json = VRMParser.chunk0.json
        console.log('json', VRMParser.json )

        // Chunks 1 を 取得
        const chunk1Offset = VRMParser.CHUNK_HEADER_SIZE 
            + VRMParser.CHUNK_LENGTH_SIZE 
            + VRMParser.CHUNK_TYPE_SIZE 
            + VRMParser.chunk0.chunkLength
        VRMParser.chunk1 = VRMParser.parseChunk1(src, chunk1Offset)
        if (typeof VRMParser.chunk1?.chunkData == 'undefined') {
            return
        }
        console.log('chunk1', VRMParser.chunk1)

        // テクスチャを取り出す images, bufferViews
        VRMParser.loadImages(VRMParser.chunk1.chunkData, VRMParser.json)
            .then(images => {
                VRMParser.images = images
                // console.log('images', VRMParser.images)

                // コールバックする
                VRMParser.callback(VRMParser.json, VRMParser.images)
            })
            .catch(e => {
                console.error('e', e)
            })
    }

    private static toHexStr = (value: number) => {
        return '0x' + value.toString(16).toUpperCase()
    }

    /* Header 12-byte
    uint32 magic
    uint32 version
    uint32 length
    */
    private static parseHeader = (src: DataView) => {
        console.log('src', src)
        const magic = src.getUint32(0, VRMParser.IS_LITTLE_ENDIAN)
        const version = src.getUint32(4, VRMParser.IS_LITTLE_ENDIAN)
        const length = src.getUint32(8, VRMParser.IS_LITTLE_ENDIAN)
        return {magic, version, length}
    }

    /* Chunks
    uint32 chunkLength
    uint32 chunkType
    ubyte[] chunkData
    */
    private static parseChunk = (type: number, src: DataView, offset: number) => {
        console.log('parseChunk', src, offset)
        const chunkLength = src.getUint32(offset, VRMParser.IS_LITTLE_ENDIAN)
        const chunkType = src.getUint32(offset + VRMParser.CHUNK_LENGTH_SIZE, VRMParser.IS_LITTLE_ENDIAN)
        if (type != chunkType) {
            console.warn('not JSON.');
            return;
        }

        // データを取り出す
        const chunkData = new Uint8Array(src.buffer,
            offset + VRMParser.CHUNK_LENGTH_SIZE + VRMParser.CHUNK_TYPE_SIZE,             
            chunkLength)

        return {chunkLength, chunkData}
    }

    // JSON 部分を取り出す
    private static parseChunk0 = (src: DataView, offset: number) => {
        console.log('parseChunk0', src, offset)
        const chunk = VRMParser.parseChunk(VRMParser.CHUNK_TYPE_JSON, src, offset)
        if (typeof chunk == 'undefined') {
            return
        }

        const chunkLength = chunk.chunkLength
        const chunkData = chunk.chunkData

        const decoder = new TextDecoder("utf8")
        const jsonText = decoder.decode(chunk.chunkData)
        const json = JSON.parse(jsonText)
        
        return {chunkLength, chunkData, json}
    }

    // バイナリ部分を取り出す  
    private static parseChunk1 = (src: DataView, offset: number) => {
        console.log('parseChunk1', src, offset)
        const chunk = VRMParser.parseChunk(VRMParser.CHUNK_TYPE_BIN, src, offset)
        if (typeof chunk == 'undefined') {
            return
        }
        const chunkLength = chunk.chunkLength
        const chunkData = chunk.chunkData

        return {chunkLength, chunkData}
    }

    // テクスチャを取り出す images, bufferViews
    private static loadImages = (chunkData: ArrayBuffer, json: any): Promise<any[]> => {
        // console.log('loadImages', json.images)
        // console.log('chunkData', chunkData)
        return new Promise((resolve, reject) => {
            const images: any[] = []
            if (json.images != null) {
                json.images
                    .forEach((v: any) => {                
                    const bufferView = json.bufferViews[v.bufferView]
                    // new Uint8Array はうまく動作しない
                    // const buf = new Uint8Array(chunkData, bufferView.byteOffset, bufferView.byteLength)
                    const buf = chunkData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
                    const blob = new Blob([buf], {type: v.mimeType})

                    const img = URL.createObjectURL(blob)
                    images.push({
                        index: v.bufferView,
                        name: v.name,
                        mimeType: v.mimeType,
                        src: img,
                        size: blob.size
                    })
                })
            }
            resolve(images)
        })
    }

    // json(chunk0), chunk1 を再構築する
    public static chunkRebuilding = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // json.buffers[0].byteLength も更新
            VRMParser.json.buffers[0].byteLength = VRMParser.chunk1.chunkLength

            // console.log('bufferViews', VRMParser.json.bufferViews)
            // chunk0 を更新
            VRMParser.chunk0.json = VRMParser.json
            VRMParser.chunk0.chunkData = new TextEncoder().encode( JSON.stringify(VRMParser.json) )
            VRMParser.chunk0.chunkLength = VRMParser.chunk0.chunkData.length
            console.log('chunk0', VRMParser.chunk0)

            // headerの length も更新
            VRMParser.header.length = VRMParser.CHUNK_HEADER_SIZE 
                + VRMParser.CHUNK_LENGTH_SIZE 
                + VRMParser.CHUNK_TYPE_SIZE 
                + VRMParser.chunk0.chunkLength
                + VRMParser.CHUNK_LENGTH_SIZE 
                + VRMParser.CHUNK_TYPE_SIZE 
                + VRMParser.chunk1.chunkLength
            
            console.log('header', VRMParser.header)

            resolve()                     
        })
    }

    // マテリアルに PbrMetallicRoughness を追加する
    private static addPbrMetallicRoughness = (material: any) => {
        material.pbrMetallicRoughness = {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 1,
            roughnessFactor: 1,
            baseColorTexture: {
                index: 0,
                texCoord: 0
            }
        }
        return material;
    }

    // テクスチャを置き換えて json(chunk0), chunk1 を再構築する
    public static replaceImage = (img: any, fileBuf: ArrayBuffer): Promise<void> => {
        console.log('replaceImage', img, fileBuf)
        
        return new Promise((resolve, reject) => {

            const chunkData = VRMParser.chunk1.chunkData
            const distChunkDataList: any[] = []
            let byteOffset = 0;
            VRMParser.json.bufferViews.forEach((bufferView: any, index: number) => {
                // console.log('bufferViews', bufferView)
                const buf = chunkData.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
                const blob = new Blob([buf])
                // console.log('blob', blob)
                distChunkDataList.push({
                    index: index,
                    byteOffset: byteOffset,
                    byteLength: blob.size,
                    blob: blob,
                    src: buf
                })
                byteOffset += blob.size
            })
            // console.log('images', VRMParser.json.images)
            // index が 一致する json.images を取り出す
            let image = VRMParser.json.images[img.index]
            if (typeof image == 'undefined') {
                // 名前が一致する json.images を取り出す
                image = VRMParser.json.images.filter((v: any) => (v.name == img.name))[0]
            }
            console.log('-- image', image)

            // pbrMetallicRoughness が無いとビューアーに表示されないので追加する
            VRMParser.json.materials.forEach((material: any) => {
                console.log('material', material)
                if (material.pbrMetallicRoughness == null) {
                    material = VRMParser.addPbrMetallicRoughness(material);
                }
                if (material.pbrMetallicRoughness.baseColorTexture != null) {
                    if (material.pbrMetallicRoughness.baseColorTexture.index == image.index) {
                        material.pbrMetallicRoughness.baseColorTexture.index = img.index
                    }
                }
            });

            // console.log('image', image)
            const distChunkDataListIndex = image.bufferView

            // distChunkDataList distChunkDataListIndex の位置の blob を file 書き換える
            distChunkDataList[distChunkDataListIndex].byteLength = fileBuf.byteLength
            distChunkDataList[distChunkDataListIndex].blob = new Blob([fileBuf])
            distChunkDataList[distChunkDataListIndex].src = new Uint8Array(fileBuf)
            
            // distChunkDataList byteOffset を書き換える
            byteOffset = 0;
            distChunkDataList.forEach((v: any, i: number, src: any[]) => {
                src[i].byteOffset = byteOffset
                byteOffset += v.byteLength
            })
            console.log('distChunkDataList', distChunkDataList)

            // distChunkDataList を元に chunk1 を作成する
            // byteOffset は byteLength            
            VRMParser.chunk1.chunkData = new Uint8Array(byteOffset)
            distChunkDataList.forEach( (v: any) => {
                VRMParser.chunk1.chunkData.set(v.src, v.byteOffset)
            })
            VRMParser.chunk1.chunkLength = VRMParser.chunk1.chunkData.length
            console.log('chunk1', VRMParser.chunk1)

            // json.bufferViews 位置の byteOffset, byteLength 書き換え
            VRMParser.json.bufferViews.forEach((v: any, i: number, src: any[]) => { 
                const data = distChunkDataList[i]
                src[i].byteLength = data.byteLength
                src[i].byteOffset = data.byteOffset
            })

            // json(chunk0), chunk1 を再構築する
            return VRMParser.chunkRebuilding()
                .then(() => {
                    resolve()
                })
                .catch(e => {
                    console.error('error', e)
                })
        })
    }

    // 一人称視点の視点のオフセット位置を取得
    // json.extensions.VRM.firstPerson
    public static getFirstPersonBone = (): {firstPerson: any} => {
        const extVRM = this.getVRMExtensionJson()
        const version = VRMParser.getVRMVersion()
        if (version.version == 1) {
            // VRM 1.0
            return extVRM.lookAt
        } else {
            // VRM 0
            return extVRM.firstPerson
        }
    }

    // 一人称視点の視点のオフセット位置を設定
    public static setFirstPersonBoneOffset = (position: any): Promise<void> => {
        // VRM 0 firstPersonBoneOffset を更新する
        // VRM 1 lookAtOffset を更新する
        return new Promise((resolve, reject) => {
            const extVRM = VRMParser.getVRMExtensionJson()
            const version = VRMParser.getVRMVersion()
            if (version.version == 0) {
                extVRM.firstPerson.firstPersonBoneOffset = position.firstPersonBoneOffset
            } else {
                extVRM.lookAt.offsetFromHeadBone = position.offsetFromHeadBone
            }            
            return VRMParser.chunkRebuilding()
                .then(() => {
                    resolve()
                })
                .catch(e => {
                    console.error('error', e)
                })
        })
    }

    public static createVRMFile = (): Promise<File> => {
        /* Header 12-byte
        uint32 magic
        uint32 version
        uint32 length
        */
        /* chunk0 json
        uint32 chunkLength
        uint32 chunkType
        ubyte[] chunkData
        */
        /* chunk1 bin
        uint32 chunkLength
        uint32 chunkType
        ubyte[] chunkData
        */
        console.log('chunk0', VRMParser.chunk0) 
        console.log('chunk1', VRMParser.chunk1)

        return new Promise((resolve, reject) => {
            const data = new ArrayBuffer(
                VRMParser.CHUNK_HEADER_SIZE 
                + VRMParser.CHUNK_LENGTH_SIZE 
                + VRMParser.CHUNK_TYPE_SIZE 
                + VRMParser.chunk0.chunkLength
                + VRMParser.CHUNK_LENGTH_SIZE 
                + VRMParser.CHUNK_TYPE_SIZE 
                + VRMParser.chunk1.chunkLength )

            const uint8 = new Uint8Array(data)
            const view = new DataView(data);
            let offset = 0
            view.setUint32(0, VRMParser.header.magic, VRMParser.IS_LITTLE_ENDIAN)
            view.setUint32(4, VRMParser.header.version, VRMParser.IS_LITTLE_ENDIAN)
            view.setUint32(8, VRMParser.header.length, VRMParser.IS_LITTLE_ENDIAN)
            offset += VRMParser.CHUNK_HEADER_SIZE
            view.setUint32(offset, VRMParser.chunk0.chunkLength, VRMParser.IS_LITTLE_ENDIAN)
            offset += VRMParser.CHUNK_LENGTH_SIZE
            view.setUint32(offset, VRMParser.CHUNK_TYPE_JSON, VRMParser.IS_LITTLE_ENDIAN)
            offset += VRMParser.CHUNK_TYPE_SIZE
            uint8.set(VRMParser.chunk0.chunkData, offset)

            offset += VRMParser.chunk0.chunkLength
            view.setUint32(offset, VRMParser.chunk1.chunkLength, VRMParser.IS_LITTLE_ENDIAN)
            offset += VRMParser.CHUNK_LENGTH_SIZE
            view.setUint32(offset, VRMParser.CHUNK_TYPE_BIN, VRMParser.IS_LITTLE_ENDIAN)
            offset += VRMParser.CHUNK_TYPE_SIZE
            uint8.set(VRMParser.chunk1.chunkData, offset)

            resolve(new File([data], VRMParser.filename!))
        })
    }

    // ダウンロードしてみる
    private static downloadBlob(file: File) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(file)
        link.download = file.name
        link.click()
    }
    
    // TODO 頭にアクセサリを追加してみる
    public static addHeadAccessory = (): Promise<void> => {
        console.log('addAccessory')
        return new Promise((resolve, reject) => {            
            resolve()
        })      
    }

    // スプリングボーン グループ を取得する
    public static getSecondaryAnimationBoneGroups = (): {boneGroups: any} => {
        const extVRM = VRMParser.getVRMExtensionJson()
        const version = VRMParser.getVRMVersion()
        if (version.version == 0) {
            // VRM 0.0
            return  extVRM.secondaryAnimation.boneGroups
        } else {
            // VRM 1.0
            return  extVRM.secondaryAnimation.boneGroups
        }
    }

    // スプリングボーンを更新
    public static setSecondaryAnimationBoneGroups = (boneGroups: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const extVRM = VRMParser.getVRMExtensionJson()
            const version = VRMParser.getVRMVersion()

            if (version.version == 0) {
                // VRM 0.0
                extVRM.secondaryAnimation.boneGroups = boneGroups
            } else {
                // VRM 1.0
                extVRM.secondaryAnimation.boneGroups = boneGroups
            }
            return VRMParser.chunkRebuilding()
                .then(() => {
                    resolve()
                })
                .catch(e => {
                    console.error('error', e)
                })
        })
    }
    
    // スケールを設定する
    public static setScale = (scale: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            VRMParser.json.nodes[0].scale[0] = scale[0]
            VRMParser.json.nodes[0].scale[1] = scale[1]
            VRMParser.json.nodes[0].scale[2] = scale[2]

            return VRMParser.chunkRebuilding()
                .then(() => {
                    resolve()
                })
                .catch(e => {
                    console.error('error', e)
                })
        })
    }
    
    public static getVRMExtensionJson() {
        if (VRMParser.json == null) {
            return null
        }        
        let extVRM = null;
        if ('VRMC_vrm' in VRMParser.json.extensions) {
            // console.warn('NOT VRM 0.0, attempting to parse VRM 1.0')
            extVRM = VRMParser.json.extensions.VRMC_vrm
        } else if ('VRM' in VRMParser.json.extensions) {
            extVRM = VRMParser.json.extensions.VRM
        }
        return extVRM
    }

    // VRM バージョン情報を取得する
    public static getVRMVersion() {
        const extVRM = VRMParser.getVRMExtensionJson()
        if (extVRM == null) {
            return {version: 0, value: "", generator: ""}
        }
        if ('exporterVersion' in extVRM) {
            return {
                version: 0, 
                value: extVRM.exporterVersion.replace("Uni", ""),
                generator: extVRM.exporterVersion
            }
        }
        return {
            version: 1,
            value: `VRM-${extVRM.specVersion}`,
            generator: VRMParser.json.asset.generator
        }
    }

    // VRM バージョン情報を取得用のユーティリティ
    public static getVRMVersionJson(json: any) {
        return ('VRMC_vrm' in json.extensions) ? 1 : 0;
    }

    public static Shaders = [
        {
            value: "VRMC_materials_mtoon",
            shader: 'VRM/MToon',
        },
        {
            value: "KHR_materials_unlit",
            shader: 'Unlit',
        }
    ];

    public static getShaders(): string[] {
        const version = VRMParser.getVRMVersion();
        const shaders: any[] = [];
        if (version.version == 0) {
            const materials = VRMParser.getMaterials();
            if (materials == null) return [];

            materials.forEach((elem: any) => {                        
                shaders.push(elem.shader);
            })
        } else {
            const materials = VRMParser.getMaterials();
            materials.forEach((m: any) => {
                const extensionNames = Object.keys(m.extensions);
                extensionNames.forEach((shaderName: any) => {
                    // specVersion が含まれtるシェーダーだけが対象
                    if ("specVersion" in m.extensions[shaderName]) {
                        const shader = VRMParser.Shaders.find((s: any) => s.value === shaderName)?.shader;
                        shaders.push(shader);                        
                    }
                })
            });
        }
        // shaders 重複を削除
        const uniqueShaders = shaders.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });        
        return uniqueShaders;       
    }

    public static getMaterials(): string[] {
        const version = VRMParser.getVRMVersion();
        if (version.version == 0) {
            const json = VRMParser.json;
            const materialProperties = json?.extensions?.VRM?.materialProperties;
            if (materialProperties == null) return [];

            return materialProperties;
        } else {
            const json = VRMParser.json;
            const materials = json?.materials;
            if (materials == null) return [];
            return materials;
        }        
    }
}

export default VRMParser;