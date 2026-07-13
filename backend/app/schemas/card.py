from pydantic import BaseModel

class CardBase(BaseModel):
    name:str
    brand:str
    color:str
    limit:float
    closing_day:int
    due_day:int
    used: float = 0
    
class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    id:int

    class Config:
        from_attributes=True
