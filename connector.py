import json
import time
import logging
import logging.handlers
from multiprocessing import Process
from datetime import datetime, timedelta

from app import db
from app.models.database import DomainConfig
from app.models import gsuite

from app.errors import GSuiteError


SLEEP_TIME = 30


def get_syslog(domain):
    """ Create syslog logger for specific application inside a domain.

    Arguments:
        domain (DomainConfig): the domain configuration object.

    Returns:
        Logger: a logger object to send the logs via Syslog.
    """

    logger = logging.getLogger(domain.domain_name)
    logger.setLevel(logging.INFO)

    logger.handlers = []
    syslog_handler = logging.handlers.SysLogHandler(address=(domain.collector_ip,
                                                             domain.collector_port))
    syslog_formatter = logging.Formatter('%(asctime)s ' + domain.domain_name + ' %(message)s',
                                         '%b %d %H:%M:%S')
    syslog_handler.setFormatter(syslog_formatter)
    logger.addHandler(syslog_handler)

    return logger


def poll(endpoint, service, syslog):
    """ Polling and sending the logs of specific endpoint of G-Suite domain.

    Arguments:
        endpoint (DomainEndpoint): the endpoint to get the logs from.
        service (Resource): the object for interacting with the service.
        syslog (Logger): the logger to send the syslog messages with.
    """

    domain = DomainConfig.query.filter_by(id=endpoint.domain_id).first()
    if not domain.enabled:
        return

    last_timestamp = datetime.strptime(endpoint.timestamp, '%Y-%m-%dT%H:%M:%S.%fZ')

    try:
        for activities in gsuite.list_activities(service, endpoint.name, endpoint.timestamp):
            print('{} - found {} activities'.format(endpoint.name, len(activities)))

            if activities:
                timestamp = datetime.strptime(activities[0]['id']['time'], '%Y-%m-%dT%H:%M:%S.%fZ')
                if timestamp > last_timestamp:
                    last_timestamp = timestamp

            qualifiers = []
            for activity in activities:
                if activity['id']['uniqueQualifier'] in qualifiers:
                    continue
                syslog.info(json.dumps(activity))
                qualifiers.append(activity['id']['uniqueQualifier'])

        domain.status = 'active'
        endpoint.timestamp = (last_timestamp + timedelta(seconds=1)).isoformat('T') + 'Z'
    except GSuiteError:
        domain.status = 'failed'
    finally:
        db.session.commit()


def main():
    processes = []

    for domain in DomainConfig.query.all():
        try:
            service = gsuite.get_service(domain.credentials, domain.delegated_user_name)
            syslog = get_syslog(domain)

            for endpoint in filter(lambda endpoint: endpoint.enabled, domain.domain_endpoints):
                process = Process(target=poll, args=(endpoint, service, syslog))
                processes.append(process)
                process.start()
        except GSuiteError:
            domain.status = 'failed'
            db.session.commit()
            continue

    for process in processes:
        process.join()


if __name__ == '__main__':
    while True:
        main()
        time.sleep(SLEEP_TIME)
