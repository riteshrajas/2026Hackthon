import requests

# Create speech (POST /v1/text-to-speech/:voice_id)
# Request 16-bit PCM at 44100Hz and wrap into a WAV container locally.
response = requests.post(
  "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=pcm_16000",
  headers={
    "xi-api-key": "sk_46359604a5c00c7345b11c159eb653d46cf258eb6ac26824"
  },
  json={
    "text": "The first move is what sets everything in motion.",
    "model_id": "eleven_multilingual_v2"
  },
)

if response.status_code == 200:
    import wave
    pcm_bytes = response.content
    # Assume 16-bit mono PCM; adjust channels/sampwidth if different.
    with wave.open("output.wav", "wb") as wf:
      wf.setnchannels(1)
      wf.setsampwidth(2)
      wf.setframerate(16000)
      wf.writeframes(pcm_bytes)
    print("Saved output.wav (wrapped from PCM 16k)")
else:
    try:
        print(response.json())
    except Exception:
        print(response.status_code, response.text)