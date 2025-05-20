from fastapi import APIRouter, HTTPException
from app.models.question import Question, QuestionResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/questions", tags=["questions"])

@router.post("/ask", response_model=QuestionResponse)
async def ask_question(question: Question):
    try:
        # Si se proporcionaron URLs de PDFs como contexto, usar el método con contexto
        if question.context and len(question.context) > 0:
            response = await gemini_service.generate_response_with_context(
                text=question.text,
                pdf_urls=question.context
            )
        else:
            # Sin contexto, usar el método normal
            response = await gemini_service.generate_response(question.text)
            
        return QuestionResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 