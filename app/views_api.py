import time
from flask import request
from werkzeug.exceptions import NotFound, BadRequest
from flask_restplus import Resource, reqparse

from app import api, db
from app.models.database import DomainConfig
from app.models.marshal import DomainConfigSchema
from app.utils import marshal_with, handle_validation, handle_sqlalchemy, handle_qradar
from app.utils import get_default_timestamp, qradar_rest
from app.models.gsuite import get_service, list_activities
from app.errors import GSuiteError

from qpylib.qpylib import log


NOT_FOUND_MESSAGE = 'The config {} was not found.\n'
DOMAIN_SCHEMA = DomainConfigSchema(strict=True)
LOG_SOURCE_NAME = 'G-Suite'


@api.route('/domain')
class ConfigAPI(Resource):
    @marshal_with(DOMAIN_SCHEMA, many=True)
    def get(self):
        """Get all G-Suite domain configurations of the application."""

        domain_ids = self.bulk_config_parser('args').parse_args().get('domain_ids')
        sort = self.bulk_config_parser('args').parse_args().get('sort')
        desc = self.bulk_config_parser('args').parse_args().get('desc')

        if sort and not hasattr(DomainConfig, sort):
            raise BadRequest('Invalid field to sort by.')

        if not domain_ids:
            res = DomainConfig.query
        else:
            res = DomainConfig.id.in_(domain_ids)
        if not sort:
            return res.all()
        if desc:
            return res.order_by(getattr(DomainConfig, sort).desc())
        return res.order_by(getattr(DomainConfig, sort))

    @marshal_with(DOMAIN_SCHEMA)
    @handle_validation
    @handle_sqlalchemy
    def post(self):
        """Create a new G-Suite domain configuration."""
        domain, _ = DOMAIN_SCHEMA.load(request.json)

        if DomainConfig.query.filter_by(domain_name=request.json.get('domain_name')).first():
            raise ValidationError('The value must be unique', 'domain_name', request.json.get('domain_name'))

        db.session.add(domain)
        db.session.commit()

        return domain, 201

    @handle_validation
    @marshal_with(DOMAIN_SCHEMA, many=True)
    @handle_sqlalchemy
    @api.doc('Update existing G-Suite domain configurations.')
    def put(self):
        """Update existing G-Suite domain configurations."""

        config_input = request.json if isinstance(request.json, list) else [request.json]

        new_domains, _ = DOMAIN_SCHEMA.load(config_input, many=True, partial=True,
                                            session=db.session)
        for new_domain in new_domains:
            DomainConfig.query.get_or_404(new_domain.id, NOT_FOUND_MESSAGE.format(new_domain.id))
        db.session.commit()

        return new_domains

    @handle_sqlalchemy
    def delete(self):
        """Delete existing domains."""

        domain_ids = [int(domain_id) for domain_id in request.args.get('domain_ids', '').split(',')]
        DomainConfig.query.filter(DomainConfig.id.in_(domain_ids)).delete(synchronize_session=False)
        db.session.commit()

        return '', 204

    @staticmethod
    def bulk_config_parser(location):
        parser = reqparse.RequestParser()
        parser.add_argument('domain_ids', type=list, required=False, location=location,
                            help='The identifiers of all configs')
        parser.add_argument('sort', type=str, required=False, location=location,
                            help='The column to sort the results by')
        parser.add_argument('desc', type=bool, required=False, location=location,
                            help='Show results in descening order or not')
        return parser


@api.route('/domain/<int:conf_id>')
class ConfigIdAPI(Resource):
    @marshal_with(DOMAIN_SCHEMA)
    def get(self, conf_id):
        """Get a certain domain configuration by an id."""

        return DomainConfig.query.get_or_404(conf_id, NOT_FOUND_MESSAGE.format(conf_id))

    @marshal_with(DOMAIN_SCHEMA)
    @handle_validation
    @handle_sqlalchemy
    def put(self, conf_id):
        """Update a certain domain configuration by an id."""

        args = request.json
        args['id'] = conf_id

        DomainConfig.query.get_or_404(conf_id)

        domain, _ = DOMAIN_SCHEMA.load(args, partial=True, session=db.session)
        db.session.commit()

        return domain

    @handle_sqlalchemy
    def delete(self, conf_id):
        """Delete a certain domain configuration by an id."""

        config = DomainConfig.query.get_or_404(conf_id, NOT_FOUND_MESSAGE.format(conf_id))

        for endpoint in config.domain_endpoints:
            db.session.delete(endpoint)

        db.session.delete(config)
        db.session.commit()

        return '', 204


@api.route('/connection')
class Connection(Resource):
    @handle_validation
    def post(self):
        """Check if the connection to some domain is valid."""

        domain, _ = DOMAIN_SCHEMA.load(request.json, partial=('domain_name', 'domain_endpoints', 'collector_ip', 'collector_port'))

        try:
            service = get_service(domain.credentials, domain.delegated_user_name)
            next(list_activities(service, 'login', get_default_timestamp()))
            return {'status': 'success', 'message': 'The connection was successfully established'}
        except GSuiteError as err:
            return {'status': 'failed', 'message': str(err)}, 406


@api.route('/search')
class SearchAPI(Resource):
    @handle_qradar
    def post(self):
        """Execute a search inside QRadar."""

        if not request.json or not request.json.get('query'):
            raise BadRequest('query parameter is missing')

        search = qradar_rest('POST', 'ariel/searches',
                             params={'query_expression': request.json['query']})

        while search['status'] != 'COMPLETED':
            search = qradar_rest('GET', 'ariel/searches/{}'.format(search['cursor_id']))
            time.sleep(3)

        return qradar_rest('GET', 'ariel/searches/{}/results'.format(search['cursor_id']))


@api.route('/offenses')
class OffensesAPI(Resource):
    @handle_qradar
    def get(self):
        """Pull offenses from QRadar."""

        gsuite_rule_ids = [108405, 108505, 108555, 108655, 108705]
        gsuite_keywords = ['google', 'gsuite', 'g-suite']

        offenses = qradar_rest('GET', 'siem/offenses')
        filtered = list()
        for offense in offenses:
            added = False
            for rule in offense.get('rules'):
                if rule.get('id') in gsuite_rule_ids:
                    filtered.append(offense)
                    added = True
                    break
            if added:
                continue
            for keyword in gsuite_keywords:
                if keyword in offense.get('description').lower():
                    filtered.append(offense)
                    break
        return filtered


@api.route('/logsource/<string:domain>')
class LogsourceAPI(Resource):
    @handle_qradar
    def post(self, domain):
        """Pull offenses from QRadar."""

        resp = qradar_rest('GET', 'config/event_sources/log_source_management/log_source_types',
                              params={'filter': 'name="{}"'.format(LOG_SOURCE_NAME)})
        log(str(resp), 'info')
        if len(resp) < 1:
            raise BadRequest('No {} log source type was found.'.format(LOG_SOURCE_NAME))
        type_id = resp[0].get('id')

        log_source_data = {
            'name': '{}-{}'.format(LOG_SOURCE_NAME, domain),
            'description': '{}-{}'.format(LOG_SOURCE_NAME, domain),
            'protocol_parameters': [{
                'id': 0,
                'name': 'identifier',
                'value': domain
            }],
            'protocol_type_id': 0,
            'type_id': type_id,
            'enabled': True,
            'store_event_payload': True,
            'gateway': False,
            'requires_deploy': True,
            'coalesce_events': False
        }
        return qradar_rest('POST', 'config/event_sources/log_source_management/log_sources',
                            json=log_source_data)