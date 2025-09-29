import React from "react";
import exp from '../assets/exp.png';

const styles = {
    container: {
      position: 'relative', 
      display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',         
        width: '100%',
        fontFamily: 'Arial, sans-serif',
        padding: '40px',
        backgroundColor: '#f4f4f4',
    }, 
    iframe: {
        width: '100%',
        height: '800px',
        border: 'none',
    }

}

function Experience() {
 return(
    <div style={styles.container}>
        <h1>Welcome to the Experience Page +</h1>;
        <p>@Michaelle Collado on Linkedin ↑↓↔</p>
        <img src={exp}></img>

    </div>
 ) 
};
export default Experience;