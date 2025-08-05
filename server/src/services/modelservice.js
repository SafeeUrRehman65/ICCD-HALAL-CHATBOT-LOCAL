const { HuggingFaceModels } = require("../models/usermodels.js");

const getModelInfo = async () => {
  // Fetching all models from the HuggingFaceModels table
  const model_info = await HuggingFaceModels.findAll({
    attributes: ["Model_Name", "Inference_Provider", "Supported_Feature"],
  });
  console.log("Model Names:", model_info);
  return model_info;
};


module.exports = { getModelInfo };
