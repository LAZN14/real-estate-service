import json
import logging
import os
import sys
import time

import pika
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("consumer")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
BROWSE_QUEUE = os.getenv("BROWSE_QUEUE", "browse_tasks")
SELENIUM_HUB_URL = os.getenv("SELENIUM_HUB_URL", "http://selenium-hub:4444/wd/hub")
PAGE_LOAD_TIMEOUT = int(os.getenv("PAGE_LOAD_TIMEOUT", "30"))


def create_driver() -> WebDriver:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Remote(command_executor=SELENIUM_HUB_URL, options=options)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return driver


def process_task(url: str) -> None:
    logger.info("Processing URL: %s", url)
    driver = create_driver()

    try:
        driver.get(url)
        html = driver.page_source
        logger.info("Fetched HTML for %s (%d bytes):\n%s", url, len(html), html)
    finally:
        driver.quit()


def wait_for_dependencies() -> None:
    deadline = time.time() + 120

    while time.time() < deadline:
        try:
            parameters = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(parameters)
            connection.close()

            driver = create_driver()
            driver.quit()
            logger.info("Dependencies are ready")
            return
        except Exception as exc:
            logger.warning("Waiting for dependencies: %s", exc)
            time.sleep(5)

    raise RuntimeError("Dependencies are not ready within timeout")


def consume() -> None:
    wait_for_dependencies()

    parameters = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.queue_declare(queue=BROWSE_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)

    def callback(ch, method, _properties, body: bytes) -> None:
        try:
            payload = json.loads(body.decode("utf-8"))
            url = payload["url"]
            process_task(url)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("Failed to process message")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=BROWSE_QUEUE, on_message_callback=callback)
    logger.info("Consumer started, listening queue=%s", BROWSE_QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    consume()
