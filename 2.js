const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

const peerConnection = new RTCPeerConnection();
const dataChannel = peerConnection.createDataChannel('chat');

dataChannel.onmessage = (event) => {
    const message = event.data;
    const messageElement = document.createElement('div');
    messageElement.textContent = `Friend: ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
        dataChannel.send(message);
        const messageElement = document.createElement('div');
        messageElement.textContent = `You: ${message}`;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        messageInput.value = '';
    }
});

// Create offer and handle answer
async function startConnection() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Offer created and set as local description');
    
    // Handle the answer from the peer
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // In a real application, you would send the ICE candidates to the other peer
            console.log('ICE Candidate:', event.candidate);
        }
    };
}

// To handle the peer connection in a real scenario, you would need signaling
// Here we'll assume both peers are able to directly exchange offer/answer SDP and ICE candidates.

startConnection();
