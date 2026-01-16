from flask import Flask, jsonify
from flask_cors import CORS
from overlays.routes import overlays_bp
from streaming.ffmpeg_runner import start_stream, stop_stream, stream_status
from flask import send_from_directory
from config import HLS_OUTPUT_DIR
import mimetypes

app = Flask(__name__)
CORS(app)

app.register_blueprint(overlays_bp, url_prefix="/api")

mimetypes.add_type("application/vnd.apple.mpegurl", ".m3u8")
mimetypes.add_type("video/mp2t", ".ts")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/api/stream/start")
def api_start_stream():
    result = start_stream()
    if isinstance(result, dict) and result.get("error"):
        return jsonify(result), 500
    return jsonify(result)

@app.post("/api/stream/stop")
def api_stop_stream():
    stopped = stop_stream()
    return jsonify({"stopped": stopped})

@app.get("/api/stream/status")
def api_stream_status():
    return jsonify(stream_status())

@app.get("/output/<path:filename>")
def serve_output(filename):
    return send_from_directory(HLS_OUTPUT_DIR, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)

