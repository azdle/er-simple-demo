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
  getTestingState() {
    return {
      devices: {
        "d8803975c533": {
          count: {
            value: "2",
            timestamp: "live"
          },
          leds: {
            value: "7",
            timestamp: "live"
          }
        }
      },
      loadingState: 'initial',
      pageErrors: []
    }
  },

  getInitialState() {
    return {
      devices: [],
      loadingState: 'initial',
      pageErrors: []
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
          devices[sn] = devices[sn] || {}
          for(let name in values)
          devices[sn][data.name] = {
            value: message.value,
            timestamp: message.timestamp
          }
        }

        return {devices: devices}
      } else {
        console.error("Unknown message type: " + message.type)
      }
    })
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

    const devices = this.state.devices

    const device_list = devices.length === 0 ?
      (
        <ListItem leftIcon={<RouterIcon />}
                  primaryText={"No Devices Found"}
                  secondaryText={"If your device is connected and sending data please wait a few moments."}
                  disabled={true} />
      ) :
      Object.keys(devices).map((name) => {
        return (
          <Link key={name} to={"/devices/"+name}>
            <ListItem leftIcon={<RouterIcon />}
                      primaryText={name || "<no name>"}
                      secondaryText={"click to see data"} />
          </Link>
        )
      })

    const main_content = (
        <List subheader="Data">
          {device_list}
        </List>
    )

    return (
      <div>
        <AppBar title="Device List" />

        {main_content}

      </div>
    )
  }
})