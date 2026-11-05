# ECS architecture
- Web: `edmp-web`, ALB/TG, port 8000.
- Worker: `edmp-worker`, private, no ALB/Route53/certificate; DEV/DEMO/QA=1, STAGE/PROD=2.
- Beat: `edmp-beat`, private, desired count exactly 1, no ALB/Route53/certificate.
- Migration: `edmp-migration`, on-demand, `python manage.py migrate --noinput`.
