/** アップロード API
 * 
 *  https://docs.cluster.mu/creatorkit/pitm/api-spec/
 * 
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

    // アクセサリーアップロード
    public static uploadAccessory = async (accessToken: string, glb: File, icon: File, isBeta: boolean) => {
        // glb と icon を zip に圧縮する
        const zip = new JSZip();
        zip.file(glb.name, glb);
        zip.file(icon.name, icon);

        const compressData = await zip.generateAsync({type:'blob'});
        const zipFile = new Blob([compressData], { 'type': 'application/zip' });

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
            "fileSize": zipFile.size,
            "isBeta": isBeta
        };
        console.log(`json`, json);

        // アップロードするための URL などを取得する
        const response = await fetch(this.ENDPOINT_URL + this.API_ACCESSORY_TEMPLATE, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(json)
        });
        const data = await response.json();
        console.log(`data`, data);

        // S3へのアップロードで CORS のエラーが出る
        // function で リクエストをプロキシする
        
        // uploadUrl に対して form で zip をアップロードする
        const formDatas = new FormData();
        formDatas.append("item.zip", zipFile);
        const uploadUrl = data.uploadUrl;
        const form = data.form;

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: form,
            body: formDatas
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