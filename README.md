# motorbike-shop-backend-nodejs
This project holds all the backend business logic and all the UIs (i.e. API REST) needed to create a motorbike shop

## dev environment
### pre-requisites
- Install [docker](https://www.docker.com/get-started/) in your local machine.
- Have [docker compose](https://docs.docker.com/compose/install/) installed and running.

### setup & run the motorbike-shop REST api
Init the needed docker containers from you project root dir:

```bash
docker compose up -d
docker compose exec -it api sh
npm install
npm run dev
```
then you can access the api in http://localhost:3000/api

and the swagger api doc in http://localhost:3000/api-docs

### running tests
```bash
docker compose run api npm test
```
### debug
If you use Webstorm you can run/debug the motorbike shop api using [this Run Configuration](https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/.idea/runConfigurations/run_motorbike_api.xml)
More info [here](https://www.jetbrains.com/help/webstorm/run-debug-configuration-node-js-remote-debug.html)