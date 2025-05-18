from pydantic import BaseModel

class Question(BaseModel):
    text: str

class QuestionResponse(BaseModel):
    response: str 