import datetime
from functools import wraps
from werkzeug.exceptions import BadRequest
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from requests.exceptions import RequestException

from app import db
from app.qpylib.qpylib import REST
from app.errors import QRadarError


def marshal_with(schema, **dump_kwargs):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            if isinstance(result, tuple):
                return schema.dump(result[0], **dump_kwargs), result[1]
            return schema.dump(result, **dump_kwargs)
        return wrapper
    return decorator


def handle_validation(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as err:
            raise BadRequest(err.normalized_messages())
    return wrapper


def handle_sqlalchemy(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SQLAlchemyError as err:
            db.session.rollback()
            raise BadRequest(str(err))
    return wrapper


def handle_qradar(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except QRadarError as err:
            raise BadRequest(str(err))

    return wrapper

def log_error(logger, error):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except error as err:
                logger.error(err)
        return wrapper
    return decorator


def get_default_timestamp():
    return datetime.datetime.utcnow().isoformat('T') + 'Z'


def qradar_rest(method, endpoint, **kwargs):
    """
    Executing HTTP request to QRadar RESTful API.

    Arguments:
        method (str): The method of the request (GET / POST / PUT / DELETE).
        endpoint (str): The endpoint inside the API (e.g. /siem/offenses).

    Raises:
        QRadarError: the request or the response is invalid.

    Returns:
        JSON: the response from QRadar API.
    """

    try:
        resp = REST(method, 'api/{}'.format(endpoint), **kwargs)

        if not resp:
            raise QRadarError('Invalid response from {} in {}: {}'.format(method, endpoint,
                                                                          resp.text))
        return resp.json()
    except RequestException as err:
        raise QRadarError('Failed to execute {} request to {}: {}'.format(method, endpoint, err))
