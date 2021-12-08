![](https://github.com/BricePissard/cryptobot/workflows/Build%20&%20Tests/badge.svg)
## Description

containerized Serverless crypto trading API designed to be used with indicator webhooks designed to be primarily run on Google Cloud Platform [(Cloud Run)](https://cloud.google.com/run). No centralized database required. You take control of all your API keys. Easily customizable to support various exchanges..

## System diagram and example use cases

![system diagram](https://storage.googleapis.com/gcp-cryptobot/v013diagram.png)

## Installation

```bash
yarn install
```

## Starting development environment & Installation

```bash
$ docker-compose up -d
$ docker-compose exec app yarn install
```

## Running the app

```bash
# development
$ docker-compose exec app yarn start:dev

# production
$ docker-compose exec app yarn start
```

## Test

```bash
# unit tests
$ docker-compose exec app yarn test
```

## Additional resources & tutorials

- [Cloud Run community FAQs](https://github.com/ahmetb/cloud-run-faq)
- [I wrote a serverless app to automate my cryptocurrency purchases on GCP](https://medium.com/coinmonks/i-wrote-a-serverless-app-to-automate-my-cryptocurrency-purchases-17c9a869d0c7)
- [Setup guide: Automate DCA and plan for liquidation wicks with gcp-cryptobot](https://medium.com/coinmonks/setup-guide-automate-dca-and-plan-for-liquidation-wicks-with-gcp-cryptobot-32414ef72251)
- [Setup guide: Automate buy on Tradingview signals with gcp-cryptobot](https://medium.com/coinmonks/setup-guide-automate-buy-on-tradingview-signals-with-gcp-cryptobot-a6941b70924)

## Running the app

```bash
# development
$ docker-compose up dev
# or
$ yarn start

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

- <https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-google-kubernetes-engine>
- <https://github.com/google-github-actions/setup-gcloud/tree/master/example-workflows/gke-kustomize>
- <https://github.com/BricePissard/cryptobot/settings/secrets/actions>

## GKE Settings

The container is published in Google Kubernetes Engine (GKE).
A YAML file place in ./github/workflow/google.yml
explain how to publish the app.
Each time a GIT push is set on branch `main`

- <https://console.cloud.google.com/iam-admin/serviceaccounts?project=cryprobot&supportedpurview=project>
- <https://console.cloud.google.com/kubernetes/list/overview?project=cryprobot>

### Command Line

```bash
gcloud container clusters list --project cryprobot
gcloud container clusters describe cluster-cryptobot --zone europe-west1-b
```

### Cloud Scheduler

- <https://console.cloud.google.com/cloudscheduler?project=cryprobot>

## License

Nest is [MIT licensed](LICENSE).
