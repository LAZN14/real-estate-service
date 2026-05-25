import json
import logging
from contextlib import contextmanager

import pika
from pika.adapters.blocking_connection import BlockingChannel, BlockingConnection
from pika.exceptions import AMQPConnectionError, StreamLostError

from app.config import settings

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    def __init__(self, url: str, queue_name: str) -> None:
        self._url = url
        self._queue_name = queue_name
        self._connection: BlockingConnection | None = None
        self._channel: BlockingChannel | None = None

    def _is_connected(self) -> bool:
        return (
            self._connection is not None
            and not self._connection.is_closed
            and self._channel is not None
            and self._channel.is_open
        )

    def connect(self) -> None:
        self.close()
        parameters = pika.URLParameters(self._url)
        parameters.heartbeat = 60
        parameters.blocked_connection_timeout = 300
        self._connection = pika.BlockingConnection(parameters)
        self._channel = self._connection.channel()
        self._channel.queue_declare(queue=self._queue_name, durable=True)
        logger.info("Connected to RabbitMQ, queue=%s", self._queue_name)

    def close(self) -> None:
        if self._connection and not self._connection.is_closed:
            self._connection.close()
        self._connection = None
        self._channel = None

    def _publish_once(self, body: bytes) -> None:
        if not self._channel:
            raise RuntimeError("RabbitMQ publisher is not connected")

        self._channel.basic_publish(
            exchange="",
            routing_key=self._queue_name,
            body=body,
            properties=pika.BasicProperties(delivery_mode=2),
        )

    def publish(self, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        if not self._is_connected():
            self.connect()

        try:
            self._publish_once(body)
        except (StreamLostError, AMQPConnectionError, ConnectionResetError) as exc:
            logger.warning("RabbitMQ connection lost, reconnecting: %s", exc)
            self.connect()
            self._publish_once(body)

        logger.info("Published task to queue %s: %s", self._queue_name, payload)


publisher = RabbitMQPublisher(settings.rabbitmq_url, settings.browse_queue)


@contextmanager
def get_publisher() -> RabbitMQPublisher:
    yield publisher
