import json
import logging
from contextlib import contextmanager

import pika
from pika.adapters.blocking_connection import BlockingChannel

from app.config import settings

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    def __init__(self, url: str, queue_name: str) -> None:
        self._url = url
        self._queue_name = queue_name
        self._connection: pika.BlockingConnection | None = None
        self._channel: BlockingChannel | None = None

    def connect(self) -> None:
        parameters = pika.URLParameters(self._url)
        self._connection = pika.BlockingConnection(parameters)
        self._channel = self._connection.channel()
        self._channel.queue_declare(queue=self._queue_name, durable=True)
        logger.info("Connected to RabbitMQ, queue=%s", self._queue_name)

    def close(self) -> None:
        if self._connection and not self._connection.is_closed:
            self._connection.close()
        self._connection = None
        self._channel = None

    def publish(self, payload: dict) -> None:
        if not self._channel:
            raise RuntimeError("RabbitMQ publisher is not connected")

        body = json.dumps(payload, ensure_ascii=False)
        self._channel.basic_publish(
            exchange="",
            routing_key=self._queue_name,
            body=body.encode("utf-8"),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        logger.info("Published task to queue %s: %s", self._queue_name, payload)


publisher = RabbitMQPublisher(settings.rabbitmq_url, settings.browse_queue)


@contextmanager
def get_publisher() -> RabbitMQPublisher:
    yield publisher
