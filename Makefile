.PHONY: install dev seed test start docker-up docker-down

install:
	cd backend && npm install

dev:
	cd backend && npm run dev

seed:
	cd backend && npm run seed

test:
	cd backend && npm test

start:
	cd backend && npm start

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
