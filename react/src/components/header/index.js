import React from 'react'
import './style.css'

const Header = () =>
  <div className="header">
    <img className="logo" src={require('../../images/eos_logo.png')} alt="logo"/>
    <h1 className="title">Super Elevator</h1>
  </div>

export default Header
