import { PropsWithChildren } from "react";
import "../../styles/Landing.css";

// Edit these to change the big rotating word (it swaps every ~5 seconds).
const WORD_1 = "Developer";
const WORD_2 = "Designer";

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
              <div className="landing-h2-1">{WORD_1}</div>
              <div className="landing-h2-2">{WORD_2}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">{WORD_1}</div>
              <div className="landing-h2-info-1">{WORD_2}</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
