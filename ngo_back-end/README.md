# NGO backend

This Flask API runs locally with MongoDB on port `27017` and serves the API on port `5001`. While AWS is disabled, uploaded project and event images are stored under `uploads/` and served by the backend.

## First-time setup

```bash
./setup_local.sh
```

## Run locally

```bash
./run_local.sh
```

The runner starts a user-owned MongoDB data directory at `data/local-db`, seeds a local head-volunteer account, and starts Flask at `http://127.0.0.1:5001`.

Local login:

- Mobile: `9999999999`
- Password: `local-admin-123`

Override these with `LOCAL_ADMIN_MOBILE` and `LOCAL_ADMIN_PASSWORD`. Disable automatic seeding with `SEED_LOCAL_ADMIN=false`.

Check readiness:

```bash
curl http://127.0.0.1:5001/api/health
```

Run the repeatable API smoke test while the backend is running:

```bash
.venv/bin/python smoke_test.py
```

For production, set a strong `SECRET_KEY`. To restore S3 uploads, set `AWS_ENABLED=true`, `AWS_BUCKET_NAME`, `AWS_REGION`, and the standard AWS credential environment variables.
