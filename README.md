# motorbike-shop-backend-nodejs
This project holds all the backend business logic and all the UIs (i.e. API REST) needed to create a motorbike shop

## dev environment
### pre-requisites
- Install [docker](https://www.docker.com/get-started/) in your local machine.
- Have [docker compose](https://docs.docker.com/compose/install/) installed and running.

### setup & run the motorbike-shop-customer REST api
Init the needed docker containers from you project root dir:

```bash
docker compose up -d
docker compose exec -it api sh
npm install
npm run dev
```
then you can access the api in http://localhost:3000