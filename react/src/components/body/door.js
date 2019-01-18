import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import { ENDPOINT } from '../../config'

class Door extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true
    }
  }

  componentDidMount() {
    this.connectSocket()
  }

  // connect on `new_elevator_state` socket and listen changes
  connectSocket() {
    const socket = socketIOClient(ENDPOINT)
    // update floor when receive some data
    socket.on('new_elevator_state', (data) => {
      let open = data.doors.status !== "closed"
      this.setState({open: open})
    })
  }

  render (){
    const { open } = this.state
    const { elevatorPosition, doorsAreOpening } = this.props
    return (
      <div className="doors isMoving" style={{ bottom: elevatorPosition * 60}}>
        <div className={`door left-door ${open || doorsAreOpening ? 'isOpened' : 'isClosed'}`}></div>
        <div className={`door right-door ${open || doorsAreOpening ? 'isOpened' : 'isClosed'}`}></div>
      </div>
    )
  }
}

export default Door
