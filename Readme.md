LIVE STREAMING SETUP – RTSP PIPELINE (LOCAL)

Goal:
-----
Convert a live video source into a browser-playable live stream using RTSP,
with acceptable latency, as a base for overlays.

Final Working Pipeline:
-----------------------
Phone Camera (via DroidCam)
        ↓
OBS Studio
        ↓ (RTMP)
MediaMTX (local media server)
        ↓ (RTSP :8554)
FFmpeg
        ↓ (HLS .m3u8 + .ts)
VLC / Browser (hls.js)

--------------------------------------------------

1) OBS SETUP
------------
- Install OBS Studio
- Add a Video Source:
    - Video Capture Device (DroidCam / Webcam)
- Add Audio Source:
    - Audio Input Capture (Phone mic via DroidCam)

OBS Stream Settings:
- Settings → Stream
- Service: Custom
- Server:
    rtmp://localhost:1935/mystream
- Stream Key: (leave empty)

Click "Start Streaming"

--------------------------------------------------

2) MediaMTX SETUP
-----------------
- Download and run MediaMTX (formerly rtsp-simple-server)
- Run:
    mediamtx.exe

Expected logs:
- RTMP listener opened on :1935
- RTSP listener opened on :8554

When OBS starts streaming:
- [RTMP] is publishing to path 'mystream'

IMPORTANT PORTS:
- RTMP (input from OBS): 1935
- RTSP (output for FFmpeg/VLC): 8554
- HLS (optional direct): 8888
- SRT (NOT used): 8890

RTSP URL:
    rtsp://localhost:8554/mystream

--------------------------------------------------

3) VERIFY RTSP (before FFmpeg)
------------------------------
Command:
    ffmpeg -i rtsp://localhost:8554/mystream

Expected:
- Stream #0:0: Video: h264
- Stream #0:1: Audio: aac

OR test in VLC:
- Media → Open Network Stream
- rtsp://localhost:8554/mystream

--------------------------------------------------

4) FFmpeg RTSP → HLS
--------------------
Purpose:
- Convert RTSP (not browser-supported) into HLS (browser-supported)

Python script runs FFmpeg:

RTSP input:
    rtsp://localhost:8554/mystream

Output:
    output/stream.m3u8
    output/segment_xxx.ts

Key FFmpeg flags:
- Low latency
- 1-second HLS segments
- Small playlist

Latency observed:
- ~2–3 seconds (acceptable and stable)

--------------------------------------------------

5) VERIFY HLS OUTPUT
--------------------
- Ensure FFmpeg is running
- output/stream.m3u8 is NOT empty
- .ts files rotate every second

Test in VLC:
- Media → Open File
- Select output/stream.m3u8

OR Browser:
- Use hls.js to play stream.m3u8

--------------------------------------------------

6) IMPORTANT LEARNINGS
---------------------
- OBS does NOT natively stream RTSP
- OBS → RTMP is correct
- MediaMTX bridges RTMP → RTSP
- Browsers cannot play RTSP directly
- FFmpeg is required to convert RTSP → HLS
- VLC can play RTSP directly (debugging tool)

--------------------------------------------------

7) STATUS
---------
✔ Live streaming works
✔ RTSP ingestion confirmed
✔ HLS playback works
✔ Latency acceptable
✔ Ready for overlays + Flask integration


