# Time Tracking API

<img align="right" width="128" src="https://user-images.githubusercontent.com/479339/74610686-49244e80-50aa-11ea-8a3d-dd4a11856d6c.png">

![CI](https://github.com/BryanMorgan/time-tracking-app/workflows/CI/badge.svg)

Reference app for tracking time, projects, and tasks. Built with React. Leverages the [Golang Time Tracking API](https://github.com/BryanMorgan/time-tracking-api).

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
which will start the app on [localhost:3000](http://localhost:3000)

### Notes
The app relies on the a `VITE_REACT_APP_API_URL` environment variable to connect to the Time Tracking API. The default of http://localhost:8000 is set in the `.env.development` configuration file.

## Production Mode
To build production assets run:

```
npm run build
``` 

And then open `./dist/index.html` using a web server. For example:

```
cd dist
npx serve
```

Ensure the `VITE_REACT_APP_API_URL` environment variable is set for the production API.

