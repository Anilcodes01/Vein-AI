'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';

const VoiceAnalyser: React.FC = () => {
  const [outputText, setOutputText] = useState<string>('Initializing...');
  const [transcription, setTranscription] = useState<string>('');
  const [barHeights, setBarHeights] = useState<number[]>([50, 50, 50, 50, 50]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  };

  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const sensitivities = [1.2, 0.9, 0.6, 0.9, 1.2];
    const newHeights = sensitivities.map((sensitivity, i) => {
      const value = dataArray[i * Math.floor(bufferLength / 5)] || 0;
      return Math.min(50 + (value * sensitivity), 130);
    });

    setBarHeights(newHeights);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  const speakWithElevenLabs = async (text: string) => {
    try {
      // Fetch text from API
      const apiResponse = await fetch('/api/voiceAnalyser');
      const { message } = await apiResponse.json();
      setTranscription(message);

      // Eleven Labs API Call
      const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_90c6d63bc3c04b66d2761eb5d7faf8d0428899824baf6cc7',
        },
        body: JSON.stringify({
          text: message,
          model_id: 'eleven_turbo_v2', // Use a fast model for real-time TTS
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.7,
          },
        }),
      });

      if (!elevenLabsResponse.ok) {
        throw new Error('Failed to fetch audio from Eleven Labs');
      }

      const audioBlob = await elevenLabsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      initializeAudioContext();

      sourceRef.current = audioContextRef.current!.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current!);
      analyserRef.current!.connect(audioContextRef.current!.destination);

      audio.onplay = () => {
        setIsSpeaking(true);
        setOutputText("Assistant is speaking...");
        updateVisualizer();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setOutputText("Conversation finished");
        cancelAnimationFrame(animationFrameRef.current!);
        setBarHeights([50, 50, 50, 50, 50]);
      };

      audio.onerror = () => {
        setOutputText("Error playing audio");
        setIsSpeaking(false);
      };

      await audio.play();
    } catch (error) {
      console.error("Error:", error);
      setOutputText("Error in communication");
    }
  };

  const handleStart = async () => {
    if (!isInitialized) {
      setIsInitialized(true);
      await speakWithElevenLabs('Welcome to health and wellness assistant');
    }
  };

  return (
    <div className="flex flex-col items-center h-screen overflow-hidden font-sans ">
      <div className="flex items-center justify-center gap-1.5 w-[400px] h-[300px]">
        {barHeights.map((height, index) => (
          <div 
            key={index} 
            className="w-[50px] bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] rounded-full transition-all duration-75 ease-out" 
            style={{ 
              height: `${height}px`,
              opacity: height > 50 ? 1 : 0.5 + (height / 100)
            }}
          />
        ))}
      </div>

      <button 
        onClick={handleStart}
        disabled={isInitialized}
        className={`mt-4 px-6 py-2 text-black rounded-lg ${
          isInitialized 
            ? 'bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] cursor-not-allowed' 
            : 'bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] cursor-pointer'
        }`}
      >
        {isInitialized ? 'Session Started' : 'Start Session'}
      </button>
      
      <div className="text-black text-lg mt-5 text-center">{outputText}</div>
      <div className="text-black text-base mt-2.5 text-center max-w-[80%] break-words">
        {transcription}
      </div>
    </div>
  );
};

export default VoiceAnalyser;
