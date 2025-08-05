import { useState, useRef, forwardRef } from "react";
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
    },
    ref
  ) => {
    const [SelectedModel, setSelectedModel] = useState(
      "meta-llama/Llama-3.3-70B-Instruct"
    );

    return (
      <div ref={ref}>
        <div
          className={`${
            ModelisOpen ? "flex" : "hidden"
          } model-list absolute flex-col gap-y-2 bottom-24 bg-opacity-50 p-3 h-[40vh] overflow-y-auto rounded-lg scrollbar bg-[#303030] text-white model-selection-dropdown`}
        >
          {ModelData ? (
            ModelData.map((model, index) => {
              const isDefaultSelected = model.Model_Name === SelectedModel;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setModelisOpen(false);
                    setSelectedModel(model.Model_Name);
                    setprovider(model.Inference_Provider.lower());
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
