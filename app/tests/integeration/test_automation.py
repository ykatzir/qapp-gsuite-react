import os
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


def add_domain(driver, domain, url):
    driver.get(url)
    driver.find_elements_by_class_name('curve-button')[0].click()

    first_file = os.path.join(os.getcwd(), os.listdir(os.getcwd())[0])
    test_file = os.path.dirname(first_file) + 'test.json'
    inputs = [domain, '1.2.3.4', '514', test_file, 'user@user.com', False]

    driver.find_elements_by_css_selector('.shadow-this')[1].click()
    if driver.find_elements_by_css_selector('.shadow-this')[1].get_attribute("style") != '':
        return False

    form = driver.find_element_by_id('domain-form')
    i = 0
    for elm in form.find_elements_by_css_selector('input'):
        driver.execute_script('arguments[0].scrollIntoView();', elm)
        if isinstance(inputs[i], bool):
            if inputs[i]:
                elm.click()
        else:
            elm.send_keys(inputs[i])
        i += 1

    driver.find_elements_by_css_selector('.shadow-this')[1].click()
    time.sleep(1)
    if driver.find_elements_by_css_selector('.shadow-this')[1].get_attribute("style") == '':
        return False
    driver.find_elements_by_css_selector('.shadow-this')[2].click()
    return True


def helper_find_domain(driver, domain):
    trs = driver.find_element_by_id(
        'domains-table').find_elements_by_class_name('bx--parent-row')
    for row in trs:
        tds = row.find_elements_by_css_selector('td')
        if driver.execute_script('return arguments[0].innerText;', tds[2]) == domain:
            return tds


def edit_domain(driver, domain, url, new_collector):
    driver.get(url)
    # Open edit and find ID
    tds = helper_find_domain(driver, domain)
    tr_id = tds[5].find_elements_by_css_selector(
        'button')[1].get_attribute('id').split('-')[1]

    # Disable domain
    driver.execute_script(
        "arguments[0].click();", driver.find_element_by_id('toggle-{}'.format(tr_id)))

    time.sleep(3)

    # Edit collector ip and port
    tds[5].find_elements_by_css_selector('button')[0].click()
    collector = driver.find_element_by_id('collector-{}'.format(tr_id))
    collector.clear()
    collector.send_keys(new_collector)

    # Check connection
    driver.find_element_by_id('test-{}'.format(tr_id)).click()
    time.sleep(1)
    if driver.find_element_by_id('test-{}'.format(tr_id)).get_attribute('style') == '':
        return -1

    webdriver.ActionChains(driver).send_keys(Keys.ESCAPE).perform()
    time.sleep(1)

    driver.find_element_by_id('save-{}'.format(tr_id)).click()
    return tr_id


def remove_domain(driver, domain, url):
    driver.get(url)
    helper_find_domain(driver, domain)[
        5].find_elements_by_css_selector('button')[1].click()


def helper_select_domain(driver, domain):
    helper_find_domain(driver, domain)[
        1].find_elements_by_class_name('bx--checkbox-label')[0].click()
    return helper_find_domain(driver, domain)[5].find_element_by_css_selector('div').get_attribute('id').split('-')[1]


def remove_domains(driver, url, domain1, domain2):
    driver.get(url)
    # Select two domains
    helper_select_domain(driver, domain1)
    helper_select_domain(driver, domain2)
    # Click bulk remove button
    driver.execute_script('arguments[0].click()', driver.find_elements_by_css_selector(
        '.bx--action-list button')[0])


