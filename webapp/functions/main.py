# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
import flask
import requests

initialize_app()
app = flask.Flask(__name__)

@app.post("/proxy")
def proxy():
    data = flask.request.get_data(as_text=True)    
    url = flask.request.args.get("url")
    res = requests.post(url, data=data)
    return flask.Response(status=201, response="ok")

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    with app.request_context(req.environ):
        return app.full_dispatch_request()

# @https_fn.on_request()
# def on_request_example(req: https_fn.Request) -> https_fn.Response:
#     return https_fn.Response("Hello world!")