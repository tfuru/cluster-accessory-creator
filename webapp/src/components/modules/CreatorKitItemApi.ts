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
    private static PROXY_API_URL = (location.hostname === 'localhost') 
        ? 'http://localhost:5001/cluster-accessory-creator/asia-northeast1/api/proxy'
        : '/api/proxy';

    // 確認用のダウンロード処理
    private static downloadFile = async (file: File) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
    };


    // アップロード用のZIPファイルを作成
    private static createZipFile = async (glb: File, icon: File) => {
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
        this.downloadFile(zipFile);
        return zipFile;
    }
    
    // アクセサリーアップロード
    public static uploadAccessory = async (accessToken: string, name: string, glb: File, thumbnail: File, callback:(status: string) => void) => {
        // Zipファイルを作成
        // const zip = await this.createZipFile(glb, thumbnail);

        // アクセストークンとZipファイルを 中継 Api 送信する
        const formDatas = new FormData();
        formDatas.append("accessToken", accessToken);
        formDatas.append("name", name);
        formDatas.append("thumbnail", thumbnail);
        formDatas.append("glb", glb);

        fetch(this.PROXY_API_URL, {
            method: "POST",
            body: formDatas
        }).then((response) => {
            return response.json();
        })
        .then((json) => {
            console.log(`json`, json);

            const accessoryTemplateID = json.accessoryTemplateID;
            const statusApiUrl = json.statusApiUrl;

            // アップロードステータスを確認
            let count = 0;
            const MAX_COUNT = 10;
            const interval = setInterval(() => {
                count++;
                if (count > MAX_COUNT) {
                    console.log(`アップロード タイムアウト`);
                    clearInterval(interval);
                    callback("TIMEOUT");
                    return;
                }
                fetch(statusApiUrl, {
                    method: "GET"
                }).then((response) => {
                    return response.json();
                })
                .then((json) => {
                    // console.log(`status`, json);
                    const status = json.status.toUpperCase();
                    switch (status) {
                        case 'VALIDATING':
                            console.log(`アップロード中`);
                            break;
                        case 'COMPLETED':
                            console.log(`アップロード完了`);
                            clearInterval(interval);
                            break;
                        case 'ERROR':
                        default:
                            // エラー
                            console.log(`アップロード失敗`);
                            clearInterval(interval);
                            break;
                    }
                    callback(status);
                });
            }, 3000);
        });
    };
}

export default CreatorKitItemApi;