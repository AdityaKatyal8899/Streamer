from flask import Blueprint, request, jsonify
from database.mongo import overlays_collection

overlays_bp = Blueprint("overlays", __name__)

@overlays_bp.get("/overlays/<stream_id>")
def get_overlays(stream_id):
    doc = overlays_collection.find_one({"stream_id": stream_id})
    if not doc:
        return jsonify({
            "stream_id": stream_id,
            "stream_url": "",
            "overlays": {"image": [], "text": []},
            "positions": {"image_position": [], "text_position": []}
        })
    doc.pop("_id", None)
    return jsonify(doc)

@overlays_bp.post("/overlays/<stream_id>")
def post_overlays(stream_id):
    data = request.get_json() or {}
    data["stream_id"] = stream_id
    overlays_collection.update_one({"stream_id": stream_id}, {"$set": data}, upsert=True)
    return jsonify(data)

