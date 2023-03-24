import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Components/Navbar'

function Homepage() {
 return (
  <>
   <Navbar />
   <Outlet />
  </>
 )
}

export default Homepage