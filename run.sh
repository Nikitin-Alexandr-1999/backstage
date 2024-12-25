#!/bin/bash
echo '0.0.0.0 backstage.dp.lab.yandexcloud.net' >> /etc/hosts

source .env

docker run -d --rm -p 5432:5432 --name backstage_postgres -e POSTGRES_USER=bs_admin -e POSTGRES_PASSWORD=bs_admin_password postgres:14
docker stop backstage_postgres
yarn dev
