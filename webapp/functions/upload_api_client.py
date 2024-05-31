# 参考コード
# https://github.com/ClusterVR/PITMSample/blob/main/python/cluster_api.py

import os
import io
import json
import time
import requests
import zipfile

class UploadApiClient:
    def __init__(self, access_token: str, tool_name: str = "sample-0.0"):
        """Initializes upload API client.

        access_token: Creator Kit access token of the upload user
        tool_name: alphanumeric string of the upload tool. "toolname-version" format is recommended.
        """
        self.api_base = "cluster.mu"
        if ":" in access_token:
            self.api_base, access_token = access_token.split(":")
        
        self.headers = {
            "X-Cluster-Access-Token": access_token,
            "X-Cluster-App-Version": "2.0.0",
            "X-Cluster-Device": "ClusterCreatorKit",
            "X-Cluster-Platform": "ClusterCreatorKit",
            "X-Cluster-Platform-Version": "api-" + tool_name,
        }

    def _prepare_zip(self, pitm_blob: bytes, thumbnail_blob: bytes) -> bytes:
        print(f"preparing upload... (PITM: {len(pitm_blob)} bytes, thubmnail: {len(thumbnail_blob)} bytes)")
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, mode='w') as zip_file:
            zip_file.writestr('item_template.glb', pitm_blob)
            zip_file.writestr('icon.png', thumbnail_blob)
        return zip_buffer.getvalue()

    def _upload_zip(self, upload_url, form, zip_blob):
        print("uploading...", end="", flush=True)
        r = requests.post(upload_url, data=form, files={"file": ("item.zip", zip_blob, "application/zip")})
        r.raise_for_status()
        print("OK (status: %d)" % r.status_code)

    def _poll_status(self, status_url):
        for _ in range(120):
            time.sleep(1)
            print("checking status...", end="", flush=True)
            r = requests.get(status_url)
            r.raise_for_status()
            resp = r.json()
            if resp["status"] == "VALIDATING":
                print("")
                continue

            if resp["status"] == "COMPLETED":
                print("success!")
            elif resp["status"] == "ERROR":
                print("error")
                try:
                    for reason in json.loads(resp["reason"]):
                        print(reason)
                except json.JSONDecodeError:
                    print(resp["reason"])
                except Exception as e:
                    print(e)
            else:
                print("unknown status (you're using out-of-date API client?):", resp["status"])
            return
        raise RuntimeError("Upload timeout")

    def upload_accessory(self, thumbnail_blob: bytes, pitm_blob: bytes) -> str:
        """Uploads an accessory and returns Accessory Template ID."""
        print("initiating accessory upload...")
        zip_blob = self._prepare_zip(pitm_blob, thumbnail_blob)

        req = {
            "contentType": "application/zip",
            "fileName": "accessory_template.zip",
            "fileSize": len(zip_blob),
        }
        r = requests.post(f"https://api.{self.api_base}/v1/upload/accessory_template/policies", headers=self.headers, json=req)
        r.raise_for_status()
        resp = r.json()
        self._upload_zip(resp["uploadUrl"], resp["form"], zip_blob)        
        # try:
        #    self._poll_status(resp["statusApiUrl"])
        # except Exception as e:
        #    print(e)
        return { "accessoryTemplateID": resp["accessoryTemplateID"], "statusApiUrl": resp["statusApiUrl"] }