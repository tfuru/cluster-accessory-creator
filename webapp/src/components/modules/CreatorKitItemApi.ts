/** アップロード API
 * 
 *  ドキュメント
 *  https://docs.cluster.mu/creatorkit/pitm/api-spec/
 *  
 *  参考コード
 *  https://github.com/ClusterVR/PITMSample/blob/main/python/cluster_api.py
 */

import JSZip from 'jszip';

class CreatorKitItemApi {
    private static ENDPOINT_URL = "https://api.cluster.mu/v1/upload";
    private static API_ACCESSORY_TEMPLATE = "/accessory_template/policies";
    private static API_ITEM_TEMPLATE = "/item_template/policies";

    // ツール名
    private static TOOL_NAME = "itemcreator";
    // バージョン
    private static VERSION = "0.5";

    // アップロード用のZIPファイルを作成
    private static createZipFile = async (accessToken: string, glb: File, icon: File) => {
        // glb と icon を zip に圧縮する
        const zip = new JSZip();
        zip.file(glb.name, glb);
        zip.file(icon.name, icon);

        const compressData = await zip.generateAsync({
            type:'blob',
            compression: 'DEFLATE',
            compressionOptions: { 
                level: 9 
            }
        });
        const zipFile = new File([compressData], 'item.zip', { 'type': 'application/zip' });
        return zipFile;
    }

    // アクセサリーアップロード
    public static uploadAccessory = async (accessToken: string, glb: File, icon: File) => {
        // glb と icon を zip に圧縮する
        const zipFile = await this.createZipFile(accessToken, glb, icon);
        
        /*
        // 確認用にここで zipFile をダウンロードしてみる
        const url = URL.createObjectURL(zipFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'item_template.zip';
        a.click();
        */

        const headers = {
            "Content-Type": "application/json",
            "X-Cluster-Access-Token": accessToken,
            "X-Cluster-App-Version": "2.0.0",
            "X-Cluster-Device": "ClusterCreatorKit",
            "X-Cluster-Platform": "ClusterCreatorKit",
            "X-Cluster-Platform-Version": `api-${this.TOOL_NAME}-${this.VERSION}`
        };

        const json = {
            "contentType": "application/zip",
            "fileName": "item_template.zip",
            "fileSize": zipFile.size
        };
        // console.log(`json`, json);
        console.log(`fileSize`, zipFile.size, 20480);

        // アップロードするための URL などを取得する
        const response = await fetch(this.ENDPOINT_URL + this.API_ACCESSORY_TEMPLATE, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(json)
        });
        const data = await response.json();
        console.log(`data`, data);

        const formDatas = new FormData();
        // uploadUrl に対して FormData で zip をアップロードする
        const forms = data.form;
        console.log(`form`);
        for (const [key, value] of Object.entries(forms)) {
            const k = key;
            const v = (typeof value === "string") ? value : JSON.stringify(value);
            formDatas.append(k, v);
            console.log(` `, k, v);
        }
        formDatas.append("file", zipFile, "item.zip");

        const uploadUrl = data.uploadUrl;
        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formDatas,
            headers: {

            }
        });

        const uploadData = await uploadResponse.json();
        console.log(`uploadData`, uploadData);
        
        // ステータス確認 
        const statusApiUrl = data.statusApiUrl;
        /*
        const statusResponse = await fetch(statusApiUrl, {
            method: "GET",
            headers: headers
        });
        */

        return uploadData;
    };
}

export default CreatorKitItemApi;