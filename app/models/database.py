from app import db


class DomainConfig(db.Model):
    __tablename__ = 'domain_configurations'

    id = db.Column(db.Integer, primary_key=True)
    domain_name = db.Column(db.String, unique=True, nullable=False)
    delegated_user_name = db.Column(db.String, nullable=False)
    collector_ip = db.Column(db.String, nullable=False)
    collector_port = db.Column(db.Integer, nullable=False)
    credentials = db.Column(db.Text, nullable=False)
    status = db.Column(db.String, nullable=False, default='configured')
    enabled = db.Column(db.Boolean, nullable=False, default=True)

    domain_endpoints = db.relationship('DomainEndpoints', single_parent=True,
                                       backref=db.backref('domain_configurations', lazy='joined'))


class DomainEndpoints(db.Model):
    __tablename__ = 'domain_endpoints'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.String, nullable=False)
    enabled = db.Column(db.Boolean, nullable=False)

    domain_id = db.Column(db.Integer, db.ForeignKey('domain_configurations.id'))
