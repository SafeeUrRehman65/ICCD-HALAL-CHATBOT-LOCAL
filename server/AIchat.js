const hf = require("@huggingface/inference");
require("dotenv").config();

const client = new hf.InferenceClient(process.env.HF_TOKEN);

const SendPrompt = async (prompt) => {
  const chatCompletion = await client.chatCompletion({
    provider: "cerebras",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  console.log(
    "The chat bot's response",
    chatCompletion.choices[0].message.content
  );
  return chatCompletion.choices[0].message.content;
};

module.exports = { SendPrompt };
