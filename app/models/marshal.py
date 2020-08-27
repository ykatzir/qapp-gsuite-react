from marshmallow import fields, ValidationError, validates_schema, pre_load, validates

from app import marshal
from app.models.database import DomainConfig, DomainEndpoints
from app.utils import get_default_timestamp, qradar_rest


class DomainEndpointsSchema(marshal.ModelSchema):
    class Meta(marshal.ModelSchema.Meta):
        model = DomainEndpoints

    @pre_load
    def check_timestamp(self, data, **_):
        if not data.get('timestamp'):
            data['timestamp'] = get_default_timestamp()


class DomainConfigSchema(marshal.ModelSchema):
    class Meta(marshal.ModelSchema.Meta):
        model = DomainConfig
        allow_none = False

    domain_endpoints = fields.Nested(DomainEndpointsSchema,
                                     exclude=['id', 'domain_configuations'], many=True)
    delegated_user_name = fields.Email(required=True)

    @validates_schema
    def validates_blank_fields(self, data, **_):
        if not isinstance(data, dict):
            raise ValidationError('The data must be valid JSON')

        for key, value in data.iteritems():
            if isinstance(value, bool):
                continue
            if not value:
                raise ValidationError('The value must not be blank', key, data)
