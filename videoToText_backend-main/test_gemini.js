const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const dotenv = require("dotenv");
dotenv.config();

async function testLlm() {
    try {
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
        });
        const res = await llm.invoke("Hello, how are you?");
        console.log("LLM_TEST_RESULT_START");
        console.log(res.content);
        console.log("LLM_TEST_RESULT_END");
    } catch (e) {
        console.error("LLM_TEST_ERROR_START");
        console.error(e.message);
        console.error("LLM_TEST_ERROR_END");
    }
}

testLlm();