def edit_domains(driver, url, domain1, domain2, ip, port, cred, user):
    driver.get(url)
    # Select two domains
    id_1 = helper_select_domain(driver, domain1)
    id_2 = helper_select_domain(driver, domain2)
    # Open edit
    driver.execute_script('arguments[0].click()', driver.find_elements_by_css_selector(
        '.bx--action-list button')[1])
    # Check connection
    driver.find_elements_by_css_selector('.shadow-this')[4].click()
    if driver.find_elements_by_css_selector('.shadow-this')[4].get_attribute("style") != '':
        return -1, -1
    # Fill fields
    driver.find_element_by_id('host-ip-edit').send_keys(ip)
    driver.find_element_by_id('host-port-edit').send_keys(port)
    driver.find_element_by_id('file-edit').send_keys(cred)
    driver.find_element_by_id('email-edit').send_keys(user)
    # Check connection
    driver.find_elements_by_css_selector('.shadow-this')[4].click()
    time.sleep(1)
    if driver.find_elements_by_css_selector('.shadow-this')[4].get_attribute("style") == '':
        return -1, -1
    driver.find_elements_by_css_selector('.shadow-this')[5].click()
    return id_1, id_2


def test_domain(driver, client):
    assert driver['driver']

    domain = 'DOMAINNAME'
    before_add = len(client.get('/api/domain').json)

    assert add_domain(driver['driver'], domain, driver['url'])
    assert len(client.get('/api/domain').json) == before_add + 1
    edit_id = edit_domain(driver['driver'], domain,
                          driver['url'], '10.0.0.1:555')
    assert edit_id > -1
    resp = client.get('/api/domain/{}'.format(edit_id)).json
    assert resp.get('collector_port') == 555 and not resp.get('enabled')
    remove_domain(driver['driver'], domain, driver['url'])
    assert len(client.get('/api/domain').json) == before_add


def test_domains(driver, client):
    assert driver['driver']

    domain1 = 'DOMAINNAME1'
    domain2 = 'DOMAINNAME2'
    before_add = len(client.get('/api/domain').json)

    assert add_domain(driver['driver'], domain1, driver['url'])
    assert add_domain(driver['driver'], domain2, driver['url'])
    assert len(client.get('/api/domain').json) == before_add + 2
    first_file = os.path.join(os.getcwd(), os.listdir(os.getcwd())[0])
    test_file = os.path.dirname(first_file) + 'test.json'
    id_1, id_2 = edit_domains(driver['driver'], driver['url'], domain1,
                              domain2, '255.255.255.1', '555', test_file, 'NEWUSER@MAIL.COM')
    assert id_1 > -1 and id_2 > -1
    assert client.get('/api/domain/{}'.format(id_1)
                      ).json.get('collector_ip') == '255.255.255.1'
    assert client.get('/api/domain/{}'.format(id_2)
                      ).json.get('collector_ip') == '255.255.255.1'
    remove_domains(driver['driver'], driver['url'], domain1, domain2)
    time.sleep(1)
    assert len(client.get('/api/domain').json) == before_add


def test_sort_by_domain(driver, client):
    assert driver['driver']

    domain1 = 'ZZZZZZZZZZZZZ'
    domain2 = 'AAAAAAAAAAAAA'
    before_add = len(client.get('/api/domain').json)

    assert add_domain(driver['driver'], domain1, driver['url'])
    assert add_domain(driver['driver'], domain2, driver['url'])
    assert len(client.get('/api/domain').json) == before_add + 2

    driver['driver'].get(driver['url'])
    time.sleep(1)

    first = int(driver['driver'].find_elements_by_class_name(
        'bx--parent-row')[0].get_attribute('id').split('-')[1])
    second = int(driver['driver'].find_elements_by_class_name(
        'bx--parent-row')[1].get_attribute('id').split('-')[1])
    assert first < second

    driver['driver'].find_element_by_id('domain_name').click()

    first = int(driver['driver'].find_elements_by_class_name(
        'bx--parent-row')[0].get_attribute('id').split('-')[1])
    second = int(driver['driver'].find_elements_by_class_name(
        'bx--parent-row')[1].get_attribute('id').split('-')[1])
    assert first > second

    remove_domains(driver['driver'], driver['url'], domain1, domain2)
