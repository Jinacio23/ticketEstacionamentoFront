import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <nav className="navBar">
        <h2>
            <Link to={"/"}>Home</Link>
        </h2>
        <ul>
            <li>
                <Link to={"/page"}>Page</Link>
            </li>
        </ul>

    </nav>
  )
}

export default NavBar