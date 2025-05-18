from fastapi import APIRouter, HTTPException
from app.models.question import Question, QuestionResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/questions", tags=["questions"])

@router.post("/ask", response_model=QuestionResponse)
async def ask_question(question: Question):
    try:
        response = await gemini_service.generate_response(question.text)
        return QuestionResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 