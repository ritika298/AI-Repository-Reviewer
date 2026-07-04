from fastapi import FastAPI, UploadFile, File
from gemini_service import review_code
app = FastAPI()

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    code = await file.read()

    code = code.decode("utf-8")

    review = review_code(code)

    return {
        "filename": file.filename,
        "review": review
    }