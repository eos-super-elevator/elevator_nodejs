import React, { Component, createRef } from 'react'
import ReactDOM from 'react-dom'
import socketIOClient from 'socket.io-client'
import reverse from 'lodash/reverse' // Reverse the order in an array
import { FaArrowDown, FaArrowUp, FaLock } from 'react-icons/fa'
import './style.css'
import Door from './door'

import { ENDPOINT } from '../../config'

class Elevator extends Component {
  constructor(props) {
    super(props)
    this.state = {
      floors: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      elevatorPosition: undefined,
      direction: 'up',
      access: false
    }
    this.doors = createRef()
    this.leftDoor = createRef()
    this.rightDoor = createRef()
  }
  
  // connect on `new_elevator_state` socket and listen changes
  connectSocket() {
    const socket = socketIOClient(ENDPOINT)
    const thus = this
    // update floor when receive some data
    socket.on('new_elevator_state', (data) => {
      thus.setElevator(data.elevator)
      thus.setAccess(data.access)
    })
    socket.emit('updated_elevator')
  }

  setAccess(access) {
    if(access === 'authorized') {
      this.setState({ access: true })
    } else if(access === 'denied') {
      this.setState({ access: false })
    }
    setTimeout(() => { 
      this.setState({ access: false })
    }, 5000)
  }

  // display arrow on the current floor
  displayArrow(direction){
    this.turnOffArrows()
    const arrow = ReactDOM.findDOMNode(this).querySelector(`.arrow-${direction}-${this.getCurrentFloor()}`)
    if(arrow !== null){
      arrow.classList.add('active')
    }
  }

  turnOffArrows(){
    document.querySelectorAll('.arrow')
            .forEach(f => f.classList.remove('active'))
  }

  // get state of `elevatorPosition` and prevent datashit
  getCurrentFloor(){
    return Math.round(this.state.elevatorPosition)
  }
  
  // set floor of the elevator and
  setElevator(elevator) {
    // prevent fucking float
    if(elevator.direction === "up"){
      this.setState({ direction: 'up' })
    }else{
      this.setState({ direction: 'down' })
    }
    const floorInt = Math.round(elevator.floor)
    // render only if needed
    if (floorInt !== this.getCurrentFloor()) {
      this.setState({ elevatorPosition: floorInt })
    }
  }
  
  componentDidMount() {
    this.connectSocket()
  }

  componentDidUpdate(prevProps,prevState) {
    let prevFloor = prevProps.elevatorPosition
    let wayToGo = prevState.direction
    let targetFloor = this.getCurrentFloor()

    if (wayToGo === "up" ) {
      this.displayArrow('up')
    } else if (wayToGo === "down") {
      this.displayArrow('down')
    } else {
      console.log(`Argument error: Asked ${targetFloor} but was on ${prevFloor}`)
    }
  }

  render() {
    const { floors, elevatorPosition, access } = this.state
    const { doorsAreOpening, restrictedFloors} = this.props
    return (
      <div className="elevator-container">
        <div className="elevator">
          <div className="left">
            {reverse(floors.map((floor, index) =>
              <div ref={this.leftDoor} className={`floor left-floor-${floor}`} key={index}>
                <FaArrowDown className={`arrow arrow-down-${floor}`} />
              </div>
            ))}
          </div>
          <div className="center">
              <div className="stages">
                {reverse(restrictedFloors.map((floor, index) =>
                  <div className={`stage stage-${floor.id}`} key={index}>
                    <span className="stage-number">{floor.id}</span>
                    {!access && <div className={`lock-icon-wrapper`}>
                      {floor.restricted_area && <FaLock id={`locked-floor-${floor.id}`} />}
                    </div>
                    }
                  </div>
                ))}
              </div>
              <Door elevatorPosition={elevatorPosition} doorsAreOpening={doorsAreOpening} />
          </div>
          <div className="right">
          {reverse(floors.map((floor, index) =>
              <div ref={this.rightDoor} className={`floor right-floor-${floor}`} key={index}>
                <FaArrowUp className={`arrow arrow-up-${floor}`} />
              </div>
          ))}
          </div>
        </div>
      </div>
    )
  }
}

export default Elevator
