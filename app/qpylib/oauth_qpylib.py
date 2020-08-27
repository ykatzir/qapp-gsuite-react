#!/usr/bin/python

# (C) Copyright IBM Corp. 2015, 2016
# The source code for this program is not published or
# otherwise divested of its trade secrets, irrespective of
# what has been deposited with the US Copyright Office.

import requests

def get_oauth_headers():
    o_headers = {}
    #change HARDCODED SEC
    o_headers['SEC'] = 'hardcodesec'
    o_headers['Content-Type'] = 'application/json'
    return o_headers

def get_oauth_token(o_headers):
    client_id = get_client_id()
    client_secret = get_client_secret()
    port = get_port()
    res = requests.get('http://qoauth.service.consul:' + port + '/token?grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_secret, headers=o_headers, verify=False)
    print 'res', res.status_code
    print 'res', res.json()
    token_res = res.json()
    access_token = token_res["access_token"]
    print 'token', access_token
    return access_token

def get_client_id():
    #change HARDCODED client id
    return 'QRadar_App_1154'

def get_client_secret():
    #change HARDCODED client secret
    return 'SUoL2XiHmremlQC-UXOPcqzBxmt3c7aanPUbXux80ryPzMNGsXs7HGzBKbGYIxxhVvjcN8GUVm_V5In64ZFs8A'

def get_port():
    #change HARDCODED port
    return str(9090)

def is_token_valid(a_token, o_headers):
    #change HARDCODED introspect secret - is client id always QRadarIntrospect
    introspect_client_id = 'QRadarIntrospect'
    introspect_secret = 'AKicVe_V3vwva374LOQA5r8ZuqNJSMExHUQl7xEuzElLWsvoYPSCTXgL2zb-DoPQ3ESriCW_e1r9Jr0ZSPFYQNQ'
    port = get_port()
    res = requests.get('http://qoauth.service.consul:' + port + '/introspect?client_id=' + introspect_client_id + '&client_secret=' + introspect_secret + '&token=' + a_token, headers=o_headers, verify=False)
    print 'res', res.status_code
    print 'res', res.json()
    intro_res = res.json()
    valid = intro_res["active"]
    return valid
