# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# 参考コード
# https://github.com/ClusterVR/PITMSample/blob/main/python/cluster_api.py

from firebase_functions import https_fn
from firebase_admin import initialize_app
import flask
from flask_cors import CORS

import os
import json
import upload_api_client

initialize_app()
app = flask.Flask(__name__)
CORS(app)

@app.post("/proxy")
def proxy():
    name = flask.request.files['name']
    thumbnail = flask.request.files['thumbnail']
    glb = flask.request.files['glb']
    accessToken = flask.request.form['accessToken']
    
    thumbnail_blob = thumbnail.read()
    glb_blob = glb.read()
    
    # TODO glb 内の 拡張部分にある アイテム名の変更

    client = upload_api_client.UploadApiClient(accessToken)
    result = client.upload_accessory(thumbnail_blob=thumbnail_blob, pitm_blob=glb_blob)

    return json.dumps(result)

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()
