import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {faArrowDown, faArrowUp, faKey, faAngleLeft, faAngleRight, faUnlock} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import  reverse from 'lodash/reverse'

import Elevator from './elevator'
import './style.css'

class Body extends Component {
  constructor(props){
    super (props)
    this.state = {
        targetFloor : null,
        lastFloor : null,
        isGoingUp : false,
        isGoingDown: false,
        meter: 0,
        timetravel : 0
    }
  }

  checkFloor = (targetFloor) => {
    const { lastFloor } = this.state
    const node = ReactDOM.findDOMNode(this)
    const allNumbKeys = document.querySelectorAll('.numbKey')

    allNumbKeys.forEach(numbKey => {
      numbKey.classList.remove('active')
    })
    const targetKey = node.querySelector(`.key-${targetFloor}`)
    targetKey.classList.add('active')

    this.setState({ targetFloor })
    if ((lastFloor > targetFloor) || (lastFloor < targetFloor) || (lastFloor == null) ) {
      if (lastFloor > targetFloor) {
        this.setState({ isGoingDown: true, isGoingUp: false })
        setTimeout(() => {
          this.setState({ isGoingDown : false })
        }, 3500)
      } else if (lastFloor < targetFloor) {
        this.setState({ isGoingUp: true, isGoingDown: false })
        setTimeout(() => {
          this.setState({ isGoingUp: false })
        }, 3500)
      }
      this.checkHeight(targetFloor,this.state.lastFloor);
      this.setState({ lastFloor: targetFloor });

    } else {
      this.setState({ isGoingUp: false, isGoingDown: false })
    }
  }

    /*
      * Tableau avec chaque étage ainsi que sa hauteur en mètres (1,33 m par seconde de vitesse de montée)
      * En fonction de l'étage selectionné et de l'étage de départ faire le calcul correspondant
      * variable :
      * - L'hauteur au départ
      * - L'hauteur cible
      * - Temps nécéssaire pour parcourir le chemin : 3 sec/étages
      * -
      * */

    decrementer = (timeTravel, startTravel,current_height,Destination ) => {

        let timerRun = setInterval(() => {
            console.log('hello')
            console.log('mètre actuel : '+this.state.meter);
            startTravel++ ;
            // if (current_height <= Destination){
            //     this.setState({
            //         meter : current_height++
            //     })
            //     console.log('upsy : '+ this.state.meter)
            //
            // } else if(current_height >= Destination){
            //     this.setState({
            //         meter : current_height--
            //     })
            //     console.log('daisy: '+  this.state.meter)
            //
            // }
        }, 1000);
        let timerRun2 = setInterval(() => {
            if (current_height < Destination){
                this.setState({
                    meter : ++current_height
                })

            } else if(current_height > Destination) {
                this.setState({
                    meter : --current_height
                })

            }else{
            }
        }, 250);

        // let timerUpdater = setInter

        setTimeout(()=>{
            clearInterval(timerRun);
        },timeTravel*1000);

        setTimeout(()=>{
            clearInterval(timerRun2);
            // clearInterval(timerUpdater)
        },timeTravel*1000+200);
    }

    checkHeight = (floor, lastFloor) => {
        const heightStart = 4 * lastFloor;
        const heightEnd = 4 * floor;
        let travelingHeight = 0;
        let floorVisited = 0;
        if(floor > lastFloor){
            //Monter
            floorVisited = floor - lastFloor;
            // console.log("nombre d'étage à parcourir :"+ floorVisited);
            travelingHeight = heightEnd - heightStart;
            // console.log("Distance à parcourir " + travelingHeight);
            let timeTravel = travelingHeight * (3/4);
            this.setState({

            })
            // console.log('time travel '+ timeTravel)
            this.decrementer(timeTravel,0,heightStart,heightEnd)

        }else{
            //Descendre
            // console.log('Etage cible :'+ floor);
            // console.log('Etage de départ : ' + lastFloor);
            // console.log('Hauteur de départ ' + heightStart);
            // console.log("Hauteur de d'arrivé " + heightEnd);
            // console.log("nombre d'étage à parcourir :"+ floorVisited);
            travelingHeight = heightStart- heightEnd;
            // console.log("Distance à parcourir " + travelingHeight);
            let timeTravel = travelingHeight * (3/4);
            this.decrementer(timeTravel,0,heightStart,heightEnd)
        }
    }

  componentWillUnmount() {
    clearTimeout()
  }

  render() {
    const { isGoingUp, isGoingDown, targetFloor, meter } = this.state
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const isMobile = window.innerWidth <= 768 // Check window's width
    return (
      <div className="body">
        {!isMobile && <Elevator targetFloor={targetFloor} />}
        <div className="keypad-container">
          <div className="keypad">
            <div className="screen">
                {!isMobile && <div className="numberEmp">{targetFloor}</div>}
                <div className="test">
                <div className="MobileView">
                  <div className="TotalFloor">
                    {isMobile && <p>Total floors : 9</p>}
                  </div>
                  <div className="CurrentFloor">
                    {isMobile && <p>Current floor : {targetFloor}</p>}
                  </div>
                  <div className="ElevatorRange">
                    {meter} m
                    {isMobile && <span className="arrow">
                      {isGoingUp && <FontAwesomeIcon icon={faArrowUp} />}
                      {isGoingDown && <FontAwesomeIcon icon={faArrowDown} />}
                    </span>}
                  </div>
                  </div>
                  {!isMobile && <div className="arrow">
                    <span>
                      {isGoingUp && <FontAwesomeIcon icon={faArrowUp} />}
                      {isGoingDown && <FontAwesomeIcon icon={faArrowDown} />}
                    </span>
                  </div>}
                </div>
            </div>
            <div className="keyboard">
              <ol className="keys">
                {reverse(numbers.map((number) =>
                  <li className={`key key-${number} numbKey`} onClick={this.checkFloor.bind(this,number)} key={number}>
                      {number}
                  </li>
                ))}
                <li className="key open faAngleLeft faAngleRight"><FontAwesomeIcon icon={faAngleLeft} /><FontAwesomeIcon icon={faAngleRight} /></li>
                <li className="key close faAngleLeft faAngleRight"><FontAwesomeIcon icon={faAngleRight} /><FontAwesomeIcon icon={faAngleLeft} /></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Body
