# Time Tracking API

<img align="right" width="128" src="https://user-images.githubusercontent.com/479339/74610686-49244e80-50aa-11ea-8a3d-dd4a11856d6c.png">

![CI](https://github.com/BryanMorgan/time-tracking-app/workflows/CI/badge.svg)

Reference app for tracking time, projects, and tasks. Built with React. App leverages the [Golang Time Tracking API](https://github.com/BryanMorgan/time-tracking-app).

<img width="896" src="https://user-images.githubusercontent.com/479339/97118294-6c39e000-16c6-11eb-9a13-baefeb8e2cfa.png">





# Starting
To start the app make sure dependencies are installed:
```
npm install
```

and run
```
npm start
```
which will start the app on [localhost:1234](http://localhost:1234)

### Notes
The client uses the `REACT_APP_API_URL` process environment variable (set in .env.development) to connect to the Time Tracking API.

## Production Mode
To build a production build run `npm build` or start with the production `NODE_ENV` set:

```
NODE_ENV=production npm start
```
Ensure the `REACT_APP_API_URL` process environment variable is set for the production API.

