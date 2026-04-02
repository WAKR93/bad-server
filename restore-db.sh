#!/usr/bin/env bash

docker exec -i sp17_badserver-mongo-1 sh -c "mongoimport -c users --jsonArray --uri=mongodb://root:example@localhost/weblarek?authSource=admin" < .dump/weblarek.users.json
docker exec -i sp17_badserver-mongo-1 sh -c "mongoimport -c products --jsonArray --uri=mongodb://root:example@localhost/weblarek?authSource=admin" < .dump/weblarek.products.json