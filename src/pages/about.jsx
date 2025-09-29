import React from "react";
import logo from '../assets/logo.svg'
import gamer from '../assets/gamer.png'

const styles = {
 back_image: {
      position: 'fixed',
      top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        objectFit: 'cover',
        zIndex: -1,
        opacity: 0.6,
    },
}

function About() {
 return(
    <>
    <img style={styles.back_image} src={gamer}></img>
        <div className="about_page">
            <div id="sec"><p>Grand Rising, I'm Mike Xander. My journey into computer science was less of a straight path and more of a winding road, heavily influenced by seemingly disparate passions. It all began with a fascination for stop-motion cinematography. The intricate dance of bringing inanimate objects to life, frame by painstaking frame, taught me the power of sequential logic and iterative refinement. I wasn't just moving puppets; I was creating algorithms for movement, anticipating outcomes, and debugging on the fly. This meticulous process, combined with an early dive into music production – where I learned about structured composition, layering, and the impact of subtle changes on the overall output – unknowingly laid the groundwork for understanding complex systems and the beauty of well-organized code. My childhood explorations into building fantastical structures with LEGOs and observing architectural designs further honed my spatial reasoning and an appreciation for scalable, robust design, elements that would later prove invaluable in software architecture.

As I matured, my interests expanded into the realms of business development and a more politically astute understanding of how systems influence society. I realized that technology wasn't just about creating cool things; it was a powerful lever for change, for building new economies, and for shaping human interaction on a global scale. The strategic thinking involved in business, coupled with an awareness of policy's impact on innovation, gave me a broader perspective on the why behind technology. It wasn't enough to just build; I wanted to build meaningful things, things that could solve real-world problems and contribute positively to communities. This shifted my focus from purely creative output to understanding the practical applications and societal implications of computational power.

Ultimately, my diverse inspirations coalesced into a profound interest in computer science. The same logical sequencing from stop-motion, the structured creativity from music, and the foundational design principles from architecture all found a new home in coding. The drive to understand systems, optimize processes, and leverage technology for impact, nurtured by my exploration of business and politics, became the guiding force. My journey to school for computer science wasn't just about learning syntax; it was about integrating a lifetime of varied interests into a powerful toolkit for innovation, fueled by a desire to build, create, and make a tangible difference in the digital world.</p></div>
            <div id="sec"><p>Goals and Aspirations</p></div>
            <div id="sec"><p>Skills C++ Python</p></div>
            <div className="avatar_pic" id="sec"><img src={logo}></img></div>
        </div>
    </>
 ) 
};
export default About;