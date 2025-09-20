const { getModelInfo } = require("../services/modelservice.js");

const ModelInfo = async (req, res) => {
  try {
    const model_info = await getModelInfo();

    res.status(200).json({ models: model_info });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get model info", error: error.message });
  }
};

module.exports = { ModelInfo };
