import pytest
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from app import app

URL_BASE = 'http://localhost:5000'


@pytest.fixture
def client():
    return app.test_client()


@pytest.fixture
def driver():
    options = Options()
    options.headless = True
    web_driver = webdriver.Firefox(options=options)
    return {'driver': web_driver, 'url': URL_BASE}
