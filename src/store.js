import { applyMiddleware, combineReducers, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import authenticate from './reducer/authenticate'
import tasks from './reducer/tasks'

const reducers = combineReducers({
    authenticate,
    tasks,
})

const logger = createLogger({
    predicate: () => import.meta.env.PROD === false
});

const store = createStore(
    reducers,
    applyMiddleware(logger)
);

export default store