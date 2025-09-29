import '../App.css';
import { Link } from "react-router-dom";
import React from 'react';
import clouds from '../assets/video.mp4';

function Home() {
  const styles = {
    container: {
      position: 'absolute', // or 'absolute' if needed
      width: '100%',
      top: '120px',
      fontFamily: 'Arial, sans-serif',
      padding: '40px',
      minHeight: '100vh',
    },
    clouds_video: {
      position: 'fixed',
      top: 0,   
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        objectFit: 'cover',
    },

    title: {
      zIndex: 2,  
      fontSize: '3rem',
      color: '#fbff21ff',
    },
    tagline: {
        zIndex: 2,
      fontSize: '1.2rem',
      color: '#777',
    },
    section: {
        zIndex: 2,
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto',
    },
    paragraph: {
        zIndex: 2,
      lineHeight: '1.6',
      color: '#555',
    }
  };

  return (
    <div style={styles.container}>
    <video style={styles.clouds_video} src={clouds} autoPlay loop muted></video>
        <h1 style={styles.title}>Welcome to My Portfolio</h1>
        <p style={styles.tagline}>Computer Science Student | Aspiring Software Engineer</p>

      <section style={styles.section}>
        <p style={styles.paragraph}>
          Hi! I'm passionate about building software that solves real-world problems. I love working with modern web technologies and exploring AI applications.
        </p>
        <p style={styles.paragraph}>
          This site showcases my projects, education, skills, and experience. Feel free to explore and reach out!
        </p>
      </section>
    </div>
  );
}

export default Home;
     
   