function getInitialState () {
  let session
  let session_text = window.sessionStorage.getItem('session')

  if (session_text !== null) {
    try {
      session = JSON.parse(session_text)
    } catch(e) {
      console.error(e)
    }
  }

  return {
    status: 'none',
    email: null,
    password: null,
    session: session
  }
}

function reducer (state, action) {
  if (state === undefined) { return getInitialState() }

  switch (action.type) {
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        status: 'good'
      }
    case 'SIGNUP_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error
      }
    case 'SIGNUP_ATTEMPT':
      return {
        ...state,
        status: 'waiting',
        email: action.email
      }
    case 'CHANGE_PASSWORD_SUCCESS':
      return {
        ...state,
        status: 'good'
      }
    case 'CHANGE_PASSWORD_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error
      }
    case 'CHANGE_PASSWORD_ATTEMPT':
      return {
        ...state,
        status: 'waiting',
        password: action.password
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        status: 'good',
        session: action.session,
        error: undefined
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error
      }
    case 'LOGIN_ATTEMPT':
      return {
        ...state,
        status: 'waiting',
        email: action.email,
        password: action.password
      }
    case 'LOGOUT':
      return {
        status: 'none'
      }
    default:
      return state
  }
}

export default reducer
