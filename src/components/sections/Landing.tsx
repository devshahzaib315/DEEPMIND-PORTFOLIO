import { PropsWithChildren } from "react";
import "../../styles/Landing.css";

// Words used by the rotating text animation in initialFX.ts
const WORDS = [
  "Designer",
  "Engineer",
  "Coder",
  "Frontend",
  "Developer",
];

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello, I'm</h2>

            <h1>
              SHAHZAIB
              <br />
              <span>AHMED</span>
            </h1>
          </div>

          <div className="landing-info">
            <h3>A Web</h3>

            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{WORDS[0]}</div>
              <div className="landing-h2-2">{WORDS[1]}</div>
            </h2>

            <h2 className="landing-h2-info">
              <div className="landing-h2-info-1">{WORDS[0]}</div>
            </h2>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};

export default Landing;
