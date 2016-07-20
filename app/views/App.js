import React from 'react'
import AppStore from '../stores/app'
import Container from 'muicss/lib/react/container'

export default React.createClass({

  render () {
   return (
    <div>
      {this.props.children}
    </div>
    )
  }
})
