# Time Tracking API

<img align="right" width="128" src="https://user-images.githubusercontent.com/479339/74610686-49244e80-50aa-11ea-8a3d-dd4a11856d6c.png">

![build](https://github.com/BryanMorgan/time-tracking-app/workflows/build/badge.svg?branch=main&event=push)

Reference React app for tracking time, projects, and tasks. App leverages the [Golang Time Tracking API](https://github.com/BryanMorgan/time-tracking-app).

# Starting
```
npm start
```

## Notes
Relies on the `REACT_APP_API_URL` process environment variable (set in .env.development) to connect to the Time Tracking API.

## Production Mode
```
NODE_ENV=production npm start
```

Ensure the `REACT_APP_API_URL` process environment variable is set for the production API.

