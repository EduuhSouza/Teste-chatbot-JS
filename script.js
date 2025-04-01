// CODIGO FEITO COM BASE NO VIDEO DE CODINGNEPAL

const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");

// API's
const API_KEY = "AIzaSyCiKAjpH-0jUOnX4xjpO7eEmlBN1HuqeOQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }

}

const createMenssageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}


// RESPOSTA DO CHAT USANDO A API
    const generateBotResponse = async (incomingMessageDiv) =>{
        const messageElement = incomingMessageDiv.querySelector(".message-text");

        // API OPÇOES
        const requestOptions = {
            method: "POST",
            Headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({
                contents: [{
                    "parts":[{text: userData.message }, ...(userData.file.data ? [{inline_data: userData.file }] : [])]  
                    }]
            })
        }
        
        try {
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();
            if(!response.ok) throw new Error(data.error.message);

        console.log(data);

        // RESPOSTA BOT
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        messageElement.innerText = apiResponseText;

        } catch (error){
            console.log(error);
            // messageElement.innerText = error.mensage;
            // messageElement.style.color = 'red';
        } finally {

            // RESETA O ANEXO DE IMAGEM
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        }
    }

    const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
        messageInput.value = "";

        // CRIA E MOSTRA A MSG DO USUARIO
    const messageContent = `<div class="message-text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMenssageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;

    chatBody.appendChild(outgoingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });


// SIMULA O BOT RESPONDENDO
    setTimeout(() => {
        const messageContent = ` <img class="bot-avatar" src="imgs/logo.Chatbot.LUMA.png" alt="">

                <div class="message-text"> 
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div> 
                </div>`;

        const incomingMessageDiv = createMenssageElement(messageContent, "bot-message", "thinking");
        outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
}


messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});

// ALTERAÇÃO DE ENTRA DE ARQUIVO 

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded")
        const base64String = e.target.result.split(",")[1];

        // SALVA O ARQUIVO NO USERDATA
        userData.file = {
            data: base64String,
            mime_type: file.type
        }

       fileInput.value = "";
    }

    reader.readAsDataURL(file);
})

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click())
