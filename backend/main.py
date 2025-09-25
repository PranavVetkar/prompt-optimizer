import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = FastAPI(title="Prompt Optimizer API")

FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in FRONTEND_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

class PromptRequest(BaseModel):
    user_prompt: str
    tone: str = "neutral"
    format: str = "text"
    persona: str = "a helpful assistant"

@app.post("/generate")
async def generate_response(request: PromptRequest):
    try:
        elaboration_prompt = f"""
        You are a prompt engineering expert. Your task is to take a simple user request and turn it into a detailed, structured prompt for a large language model.

        Here is the user's request: {request.user_prompt}
        The requested tone is: {request.tone}
        The requested output format is: {request.format}
        The requested persona for the AI is: {request.persona}

        Elaborate the user's request into a comprehensive prompt. Use the persona, tone, and format specified.
        Your elaborated prompt should be clear, detailed, and directly usable by another AI model.
        Just provide the optimized prompt.

        Optimized Prompt:
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(elaboration_prompt)
        elaborated_prompt = response.text

        token_count = model.count_tokens(elaborated_prompt).total_tokens
        
        return {
            "status": "success",
            "original_prompt": request.user_prompt,
            "elaborated_prompt": elaborated_prompt,
            "token_count": token_count
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def root():
    return {"message": "Prompt Optimizer Backend is running!"}
