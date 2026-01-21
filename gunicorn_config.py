# Gunicorn configuration file
# Use with: gunicorn -c gunicorn_config.py app:app

bind = "127.0.0.1:8001"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Logging
accesslog = "/var/log/rideapp-backend/access.log"
errorlog = "/var/log/rideapp-backend/error.log"
loglevel = "info"

# Process naming
proc_name = "rideapp-backend"

