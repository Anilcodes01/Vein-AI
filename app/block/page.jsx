"use client";
import { useEffect, useState } from "react";

export default function Block() {
    const [canSpeak, setCanSpeak] = useState(false);

    function speakText(text) {
        if (!window.speechSynthesis) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1; 
        utterance.pitch = 1; 
        utterance.volume = 1; 

        speechSynthesis.speak(utterance);
    }

    // Use useEffect to trigger speech only ONCE when canSpeak becomes true
    useEffect(() => {
        if (canSpeak) {
            speakText("hello how r u");
        }
    }, [canSpeak]); // Runs only when `canSpeak` changes

    return (
        <div
            className="fixed bg-yellow-300 inset-0 flex justify-center items-center text-xl font-bold"
            onClick={() => setCanSpeak(true)}
        >
            Tap anywhere to start!
        </div>
    );
}
