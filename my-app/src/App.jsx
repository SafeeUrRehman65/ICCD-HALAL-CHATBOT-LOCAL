import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { MdAttachFile } from "react-icons/md";

import { useRef } from "react";
import "./App.css";
import VoiceBox from "./components/Voice-Icon";
import FilterChip from "./components/FilterChip";
import { formatProductResponse } from "./Utilities/utilities";

function App() {
  const [count, setCount] = useState(0);
  const [Prompt_Response, setPrompt_Response] = useState([]);
  const [provider, setprovider] = useState("cerebras");
  const [model, setmodel] = useState("meta-llama/Llama-3.3-70B-Instruct");
  const [feature, setfeature] = useState("Text Generation");
  const PromptRef = useRef();
  const VoiceBoxRef = useRef();
  const dropdownRef = useRef();
  const EnterPromptRef = useRef();
  const bottomRef = useRef();
  const [scrollTrigger, setScrollTrigger] = useState(false);
  const [ModelData, setModelData] = useState();
  const [ModelisOpen, setModelisOpen] = useState(false);
  const [toggler, setToggler] = useState(true);

  const addPrompt = (prompt) => {
    if (!prompt.trim()) return;

    setPrompt_Response((prev) => [...prev, { prompt: prompt, response: "" }]);
    setScrollTrigger((prev) => !prev);
  };

  const addResponse = (response) => {
    setPrompt_Response((prev) => {
      if (prev.length === 0) return prev;

      const LastIndex = prev.length - 1;
      const updatedMessage = [...prev];
      updatedMessage[LastIndex] = {
        ...updatedMessage[LastIndex],
        response: response,
      };

      return updatedMessage;
    });
  };


  const formatResponseText = (text) => {
    // First split by lines to handle line breaks
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        // Empty line - add paragraph spacing
        return <div key={lineIndex} style={{ height: '1em' }}></div>;
      }

      // Then process bold formatting within each line
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={partIndex} style={{ }}>{boldText}</strong>;
        }
        return <span key={partIndex}>{part}</span>;
      });

      return (
        <div key={lineIndex} style={{ marginBottom: '0.5em' }}>
          {formattedLine}
        </div>
      );
    });
  };

  // const FetchMdodelInfo = async () => {
  //   try {
  //     const response = await fetch("http://localhost:3000/api/models", {
  //       method: "GET",
  //       headers: {
  //         "Content-type": "application/json",
  //       },
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       console.log("Recieved Model Information correctly", data.models);
  //       setModelData(data.models);
  //     } else {
  //       console.log("Some error occured", data.message);
  //     }
  //   } catch (error) {
  //     console.log(
  //       "Network Error: Failed while sending request to server",
  //       error
  //     );
  //   }
  // };

  // useEffect(() => {
  //   FetchMdodelInfo();
  // }, []);

  useEffect(() => {
    function handleclickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setModelisOpen(false);
      }
    }

    if (ModelisOpen) {
      document.addEventListener("mousedown", handleclickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleclickOutside);
    };
  }, [ModelisOpen]);

  const sendPromptToServer = async (prompt) => {
    console.log("first log", prompt);
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();
      console.log("AI Response", data);
      if (response.ok) {
        console.log("Received response correctly", data.data.messages);
        let currentText = "";
        let complete_response;
        const lastMessageIndice = data.data.messages.length - 1;
        complete_response = data.data.messages[lastMessageIndice].content;
        addResponse(complete_response)
        // const words = complete_response.trim().split(/\s+/);
        // addResponse(""); // Initialize once

        // if (words.length > 0) {
        //   for (let i = 0; i < words.length; i++) {
        //     const word = words[i];
        //     currentText += word + " ";

        //     // Update every 4 words or on the last word
        //     if (i % 4 === 0 || i === words.length - 1) {
        //       addResponse(currentText);

        //       await new Promise((resolve) => setTimeout(resolve, 5));
        //     }
        //   }
        // }

        window.scrollTo(0, document.body.scrollHeight);
        setToggler(true)
      } else {
        console.log("Some error occured", data.message);
      }
    } catch (error) {
      console.log("Network error", error);
    }
  };

  // Logic to handle Enter key press after entering prompt
  const handleEnterPress = (e) => {
    if (PromptRef.current.value != "") {
      if (e.key == "Enter" || e.type === "click") {
        const prompt = PromptRef.current.value;

        addPrompt(prompt);
        setTimeout(() => {
          setToggler(false)
        }, 5000);

        sendPromptToServer(prompt);
        PromptRef.current.value = "";
      }

      if (VoiceBoxRef.current) VoiceBoxRef.current.classList.remove("hidden");
      if (EnterPromptRef.current)
        EnterPromptRef.current.classList.add("hidden");
    }
  };

  useEffect(() => {
    const handleInputPrompt = () => {
      if (PromptRef.current) {
        if (PromptRef.current.value != "") {
          if (VoiceBoxRef.current) VoiceBoxRef.current.classList.add("hidden");
          if (EnterPromptRef.current)
            EnterPromptRef.current.classList.remove("hidden");
        } else {
          if (VoiceBoxRef.current)
            VoiceBoxRef.current.classList.remove("hidden");
          if (EnterPromptRef.current)
            EnterPromptRef.current.classList.add("hidden");
        }
      }
    };

    const inputEl = PromptRef.current;
    if (inputEl) {
      inputEl.addEventListener("input", handleInputPrompt);
      inputEl.addEventListener("keydown", handleInputPrompt); // 🔄 NEW LINE
    }

    return () => {
      if (inputEl) {
        inputEl.removeEventListener("input", handleInputPrompt);
        inputEl.removeEventListener("keydown", handleInputPrompt); // 🔄 NEW LINE
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scrollTrigger]);

  return (
    <div>
      <div className="h-[100vh] w-[100vw]">
        <div className="w-full pb-8 h-full bg-[#212121] flex justify-center">
          <div className="w-full">
            <div className="navbar px-4 h-[8vh] flex justify-between items-center w-full border-b border-[#4D4D4D]">
              <div className="hover:bg-neutral-700 hover:bg-opacity-20 p-2  cursor-pointer rounded-lg">
                <div className="w-5 h-5 font-semibold bg-edit bg-cover "></div>
              </div>
              <div className="flex items-center text-lg text-white hover:bg-neutral-700 hover:bg-opacity-20 px-2 py-1 rounded-lg cursor-pointer">
                <p>ICCD Halal GPT</p>
                <span className="mt-[1px] w-6 h-6 bg-cover bg-down-arrow"></span>
              </div>
              <div className="Log-in w-14 h-8 flex justify-center items-center bg-white hover:bg-gray-100 rounded-full cursor-pointer">
                <p className="font-semibold text-xs">Log in</p>
              </div>
            </div>
            <div className="prompt-response-box flex flex-col gap-y-8 w-full h-[73vh] overflow-y-auto p-8 scrollbar">
              {Prompt_Response.map((pair, index) => (
                <div className="flex flex-col gap-y-4 border-b border-[#303030]">
                  <div className="self-end prompt max-w-3/4 bg-[#303030] rounded-xl h-max p-3">
                    <p className="text-white">{pair["prompt"]}</p>
                  </div>
                  {!pair["response"] ? (
                    <div className="my-8 flex justify-start">

                      {toggler ? (

                        <div className="scaler self-center h-4 w-4 bg-white rounded-full opacity-75"></div>

                      ) : (
                        <div className="flex flex-col">
                          <p className="mx-2 text-lg shimmer-effect">
                            Constructing query
                          </p>
                          <p className="mx-2 text-sm shimmer-effect-lite">
                            Executing Query
                          </p>
                        </div>
                      )}
                    </div>
                  ) : feature === "Text Generation" ? (
                    <div className="mb-4 response rounded-xl h-max p-3 md:max-w-1/2">
                      <div className="text-white leading-7.5">
                        {formatResponseText(pair["response"])}
                      </div>
                    </div>
                  ) : feature === "Text-to-Image" ? (
                    <div className="mb-4 response w-auto p-3 md:max-w-1/2">
                      <img
                        src={pair["response"]}
                        className="image-container rounded-lg h-[45vh]"
                      ></img>
                    </div>
                  ) : null}
                </div>
              ))}
              <div ref={bottomRef} className="dummy-ref"></div>
            </div>
            <div className="input-box w-full flex justify-center">
              <div className="w-[95%] h-[14vh] bg-[#303030] rounded-3xl">
                <input
                  ref={PromptRef}
                  className="text-md text-white placeholder-[#b1b1b1] w-full h-[7vh] px-4 focus:outline-none"
                  type="text"
                  autoFocus
                  placeholder="Ask anything"
                  onKeyDown={handleEnterPress}
                />
                <div className="flex px-3">
                  <div className="w-5/6 flex">
                    <div className="flex h-max w-[12rem] justify-between">
                      <div className="border border-[#4D4D4D] flex cursor-pointer justify-evenly pl-2 pr-3 py-2 rounded-full">
                        <MdAttachFile className="mr-2 text-white text-xl" />

                        <p className="text-white text-sm font-semibold">
                          Attach
                        </p>
                      </div>
                      <FilterChip
                        ModelData={ModelData}
                        ModelisOpen={ModelisOpen}
                        setModelisOpen={setModelisOpen}
                        ref={dropdownRef}
                        setprovider={setprovider}
                        setmodel={setmodel}
                        setfeature={setfeature}
                        setModelData={setModelData}
                      />
                    </div>
                  </div>

                  <div
                    ref={VoiceBoxRef}
                    className="voice-box ml-auto flex cursor-pointer hover:bg-[#616161] transition-all duration-200 justify-center w-max p-2 bg-[#515151] rounded-full"
                  >
                    <VoiceBox />
                    {/* <div className="pl-2">
                      <p className="font-semibold text-[#ECECEC] text-sm">
                        Voice
                      </p>
                    </div> */}
                  </div>
                  <div
                    onClick={handleEnterPress}
                    ref={EnterPromptRef}
                    className="hidden enter-prompt cursor-pointer ml-auto bg-gray-50 hover:bg-neutral-400 rounded-full w-10 h-10 flex justify-center items-center"
                  >
                    <div className="enter-prompt justify-center bg-arrow-top w-[16px] h-[16px] bg-cover hover:bg-opacity-20"></div>
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
