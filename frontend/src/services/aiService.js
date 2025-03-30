import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getAIResponse = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/ai/chat/`, {
      message,
    });
    return response.data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
};

export const startSpeechRecognition = () => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window)) {
      reject(new Error('Speech recognition is not supported in this browser.'));
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
};

export const textToSpeech = (text) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech is not supported in this browser.'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = resolve;
    utterance.onerror = (event) => {
      reject(new Error(`Text-to-speech error: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const generateCourseContent = async (topic, level) => {
  try {
    const response = await axios.post(`${API_URL}/ai/generate-course/`, {
      topic,
      level,
    });
    return response.data.content;
  } catch (error) {
    console.error('Error generating course content:', error);
    throw error;
  }
}; 