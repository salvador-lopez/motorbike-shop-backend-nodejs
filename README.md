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
All the test suites:
```bash
docker compose exec api npm test
```

Only a specific the test suite:
```bash
docker compose exec api npm run test:unit
docker compose exec api npm run test:integration
docker compose exec api npm run test:acceptance
```

### debug
If you use Webstorm you can run/debug the motorbike shop api using [this Run Configuration](https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/.idea/runConfigurations/run_motorbike_api.xml)
More info [here](https://www.jetbrains.com/help/webstorm/run-debug-configuration-node-js-remote-debug.html)

```mermaid
flowchart TD
 subgraph subGraph1["UI (REST API)"]
        CustomerRoute["Customer Route"]
        HealthzRoute["Healthz Route"]
        SwaggerDoc["Swagger API Documentation"]
  end
 subgraph subGraph2["Express Application"]
        Server["Server (Express Setup)"]
        App["App"]
        CustomerService["Customer Service"]
  end
 subgraph subGraph4["TypeORM Implementation with SQlite"]
        CustomerRepository["Customer Repository"]
        DataModel["Data Model"]
        DataSource["Data Source"]
        CustomerRepositoryTest["Customer Repository Test"]
  end
 subgraph subGraph5["Database Layer"]
        subGraph4
        DatabaseErrors["Database Errors"]
  end
 subgraph s1["Local Deployment"]
        DockerCompose["Docker Compose"]
  end
    CustomerRoute -- routes --> Server
    HealthzRoute -- routes --> Server
    Server -- initializes --> App
    App -- delegates --> CustomerService
    CustomerService -- invokes --> CustomerDomain["Customer Domain"] & CommonDomain["Common Domain"]
    CustomerDomain -- persists --> CustomerRepository
    CustomerRepository -- connects --> DataSource
    CustomerRepository -- maps --> DataModel
    CustomerRepository -- handlesErrors --> DatabaseErrors
    CustomerRepository -- testedBy --> CustomerRepositoryTest
    SwaggerDoc -- documents --- CustomerRoute & HealthzRoute
    DockerCompose -- deploys --- Server
     CustomerRoute:::api
     HealthzRoute:::api
     SwaggerDoc:::apidoc
     Server:::service
     App:::service
     CustomerService:::service
     CustomerRepository:::database
     DataModel:::database
     DataSource:::database
     CustomerRepositoryTest:::database
     DatabaseErrors:::database
     DockerCompose:::deployment
     CustomerDomain:::domain
     CommonDomain:::domain
    classDef client fill:#AEDFF7,stroke:#1E88E5,stroke-width:2px
    classDef api fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    classDef apidoc fill:#FFF59D,stroke:#F9A825,stroke-width:2px
    classDef service fill:#FFCCBC,stroke:#D84315,stroke-width:2px
    classDef domain fill:#F8BBD0,stroke:#C2185B,stroke-width:2px
    classDef database fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    classDef deployment fill:#D7CCC8,stroke:#5D4037,stroke-width:2px
    click CustomerRoute "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/routes/customer.ts"
    click HealthzRoute "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/routes/healthz.ts"
    click SwaggerDoc "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/swagger.ts"
    click Server "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/server.ts"
    click App "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/app.ts"
    click CustomerService "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/services/customer.ts"
    click CustomerRepository "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/database/typeorm/customer-repository.ts"
    click DataModel "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/database/typeorm/data-model.ts"
    click DataSource "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/database/typeorm/data-source.ts"
    click CustomerRepositoryTest "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/database/typeorm/customer-repository.integration.test.ts"
    click DatabaseErrors "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/database/errors.ts"
    click DockerCompose "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/docker-compose.yaml"
    click CustomerDomain "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/domain/customer.ts"
    click CommonDomain "https://github.com/salvador-lopez/motorbike-shop-backend-nodejs/blob/main/src/domain/common.ts"