class GSuiteError(Exception):
    """
    Error from Google API client.

    Arguments:
        description (str): the description for the error.
        origin (Exception): the original exception from Google.
    """

    def __init__(self, description='', origin=None):
        super(GSuiteError, self).__init__()
        self.description = description
        self.origin = origin

    def __str__(self):
        return 'G-Suite error: {}.\n{}'.format(self.description, self.origin)


class QRadarError(Exception):
    """Error from QRadar REST error."""
