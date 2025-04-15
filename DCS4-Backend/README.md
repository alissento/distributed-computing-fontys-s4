Create an empty postgresql database with a user, application will create the tables.

Example .env
For development only set SPRING_PROFILE=dev and edit the application-dev.properties
```
SPRING_PROFILE=prod

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=dcs4
DB_USER=dcs4
DB_PASSWORD=dcs4pass

JWT_SECRET=1P3BtzxdaWrueOgdLcXIJLUUhP6RA3BlPF128PYrZzF2JBQ2pzB2WWMuGQc0BSg6

FRONTEND_BASE_URL=http://localhost:5173
SERVER_PORT=8080

```