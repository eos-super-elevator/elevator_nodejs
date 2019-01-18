import { combineReducers } from 'redux'
import doorsReducer from './doorsReducer'
import elevatorReducer from './elevatorReducer'

const rootReducer = combineReducers({
  doors: doorsReducer,
  elevator: elevatorReducer
})

export default rootReducer
