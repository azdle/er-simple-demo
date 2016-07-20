import React from 'react'

export default React.createClass({
  render () {
    return <div className="small progress" {...this.props}><div>Loading…</div></div>
  }
})
