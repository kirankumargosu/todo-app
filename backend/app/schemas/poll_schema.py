from pydantic import BaseModel
from typing import Optional

class PollBase(BaseModel):
    title: str
    is_active: bool = False
    created_user_id: Optional[int] = None

    def to_string(self):
        return {'title': self.title,
                'is_active': self.is_active,
                'created_user_id': self.created_user_id
                  }

class PollCreate(PollBase):
    pass

class PollUpdate(PollBase):
    pass

class PollOut(BaseModel):
    id: int
    title: str
    is_active: bool
    created_user_id: Optional[int] = None

    class Config:
        from_attributes = True

class CreatedUserOut(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class PollResponse(PollBase):
    id: int
    assigned_user: Optional[CreatedUserOut] = None
    class Config:
        from_attributes = True
