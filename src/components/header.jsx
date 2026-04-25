import React, { useEffect } from "react";
import { Link, Router, useResolvedPath } from "react-router-dom";
import nav_design from '../assets/Gemini_Generated_Image_rjgnkfrjgnkfrjgn-removebg-preview.png'
import { useLocation } from "react-router-dom";
import { useState } from "react";

function getLeftStyleLoc() {
  if (window.innerWidth > 1200) {
    return '0%';
  } else if (window.innerWidth < 612) {
    return '0%';
  } else {
    return '1%';
  }
}

function getWidthSet() {
    if (window.innerWidth > 1200) {
    return '90px';
  } else if (window.innerWidth < 612) {
    return '0%';
  } else {
    return '0%';
  }
}

function Nav() {

  const location = useLocation();
  const [leftStyleLoc, setLeftStyleLoc] = useState(getLeftStyleLoc());
  const [widthAdj, setWidthAdj] = useState(getWidthSet());

    const styles = {
    Link: {
      textDecoration: 'none',
      color: 'white',
      left: leftStyleLoc,
      position: 'relative',
      textDecoration: 'white underline',
      width: widthAdj,
    }, 

    
  };

  useEffect(() => {
    const handleResize = () => {
      setLeftStyleLoc(getLeftStyleLoc());
      setWidthAdj(getWidthSet());
    };
    handleResize(leftStyleLoc)
    handleResize(widthAdj)
  }, []);

 return(
  <>
   <header>
     <span className="path_style">
      <Link to="/">/Home</Link>
        <span style={styles.Link}>{`${location.pathname}`}</span>
    </span>
        <div className="nav_layout" id="nav_layout">
          <Link style={styles.Link} to="/about">About</Link>
          <Link style={styles.Link} to="/edu">Education</Link>
          <Link style={styles.Link} to="/exp">Experience</Link>
          <Link style={styles.Link} to="/addt">Addt</Link>
          <Link style={styles.Link} to="/projects">Projects</Link>
        </div>
        {/* <video src={sprite_video} autoPlay loop muted className='video-bg'></video> */}
        {/* <img alt='nav_des' src={nav_design} className='nav_design'/> */}
    </header>
    </>
 ) 
};

export default Nav;
