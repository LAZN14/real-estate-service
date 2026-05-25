from pydantic import AnyHttpUrl, BaseModel, Field


class BrowseRequest(BaseModel):
    url: AnyHttpUrl = Field(..., description="URL объявления на Авито")


class BrowseResponse(BaseModel):
    status: str
    message: str
    url: str
