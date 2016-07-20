import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'

import App from './views/App'
import Devices from './views/Devices'
import Device from './views/Device'

require('./sass/styles.scss');

render((
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Devices} />
      <Route path='/devices' component={Devices} />
      <Route path='/devices/:sn' component={Device} />
    </Route>
  </Router>
), document.getElementById('app'))
