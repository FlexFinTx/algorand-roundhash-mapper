# Algorand RoundHash Mapper

A worker service which maps Algorand block hashes to block numbers and saves them in a Mongo database

## Installation Instructions

### Prerequisites

- NodeJS
- Docker and Docker Compose

### Setup

- Clone the project
- Run `npm install` to initialize the dependencies and type definitions (Optional)
- Run `docker-compose build` to build the image
- Run `docker-compose up` to start the worker and database
