export function requestStates (auth) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_REQUEST_STATES'
    })
  }
}

export function requestShares (auth) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_REQUEST_SHARES',
      serial: serial
    })

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.open('DELETE', 'http://127.0.0.1:3000/api/v1/sessions/_')
    oReq.setRequestHeader('Token', '')
    oReq.send()
  }
}

export function resultShares (result) {
  return (dispatch) => {
    dispatch({
      type: 'RESULT_SHARES'
    })
  }
}

export function attemptShare (email, serialnumber) {
  return (dispatch) => {
    dispatch({
      type: 'ATTEMPT_SHARE',
      email: email,
      serialnumber: serialnumber
    })

    window.setTimeout(() => {
      if (true) {
        dispatch({
          type: 'SHARE_SUCCESS',
          email: email,
          serialnumber: serialnumber
        })
      } else {
        dispatch({
          type: 'SHARE_ERROR',
          serialnumber: serialnumber,
          error: "some error"
        })
      }
    }, 1000)
  }
}

export function attemptToggleDeviceState (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_TOGGLE_DEVICE_STATE',
      serialnumber: serialnumber
    })

    let { auth, devices } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    let current_state = devices.statuses.filter(v => v.serialnumber == serialnumber)[0].state
    let new_state = current_state == "off" ? "on" : "off"

    function toggleDeviceResonseHandler () {
      if (this.status === 200) {
        toggleDeviceStateSuccess(serialnumber, new_state)(dispatch)
      } else if (this.status === 401 || this.status === 403) {
        toggleDeviceStateError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        toggleDeviceStateError('Unable to Reach Server')(dispatch)
      } else {
        toggleDeviceStateError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      state: new_state
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', toggleDeviceResonseHandler)
    oReq.addEventListener('error', toggleDeviceResonseHandler)
    oReq.open('POST', API_BASE_URL + '/device/'+serialnumber)
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))
  }
}

function toggleDeviceStateSuccess (serialnumber, state) {
  return (dispatch) => {
    dispatch({
      type: 'TOGGLE_DEVICE_STATE_SUCCESS',
      serialnumber: serialnumber,
      state: state
    })
  }
}

function toggleDeviceStateError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'TOGGLE_DEVICE_STATE_ERROR',
      error: error
    })
  }
}


export function requestDevices () {
  return (dispatch, getState) => {
    dispatch({
      type: 'REQUEST_DEVICES'
    })

    function requestDevicesResponseHandler () {
      if (this.status === 200) {
        try {
          let resp = JSON.parse(this.responseText)
          requestDevicesSuccess(resp)(dispatch)
        } catch (e) {
          requestDevicesError(this.responseText)(dispatch)
        }
      } else if (this.status === 401) {
        requestDevicesError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        requestDevicesError('Unable to Reach Server')(dispatch)
      } else {
        requestDevicesError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let { auth } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', requestDevicesResponseHandler)
    oReq.addEventListener('error', requestDevicesResponseHandler)
    oReq.open('GET', API_BASE_URL + '/user/'+email+'/devices')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send()
  }
}

function requestDevicesSuccess (statuses) {
  console.log('requestDevicesSuccess', statuses);
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_DEVICES_SUCCESS',
      statuses: statuses 
    })
  }
}

function requestDevicesError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'REQUEST_DEVICES_ERROR',
      error: error
    })
  }
}


export function attemptAddDevice (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_ADD_DEVICE',
      serialnumber: serialnumber
    })

    let { auth, devices } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    function toggleDeviceResonseHandler () {
      if (this.status === 200) {
        addDeviceSuccess({})(dispatch)
        console.log('requesting devices...');
        requestDevices()(dispatch, getState);
      } else if (this.status === 401 || this.status === 403) {
        // TODO: should log out here
        addDeviceError('Invalid Credentials')(dispatch)
      } else if (this.status === 409) {
        addDeviceError('Another user owns device ' + serialnumber)(dispatch)
      } else if (this.status === 0) {
        addDeviceError('Unable to Reach Server')(dispatch)
      } else if (this.status === 400) {
        addDeviceError(this.responseText)(dispatch)
      } else {
        addDeviceError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      serialnumber: serialnumber,
      link: true
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', toggleDeviceResonseHandler)
    oReq.addEventListener('error', toggleDeviceResonseHandler)
    oReq.open('POST', API_BASE_URL + '/user/' + email + '/devices')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))

    window.setTimeout(() => {
      dispatch({
        type: 'ADD_DEVICE_SUCCESS',
        serialnumber: serialnumber,
        state: "off"
      })
    }, 1000)
  }
}export function attemptDeleteDevice (serialnumber) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ATTEMPT_DELETE_DEVICE',
      serialnumber: serialnumber
    })

    let { auth, devices } = getState()

    let { token, email } = auth.session

    // HACK
    email = email || window.sessionStorage.getItem('email')

    function deleteDeviceResonseHandler () {
      if (this.status === 200) {
        deleteDeviceSuccess(serialnumber)(dispatch)
      } else if (this.status === 401 || this.status === 403) {
        deleteDeviceError('Invalid Credentials')(dispatch)
      } else if (this.status === 0) {
        deleteDeviceError('Unable to Reach Server')(dispatch)
      } else {
        deleteDeviceError('Invalid Server Response Status: ' + this.status)(dispatch)
      }
    }

    let body = {
      link: false,
      serialnumber: serialnumber
    }

    var oReq = new window.XMLHttpRequest()
    oReq.withCredentials = true;
    oReq.addEventListener('load', deleteDeviceResonseHandler)
    oReq.addEventListener('error', deleteDeviceResonseHandler)
    oReq.open('POST', API_BASE_URL + '/user/' + email + '/devices')
    oReq.setRequestHeader('Content-Type', 'application/json')
    oReq.setRequestHeader('Accept', '*/*')
    oReq.setRequestHeader('Authorization', 'Token ' + token)
    oReq.send(JSON.stringify(body))
  }
}

function deleteDeviceSuccess (serialnumber) {
  return (dispatch) => {
    dispatch({
      type: 'DELETE_DEVICE_SUCCESS',
      serialnumber: serialnumber,
      state: state
    })
  }
}

function deleteDeviceError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'DELETE_DEVICE_ERROR',
      error: error
    })
  }
}

function addDeviceSuccess (status) {
  return (dispatch) => {
    dispatch({
      type: 'ADD_DEVICE_SUCCESS',
      status: status
    })
  }
}

function addDeviceError (error) {
  return (dispatch, getState) => {
    dispatch({
      type: 'ADD_DEVICE_ERROR',
      error: error
    })
  }
}
