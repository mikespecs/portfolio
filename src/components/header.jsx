import React from "react";
import { Link, Router, useResolvedPath } from "react-router-dom";
import nav_design from '../assets/Gemini_Generated_Image_rjgnkfrjgnkfrjgn-removebg-preview.png'
import { useLocation } from "react-router-dom";

const styles = {
  Link: {
    textDecoration: 'none',
    color: 'white',
}
}

function Nav() {

  const location = useLocation();

 return(

   <header>
     <span className="path_style">
      <Link to="/">/Home</Link>
        <span style={styles.Link}>{`${location.pathname}`}</span>
    </span>
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
