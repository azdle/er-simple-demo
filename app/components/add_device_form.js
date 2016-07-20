import React from 'react'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'

import Spinner from '../components/spinner'
let cancelId = "add-device-cancel";
let submitId = "add-device-submit";


export default React.createClass({
  handleForm (event) {
      event.preventDefault()

      const sn = event.target.elements[0].value
      let request = {
        sn: sn
      }

      this.props.onSubmit(request)
  },

  render () {
    let spinner_when_waiting = (
      this.props.isLoading
      ? <Spinner />
      : <div />
    )

    return (
      <div>
        <Form onSubmit={this.handleForm}>
          <Input label='Serial Number' floatingLabel/>
          <Button id={cancelId}>Cancel</Button>
          <Button id={submitId} color='primary'>Add</Button>
          {spinner_when_waiting}
        </Form>
      </div>
    )
  }
})
