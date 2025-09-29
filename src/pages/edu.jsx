import React from "react";
import edu from '../assets/edu.png';

function Education() {

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  return (
    <div style={{display: 'flex', marginTop: '40px', justifyContent: 'center', alignItems: 'center', gap: '20px'}}>
      <img src={edu} alt="Education" style={{ borderRadius: '3%', maxWidth: '60%', height: 'auto' }} />
      <div style={{ height: 'auto', marginLeft: '20px', borderRadius: '3%', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: "#bb5454ff" , maxWidth: '40%', fontSize: '16px', color: '#ffffffff' }}>
      <h3 className="">Relevant Coursework</h3>
      <ul className="">
        <li>Data Structures & Algorithms</li>
        <li>Operating Systems</li>
        <li>Computer Networks</li>
        <li>Software Engineering</li>
        <li>Machine Learning</li>
        <li>Web Development</li>
        <li>Database Systems</li>
        <li>Cybersecurity</li>
      </ul>
      <h3 className="">Certifications</h3>
      <ul className="">
        <li>Google Data Analytics Certificate</li>
        <li>AWS Cloud Practitioner</li>
      </ul>
      </div>
      </div>
  );
}

export default Education;