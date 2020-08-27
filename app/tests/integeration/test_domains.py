def test_list_domains(client):
    """ Testing list domains API """

    assert isinstance(client.get('/api/domain').json, list)


def test_valid_single_domain(client):
    """
    Testing create (POST), update (PUT) and delete (DELETE)
    for single domain API.
    """

    # creating a new domain
    domain = dict(domain_name='test', delegated_user_name='user@user.com',
                  credentials='1234',
                  collector_ip='8.8.8.8', collector_port=514,
                  status='configured', enabled=True)
    resp = client.post('/api/domain', json=domain)

    assert resp.status_code == 201, 'Failed to create a new domain {}'.format(resp.json)
    assert all(resp.json[0].get(field) == value for field, value in domain.items())

    # updating the new domain
    resp = client.put('/api/domain/{}'.format(resp.json[0]['id']),
                        json={'id': resp.json[0]['id'], 'status': 'Active'})
    assert resp.status_code == 200, 'Failed to update a domain: {}'.format(resp.json)

    # deleting the domain
    resp = client.delete('/api/domain/{}'.format(resp.json['id']))
    assert resp.status_code == 204


def test_valid_domains(client):
    """
    Testing create (POST), update (PUT) and delete (DELETE)
    for multiple domains API (bulk).
    """

    domains = []

    # creating new domains
    for i in range(5):
        domain = dict(domain_name='test {}'.format(i),
                      delegated_user_name='user@user.com',
                      credentials='1234',
                      collector_ip='8.8.8.8', collector_port=514,
                      status='configured', enabled=True)
        resp = client.post('/api/domain', json=domain)
        assert resp.status_code == 201, 'Failed to create a new domain: {}'.format(resp.json)
        domains.append(resp.json[0])

    # updating the new domains
    for domain in domains:
        domain['collector_ip'] = '1.1.1.1'
        domain['domain_endpoints'] = [
            {'name': 'login', 'enabled': False},
            {'name': 'admin', 'enabled': False},
            {'name': 'calendar', 'enabled': False},
            {'name': 'chat', 'enabled': False},
            {'name': 'drive', 'enabled': False},
            {'name': 'jamboard', 'enabled': False},
            {'name': 'meet', 'enabled': False},
            {'name': 'mobile', 'enabled': False},
            {'name': 'gplus', 'enabled': False},
            {'name': 'rules', 'enabled': False},
            {'name': 'saml', 'enabled': False},
            {'name': 'token', 'enabled': False},
            {'name': 'user_accounts', 'enabled': False}
        ]

    resp = client.put('/api/domain', json=domains)
    assert resp.status_code == 200, 'Failed to update the domains: {}'.format(resp.json)
    assert all(map(lambda d: d['collector_ip'] == '1.1.1.1', domains))

    # deleting the domains
    resp = client.delete('/api/domain?domain_ids=' + ','.join(map(lambda d: str(d['id']), domains)))
    assert resp.status_code == 204, 'Failed to delete domains: {}'.format(resp.json)
