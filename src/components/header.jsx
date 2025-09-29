import React from "react";
import { Link } from "react-router-dom";
import nav_design from '../assets/Gemini_Generated_Image_rjgnkfrjgnkfrjgn-removebg-preview.png'

const styles = {
  Link: {
    textDecoration: 'none',
    color: 'white',
}
}

function Nav() {
 return(
   <header>
        <div className='nav_layout'>
          <Link style={styles.Link} to="/about">About</Link>
          <Link style={styles.Link} to="/edu">Education</Link>
          <Link style={styles.Link} to="/exp">Experience</Link>
          <Link style={styles.Link} to="/skills">Skills</Link>
          <Link style={styles.Link} to="/projects">Projects</Link>
        </div>
        {/* <video src={sprite_video} autoPlay loop muted className='video-bg'></video> */}
        <img alt='nav_des' src={nav_design} className='nav_design'/>
    </header>
 ) 
};

export default Nav;
