const hf = require("@huggingface/inference");
require("dotenv").config();

const client = new hf.InferenceClient(process.env.HF_TOKEN);

const SendPrompt = async (prompt, provider, model, feature) => {
  try {
    console.log("Prompt Details", prompt, provider, model, feature);
    switch (feature) {
      case "Text Generation":
        const chatCompletion = await client.chatCompletion({
          provider: provider,
          model: model,
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

      case "Text-to-Image":
        const image = await client.textToImage({
          provider: provider,
          model: model,
          inputs: prompt,
          parameters: { num_inference_steps: 5 },
        });

        const imageUrl = URL.createObjectURL(image);
        console.log("Image URL:", imageUrl);
        return imageUrl;

      case "Text-to-Video":
        const video = await client.textToVideo({
          provider: provider,
          model: model,
          inputs: prompt,
        });

        const videoUrl = URL.createObjectURL(video);
        console.log("Video URL:", videoUrl);
        return videoUrl;
    }
  } catch (error) {
    console.error(`Error in ${feature} generation:`, error);
    throw error; // Re-throw to handle in the calling function
  }
};

module.exports = { SendPrompt };
