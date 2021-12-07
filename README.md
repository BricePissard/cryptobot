## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
$ docker-compose up dev
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ docker-compose up prod
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## GitHub Settings

## GKE Settings

The container is published in Google Kubernetes Engine (GKE).
A YAML file place in ./github/workflow/google.yml
explain how to publish the app.
Each time a GIT push is set on branch `main`

- <https://console.cloud.google.com/iam-admin/serviceaccounts?project=cryprobot&supportedpurview=project>
- <https://github.com/BricePissard/cryptobot/settings/secrets/actions>
- <https://console.cloud.google.com/kubernetes/list/overview?project=cryprobot>

### Command Line

```bash
gcloud container clusters list --project cryprobot
gcloud container clusters describe cluster-cryptobot --zone europe-west1-b
```

## License

Nest is [MIT licensed](LICENSE).
