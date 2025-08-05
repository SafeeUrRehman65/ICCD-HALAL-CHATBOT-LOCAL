function ProcessChip(
  model_name,
  inference_provider,
  supported_feature,
  chipName
) {
  if (chipName === "Models") {
    ProcessModel(model_name, inference_provider, supported_feature);
  }
}

async function ProcessModel(
  model_name,
  inference_provider,
  supported_feature
) {

}
