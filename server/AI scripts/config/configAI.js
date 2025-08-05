const chatCompletion = await client.chatCompletion({
  provider: provider,
  model: model,
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  tools: tools,
  tool_choice: auto,
  stream: true,
});

const image = await client.textToImage({
  provider: "fal-ai",
  model: "black-forest-labs/FLUX.1-dev",
  inputs: "Astronaut riding a horse",
  parameters: { num_inference_steps: 5 },
});

const video = await client.textToVideo({
  provider: "fal-ai",
  model: "tencent/HunyuanVideo",
  inputs: "A young man walking on the street",
});


module.exports = { chatCompletion, image, video };