import json
import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen


base_url = os.getenv('API_BASE_URL', 'http://127.0.0.1:5001')
tenant_headers = {'X-Tenant-ID': 'localhost'}


def request_json(path, method='GET', payload=None, headers=None):
    request_headers = {'Content-Type': 'application/json', **tenant_headers, **(headers or {})}
    body = json.dumps(payload).encode() if payload is not None else None
    request = Request(f'{base_url}{path}', data=body, headers=request_headers, method=method)
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read() or b'{}')
    except HTTPError as error:
        response_body = json.loads(error.read() or b'{}')
        raise AssertionError(f'{method} {path} failed: {error.code} {response_body}') from error


def assert_status(response, expected=200):
    status_code, body = response
    assert status_code == expected, (status_code, body)
    assert body.get('status') is True, body
    return body


health = assert_status(request_json('/api/health'))
assert health['database'] == 'connected'
assert health['storage'] == 'local'

login = assert_status(request_json(
    '/api/login',
    method='POST',
    payload={
        'username': os.getenv('LOCAL_ADMIN_MOBILE', '9999999999'),
        'password': os.getenv('LOCAL_ADMIN_PASSWORD', 'local-admin-123'),
    },
))
auth_headers = {'Authorization': f"Token {login['token']}"}

upload = assert_status(request_json(
    '/api/generate-presigned-url',
    method='POST',
    payload={'key': 'projects/smoke-test/images/proof.txt'},
))
upload_request = Request(
    upload['url'],
    data=b'local upload works',
    headers={'Content-Type': 'text/plain'},
    method='PUT',
)
with urlopen(upload_request, timeout=5) as upload_response:
    assert upload_response.status == 200
with urlopen(upload['url'], timeout=5) as download_response:
    assert download_response.read() == b'local upload works'

project = assert_status(request_json(
    '/api/projects/create-project',
    method='POST',
    payload={
        'name': 'Local smoke-test project',
        'title': 'Local smoke-test project',
        'start': '2026-09-11',
        'end': '2026-09-11',
        'address': 'Local development',
        'description': 'Temporary record created by smoke_test.py',
        'images': [upload['url']],
        'projectImagesId': 'smoke-test',
    },
    headers=auth_headers,
), expected=201)
project_id = project['project_id']
assert_status(request_json(f'/api/projects/get-project/{project_id}'))
assert_status(request_json(
    f'/api/projects/delete-project/{project_id}',
    method='DELETE',
    headers=auth_headers,
))

event = assert_status(request_json(
    '/api/events/create-event',
    method='POST',
    payload={
        'name': 'Local smoke-test event',
        'title': 'Local smoke-test event',
        'start': '2026-09-11',
        'end': '2026-09-11',
        'address': 'Local development',
        'description': 'Temporary record created by smoke_test.py',
        'images': [],
        'eventImagesId': 'smoke-test',
    },
    headers=auth_headers,
), expected=201)
event_id = event['event_id']
assert_status(request_json(f'/api/events/get-event/{event_id}'))
assert_status(request_json(
    f'/api/events/delete-event/{event_id}',
    method='DELETE',
    headers=auth_headers,
))

volunteers = assert_status(request_json('/api/volunteers/get-volunteers'))
assert all('password' not in volunteer for volunteer in volunteers['volunteers'])

print('Backend smoke test passed: health, auth, local upload, projects, events, and safe volunteer responses.')
