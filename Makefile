ENV_FILE=.env
ENV_LOCAL_FILE=.env.test.local
ENV_LOCAL_PRODUCTION_FILE=.env.production
ENV_BACKUP_FILE=.env.backup

backup-env:
	@echo "Backing up $(ENV_FILE)..."
	@if [ -f $(ENV_FILE) ]; then cp $(ENV_FILE) $(ENV_BACKUP_FILE); fi
	@echo "Overwriting $(ENV_FILE) with $(ENV_LOCAL_FILE)..."
	cp $(ENV_LOCAL_FILE) $(ENV_FILE)

backup-env-production:
	@echo "Backing up $(ENV_FILE)..."
	@if [ -f $(ENV_FILE) ]; then cp $(ENV_FILE) $(ENV_BACKUP_FILE); fi
	@echo "Overwriting $(ENV_FILE) with $(ENV_LOCAL_PRODUCTION_FILE)..."
	cp $(ENV_LOCAL_PRODUCTION_FILE) $(ENV_FILE)

restore-env:
	@echo "Restoring original $(ENV_FILE)..."
	@if [ -f $(ENV_BACKUP_FILE) ]; then mv $(ENV_BACKUP_FILE) $(ENV_FILE); fi
	@echo " Done."

run-acceptance:
	@echo "Running acceptance tests..."
	npm run test:acceptance

run-unit:
	@echo "Running unit tests..."
	npm run test:unit

run-integration:
	@echo "Running integration tests..."
	npm run test:integration

run-build:
	@echo "Running integration tests..."
	- npm run build

run-start:
	@echo "Running app with dev mode"
	- npm run start

acceptance: backup-env run-acceptance restore-env

unit: backup-env run-unit restore-env

integration: backup-env run-integration restore-env

all-tests: backup-env run-unit run-acceptance run-integration restore-env

build-start: backup-env-production run-build run-start