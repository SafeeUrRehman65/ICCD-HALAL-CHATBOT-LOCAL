import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { MdAttachFile } from "react-icons/md";
import { CiGlobe } from "react-icons/ci";

import "./App.css";
import VoiceBox from "./components/Voice-Icon";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div className="h-[100vh] w-[100vw]">
        <div className="w-full pb-8 h-full bg-[#212121] flex justify-center">
          <div className="w-full">
            <div className="navbar h-[8vh] flex justify-between items-center w-full border-b border-[#4D4D4D]">
              <div className="w-4 h-4 bg-edit bg-cover"></div>
              <div className="flex items-center text-xl text-white">
                <p>MatzGPT</p> 
                <span className="ml-1 w-6 h-6 bg-cover bg-down-arrow"></span>
              </div>
              <div className="Log-in w-14 h-8 flex justify-center items-center bg-white rounded-full">
                <p className="font-semibold text-xs">Log in</p>
              </div>
            </div>
            <div className="response-box w-full h-[73vh]"></div>
            <div className="input-box w-full flex justify-center">
              <div className="w-[95%] h-[14vh] bg-[#303030] rounded-3xl">
                <input
                  className="text-md text-white placeholder-[#b1b1b1] w-full h-[7vh] px-4 focus:outline-none"
                  type="text"
                  autoFocus
                  placeholder="Ask anything"
                />
                <div className="flex px-3">
                  <div className="w-5/6 flex">
                    <div className="flex h-max w-[12rem] justify-between">
                      <div className="border border-[#4D4D4D] flex cursor-pointer justify-evenly pl-2 pr-3 py-2 rounded-full">
                        <MdAttachFile className="mr-2 text-white text-xl" />

                        <p className="text-white text-sm font-bold">Attach</p>
                      </div>
                      <div className="cursor-pointer flex justify-evenly pl-2 pr-3 py-2 rounded-full border border-[#4D4D4D] ">
                        <CiGlobe className="mr-2 text-white text-xl" />
                        <p className="text-white text-sm font-bold">Search</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex justify-between w-[90px] px-3 py-2 bg-[#515151] rounded-full">
                    <VoiceBox />
                    <div className="pl-2">
                      <p className="font-bold text-[#ECECEC] text-sm">Voice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="caution w-full h-[5vh] flex flex-col items-center">
              <p className="text-white text-xs">
                MatzGPT can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
