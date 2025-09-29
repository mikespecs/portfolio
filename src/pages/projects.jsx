import React from "react";
import '../App.css'
import Tru from '../assets/trulee.png'
import Ourdraw from '../assets/ourdraw.png'
import Oronym from '../assets/oronym.png'
import dragon from '../assets/dragon.mp4'
import chase from '../assets/chase.mp4'
import exosuit from '../assets/exosuit.jpg'
import { useState, useEffect } from "react";

const styles = {
 
    project_image: {
        width: '150px',
        height: '150px',
        objectFit: 'cover',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#ffffff',
        marginBottom: '10px',
        borderRadius: '10%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    }, 
     video_bg: {
      position: 'absolute',
      display: 'flex',
justifyContent: 'center',
    zIndex: 1,
    objectFit: 'cover',
    opacity: 0.8,

    },
}

const projects = [
  {
    title: "Oronym Crack",
    description: "An interactive flight route planner for pilots.",
    tech: "Microstudio",
    features: ["Live map routing", "Weather overlays", "User authentication"],
    github: "N/A",
    img_src: Oronym,
    demo: "https://flightpath-demo.vercel.app",
    role: "Solo developer",
    challenges: "Integrating real-time weather APIs",
    future: "Add 3D terrain visualization",
  },

{
    title: "untitled",
    description: "An interactive flight route planner for pilots.",
    tech: "React, Leaflet, Firebase",
    features: ["Live map routing", "Weather overlays", "User authentication"],
    github: "https://github.com/yourusername/flightpath",
    img_src: exosuit,
    demo: "https://flightpath-demo.vercel.app",
    role: "Solo developer",
    challenges: "Integrating real-time weather APIs",
    future: "Add 3D terrain visualization",
  },

  {
    title: "Truth & Company",
    description: "An interactive flight route planner for pilots.",
    tech: "React, Leaflet, Firebase",
    features: ["Live map routing", "Weather overlays", "User authentication"],
    github: "https://github.com/yourusername/flightpath",
    img_src: Tru,
    demo: "https://flightpath-demo.vercel.app",
    role: "Solo developer",
    challenges: "Integrating real-time weather APIs",
    future: "Add 3D terrain visualization",
  },

  {
    title: "Ourdraw",
    description: "An interactive flight route planner for pilots.",
    tech: "React, Leaflet, Firebase",
    features: ["Live map routing", "Weather overlays", "User authentication"],
    github: "https://github.com/yourusername/flightpath",
    img_src: Ourdraw,
    demo: "https://flightpath-demo.vercel.app",
    role: "Solo developer",
    challenges: "Integrating real-time weather APIs",
    future: "Add 3D terrain visualization",
  },

  // Add 2 more projects similarly
];

function Projects() {

const [videoSrc, setVideoSrc] = useState(dragon);

  useEffect(() => {
    const interval = setInterval(() => {
        setVideoSrc(prev => (prev === dragon ? chase : dragon));
    }, 5000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

 return(
    <div className="project_page">
        {/* <h1>Projects Page</h1> */}
        <video
        src={videoSrc}
        autoPlay
        loop
        muted
        className="video_bg"
        id="vbg_proj"></video>
         <select className="project_filter">
                <option value="all">All</option>
                <option value="mobile_apps">Mobile Apps</option>
                <option value="music_production">Music Production</option>
                <option value="capstone">Capstone</option>
                <option value="websites">Websites</option>
            </select>
    <div className="project_slots">
        {projects.map((proj, idx) => (
        <div key={idx} className="projects_card">
          <img src={proj.img_src} alt={proj.title} style={styles.project_image} className="project_image"/>
          <h3 >{proj.title}</h3>
          <p>{proj.description}</p>
          <p><strong>Technologies:</strong> {proj.tech}</p>
          <ul >
            {proj.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <p><strong>Role:</strong> {proj.role}</p>
          <p><strong>Challenges:</strong> {proj.challenges}</p>
          <p><strong>Future:</strong> {proj.future}</p>
          <a href={proj.github} >GitHub</a>
          <a href={proj.demo} >Live Demo</a>
        </div>
      ))}
            </div>
    </div>
 ) 
};

export default Projects;