# Backend Structure

## Layout

- `app/`: Flask application package.
- `app/routes/`: HTTP endpoints grouped by feature.
- `app/models/`: MongoDB data access helpers.
- `app/services/`: business logic, analytics, CSV parsing, and price comparison.
- `app/utils/`: shared utility helpers.
- `app/data/`: bundled JSON data used by services.
- `tests/`: pytest suite.
- `scripts/`: one-off maintenance and demo scripts.
- `run.py`: local entrypoint for running the backend server.

## Commands

- Run the backend: `python run.py`
- Run tests: `python -m pytest -q`
- Seed the demo user: `python scripts/seed_demo_user.py`
