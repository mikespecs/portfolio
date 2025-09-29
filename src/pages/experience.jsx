import React from "react";

const styles = {
    container: {
      position: 'absolute', // or 'absolute' if needed          
        width: '100%',
        top: '120px',
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
    <div>
        <h1>Welcome to the Experience Page</h1>;
        <iframe style={styles.iframe} src="https://ourdraw-production.vercel.app" frameborder="0"></iframe>
    </div>
 ) 
};
export default Experience;