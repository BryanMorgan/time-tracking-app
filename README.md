# Time Tracking API

<img align="right" width="128" src="https://user-images.githubusercontent.com/479339/74610686-49244e80-50aa-11ea-8a3d-dd4a11856d6c.png">

![CI](https://github.com/BryanMorgan/time-tracking-app/workflows/CI/badge.svg)

Reference app for tracking time, projects, and tasks. Built with React, the reference app leverages the [Golang Time Tracking API](https://github.com/BryanMorgan/time-tracking-app).


<img align="left" width="133" src="https://user-images.githubusercontent.com/479339/96385971-45baf880-114c-11eb-8cbd-968c9330544c.png">
<img align="left"  width="400" src="https://user-images.githubusercontent.com/479339/96385942-0be9f200-114c-11eb-8028-d4dd9cd69ed4.png">
<img width="300" src="https://user-images.githubusercontent.com/479339/96386268-66844d80-114e-11eb-8c6d-6b5c0e84a34f.png">
<img align="left" width="350" src="https://user-images.githubusercontent.com/479339/96385864-81a18e00-114b-11eb-9bf8-7580defb3c31.png">
<img width="150" src="https://user-images.githubusercontent.com/479339/96386347-1659bb00-114f-11eb-9f40-7db19c8db4ec.png">




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

