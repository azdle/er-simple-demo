import React from 'react'
import { hashHistory } from 'react-router'
import { Link } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'

import FlatButton from 'material-ui/lib/flat-button';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Popover from 'material-ui/lib/popover/popover';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import RouterIcon from 'material-ui/lib/svg-icons/device/data-usage';
import AddIcon from 'material-ui/lib/svg-icons/content/add';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionHome from 'material-ui/lib/svg-icons/action/home';
import ChevronLeft from 'material-ui/lib/svg-icons/navigation/chevron-left';
import Share from 'material-ui/lib/svg-icons/social/share';
import NotificationsActive from 'material-ui/lib/svg-icons/social/notifications-active';
import Delete from 'material-ui/lib/svg-icons/action/delete';
import Colors from 'material-ui/lib/styles/colors';

export default React.createClass({
  getInitialState() {
    return {
      devices: [],
      loadingState: 'initial',
      pageErrors: [],
      popover: false // {type: "input", name: "leds", current_value: "4"}
    }
  },

  componentWillMount() {
    let ws = new WebSocket('wss://er-simple-demo.apps.exosite.io/listen');

    // When the connection is open, send some data to the server
    ws.onopen = () => this.setState({loadingState: "done"})

    ws.onerror = (error) => {
      this.setState((previousState, currentProps) => {
        let errorObj = {
          id: Math.max(...[0, ...previousState.map(a => a.id)]) + 1,
          msg: error
        }

        let newPageErrors = [...previousState.pageErrors, errorObj]
        return {pageErrors: newPageErrors}
      })
    }

    // Log messages from the server
    ws.onmessage = (e) => {
      try {
        let msg = JSON.parse(e.data)

        if (typeof msg === "object" && msg.type !== undefined) {
          this.handleDataNotification(msg)
        } else {
          console.log("non-real message: " + e.data)
        }
        
      } catch (e) {
        console.error(e)
      }
    }

    this.ws = ws
  },

  componentWillUnmount() {
    try {
      this.ws.close()
    } catch (e) {}
  },

  handleDataNotification(message) {
    this.setState((previousState, currentProps) => {
      if (message.type === "state" || message.type == "update") {
        let data = message.data;
        let devices = {...previousState.devices}

        console.log(message)
        console.log(Object.keys(data))

        for(let sn in data) {
          let device = data[sn]
          let values = device.values

          devices[sn] = devices[sn] || {values: {}}
          for(let name in values) {
            devices[sn].values[name] = values[name]
          }
        }

        console.log(devices)

        return {devices: devices}
      } else {
        console.error("Unknown message type: " + message.type)
        console.log(message)
      }
    })
  },

  setValue(sn, name, value) {
    let msg = {
      type: "write",
      id: Math.floor(Math.random() * 100000),
      sn: sn,
      name: name,
      value: value
    }

    console.log(msg)
    this.ws.send(JSON.stringify(msg))
  },

  render() {
    let spinner_when_waiting = (
      this.state.loadingState !== "done"
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    );

    let error_message = (
      this.state.pageErrors.length == 0
      ? <div></div>
      : <div className='messagebox error'>{this.context.store.getState().auth.error}</div>
    );

    console.log("xxx")
    console.log(this.state.devices)

    const device = this.state.devices[this.props.params.sn] || {}
    const data = device.values || {}

    console.log("data")
    console.log(data)

    const data_list = Object.keys(data).length === 0 ?
      (
        <ListItem leftIcon={<RouterIcon />}
                  primaryText={"No Data Found for Device"}
                  secondaryText={"If your device is connected and sending data please wait a few moments."}
                  disabled={true} />
      ) :
      Object.keys(data).map((name) => {
        let toggle = undefined
        if ( name === "leds" ) {
          let toggled = false
          let cb = () => {
            this.setValue(this.props.params.sn, "leds", "7")
          }

          if (data[name] != 0 ) {
            toggled = true
            cb = () => {
              this.setValue(this.props.params.sn, "leds", "0")
            }
          }

          toggle = (<Toggle toggled={toggled} onToggle={cb} />)
        }
        return (
          <ListItem leftIcon={<RouterIcon />}
                    primaryText={name || "<no name>"}
                    secondaryText={data[name] || "<no value>"}
                    disabled={true}
                    rightToggle={toggle}
                    key={name} />
        )
      })

    const main_content = (

      typeof data !== "object"
      ? <div>Unknown Error</div>
      : <div>
        <List subheader="Data">
          {data_list}
        </List>
      </div>
    )

    return (
      <div>
        <AppBar title={this.props.params.sn}
                iconElementLeft={ <IconButton onClick={()=> hashHistory.push("/devices")}><ChevronLeft /></IconButton> } />

        {main_content}

      </div>
    )
  }
})
