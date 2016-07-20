import { createStore } from 'redux'
import app from '../reducers/app'

const store = createStore(app)
export default store
