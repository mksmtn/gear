# Test task

## Start the server

You need an instance of MongoDB running at `mongodb://mongodb:27017`. If you use VS Code, just open the folder in [Dev Container](https://containers.dev/) and it will start MongoDB for you.

```bash
npm i -g @nestjs/cli
npm i --legacy-peer-deps

npm run start:dev
```

## API

```bash
# Send a Pong message
curl -X POST http://localhost:3000

# Get stats
curl http://localhost:3000

# Drop the database
curl -X DELETE http://localhost:3000
```
