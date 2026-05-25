import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status

from app.rabbitmq import publisher
from app.schemas import BrowseRequest, BrowseResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    publisher.connect()
    yield
    publisher.close()


app = FastAPI(
    title="Real Estate Browse Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/browse", response_model=BrowseResponse, status_code=status.HTTP_202_ACCEPTED)
def browse(request: BrowseRequest) -> BrowseResponse:
    url = str(request.url)

    if "avito.ru" not in url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL должен указывать на объявление Авито",
        )

    try:
        publisher.publish({"url": url})
    except Exception as exc:
        logger.exception("Failed to publish browse task")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось поставить задачу в очередь",
        ) from exc

    return BrowseResponse(
        status="queued",
        message="Задача на сканирование объявления поставлена в очередь",
        url=url,
    )
