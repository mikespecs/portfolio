import React from "react";
import pacman from '../assets/pacman_eating.jpg';
import soul from '../assets/soul.png';

function Skills() {
  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center',}}>
        <img src={soul} style={{width: '50%',  }}></img>
     </div>
  );
}

export default Skills;