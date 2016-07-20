import { combineReducers } from 'redux'
import auth from './auth'
import devices from './devices'

const app = combineReducers({
  auth,
  devices
})

export default app
