import { useState, useRef, forwardRef, useEffect } from "react";
import { CiGlobe } from "react-icons/ci";
import "./../App.css";

const FilterChip = forwardRef(
  (
    {
      chipName = "Models",
      ModelData,
      ModelisOpen,
      setModelisOpen,
      setprovider,
      setmodel,
      setfeature,
      setModelData,
    },
    ref
  ) => {
    const [SelectedModel, setSelectedModel] = useState(
      "meta-llama/Llama-3.3-70B-Instruct"
    );
    const [debouncedterm, setDeboucedTerm] = useState("");
    const [searchterm, setSearchTerm] = useState("");
    const searchRef = useRef();
    const [filteredArray, setfilteredArray] = useState();

    const filteredModels = ModelData?.filter((model) =>
      ["Model_Name", "Inference_Provider", "Supported_Feature"].some((key) =>
        model[key]?.toLowerCase().includes(debouncedterm.trim().toLowerCase())
      )
    );

    useEffect(() => {
      const handler = setTimeout(() => {
        setDeboucedTerm(searchterm);
      }, 300);
    }, [searchterm]);

    return (
      <div ref={ref}>
        <div
          className={`${
            ModelisOpen ? "flex" : "hidden"
          } model-list absolute flex-col gap-y-2 bottom-24 bg-opacity-50 p-3 h-[40vh] overflow-y-auto rounded-lg scrollbar bg-[#303030] text-white model-selection-dropdown`}
        >
          <div className="sticky top-0 bg-[#303030] shadow:md shadow-blue-500/50">
            <input
              ref={searchRef}
              onChange={(e_) => {
                setSearchTerm(e_.target.value);
              }}
              className="bg-[#303030] px-2 py-2 text-sm w-full rounded-lg border border-[#5a5a5a] focus:outline-none focus:ring-1 focus:ring-blue-500"
              type="text"
              placeholder="Search models by name, provider, feature"
            />
          </div>

          {filteredModels ? (
            filteredModels.map((model, index) => {
              const isDefaultSelected = model.Model_Name === SelectedModel;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setModelisOpen(false);
                    setSelectedModel(model.Model_Name);
                    setprovider(
                      model.Inference_Provider.toLowerCase().replace(" ", "-")
                    );
                    setmodel(model.Model_Name);
                    setfeature(model.Supported_Feature);
                  }}
                  className={`${
                    isDefaultSelected ? "bg-gray-500" : ""
                  } cursor-pointer flex items-center gap-x-4 hover:bg-[#4D4D4D] rounded-md pl-2 p-1`}
                >
                  <div className="bg-diamond bg-cover w-5 h-5 "></div>
                  <div>
                    <p className="text-sm">{model.Model_Name}</p>
                    <div className="flex items-center gap-x-4">
                      <p className="text-xs text-gray-400">
                        {model.Supported_Feature ? (
                          model.Supported_Feature
                        ) : (
                          <p>"No features available"</p>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {model.Inference_Provider
                          ? model.Inference_Provider
                          : "No provider available"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm">No models available</p>
          )}
        </div>
        <div
          onClick={() => {
            setModelisOpen(!ModelisOpen);
            if (searchRef) {
              searchRef.current.value = "";
            }
            setSearchTerm(" ");
          }}
          className="model-box cursor-pointer flex justify-evenly pl-2 pr-3 py-2 rounded-full hover:bg-[#4D4D4D] border border-[#4D4D4D]"
        >
          <CiGlobe className="mr-2 text-white text-xl" />
          <p className="text-white text-sm font-semibold">{chipName}</p>
        </div>
      </div>
    );
  }
);

export default FilterChip;
