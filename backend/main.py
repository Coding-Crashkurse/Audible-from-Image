from fastapi import FastAPI, File, UploadFile, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
from langchain.chat_models import ChatOpenAI
from langchain.schema.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
from fastapi.responses import FileResponse
from pathlib import Path


# Load environment variables
load_dotenv()

app = FastAPI()

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize the chat model
chain = ChatOpenAI(model="gpt-4-vision-preview", max_tokens=1024)


@app.get("/audio/")
async def get_audio():
    speech_file_path = Path(__file__).parent / "speech.mp3"
    if speech_file_path.exists():
        return FileResponse(speech_file_path, media_type="audio/mpeg")
    else:
        return Response(status_code=404, content={"message": "Audio file not found"})


@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    try:
        # Read the contents of the file
        content = await file.read()

        # Encode file content to base64
        base64_image = base64.b64encode(content).decode("utf-8")

        # Construct the messages
        messages = [
            AIMessage(
                content="You are a useful bot that is especially good at OCR from images"
            ),
            HumanMessage(
                content=[
                    {
                        "type": "text",
                        "text": "Take a look at the image you get. Can you please tell me what its written on there?",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ]
            ),
        ]

        # Invoke the chat model with the messages
        msg = chain.invoke(messages)

        # Return the model's response
        return JSONResponse(content={"result": msg.content})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
