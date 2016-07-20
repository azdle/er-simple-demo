import React from 'react'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'

import Spinner from '../components/spinner'

export default React.createClass({
  handleForm (event) {
      event.preventDefault()
      const email = event.target.elements[0].value

      let request = {
        email: email
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
        <h3>Share Device</h3>
        <Form onSubmit={this.handleForm}>
          <Input label='Email' floatingLabel/>
          <Button color='primary'>Share</Button>
          {spinner_when_waiting}
        </Form>
      </div>
    )
  }
})
