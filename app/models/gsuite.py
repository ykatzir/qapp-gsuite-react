import json

from google.auth.exceptions import GoogleAuthError
from google.oauth2.service_account import Credentials
from googleapiclient.errors import Error
from googleapiclient.discovery import build

from app.errors import GSuiteError


def get_service(service_account_info, delegated_user_name):
    """Get service account object based on the service account information and user.

    Arguments:
        service_account_info (str): the information about the service account for authentication.
        delegated_user_name (str): the user email for delegation.

    Returns:
        Resource - Resource object for interacting with the service.
    """

    try:
        service_account_info = json.loads(service_account_info)
        scopes = ['https://www.googleapis.com/auth/admin.reports.audit.readonly']

        credentials = Credentials.from_service_account_info(service_account_info, scopes=scopes,
                                                            subject=delegated_user_name)

        return build('admin', 'reports_v1', credentials=credentials)
    except ValueError as err:
        raise GSuiteError(description='Invalid authentication details for G-Suite', origin=err)
    except GoogleAuthError as auth_err:
        raise GSuiteError(description='Failed to authenticate details for G-Suite', origin=auth_err)


def list_activities(service, app_name, start_time):
    """ List all activities from a certain G-Suite application.

    Arguments:
        service (Resource): the resource object to interact with G-Suite API.
        app_name (str): the application name to get the logs from.
        start_time (str): the start time to get the logs from.

    Returns:
        Generator: list of all activities (logs) from G-Suite.
    """

    try:
        request = service.activities().list(userKey='all', applicationName=app_name,
                                            startTime=start_time)
        while request is not None:
            results = request.execute()
            yield results.get('items', [])
            request = service.activities().list_next(request, results)
    except GoogleAuthError as auth_err:
        raise GSuiteError(description='Failed to authenticate against G-Suite', origin=auth_err)
    except Error as err:
        raise GSuiteError(description='Failed to list activities for ' + app_name, origin=err)
