'use client';
import React, { useRef, useEffect, useState } from 'react';

const ParticleCloud = ({ cloudState = 'idle' }) => {
    const canvasRef = useRef(null);
    const [particles, setParticles] = useState([]);
    const particleCount = 100; // Adjust for performance
    const animationFrameId = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let width = canvas.width;
        let height = canvas.height;

        const initializeParticles = () => {
            const newParticles = [];
            for (let i = 0; i < particleCount; i++) {
                newParticles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 1,
                    vx: (Math.random() - 0.5) * 0.2, // Slight random velocity for idle drift
                    vy: (Math.random() - 0.5) * 0.2,
                    alpha: 0.5 + Math.random() * 0.5, // Random opacity
                    color: `rgba(255, 255, 200, ${0.5 + Math.random() * 0.5})`, // Soft yellow glow
                });
            }
            setParticles(newParticles);
        };

        const animate = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            context.clearRect(0, 0, width, height);

            particles.forEach(particle => {
                // Idle state: gentle drift
                if (cloudState === 'idle') {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > height) particle.vy *= -1;
                }
                // Listening: Coalesce slightly
                else if (cloudState === 'listening') {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const dx = centerX - particle.x;
                    const dy = centerY - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const attractionStrength = 0.005;
                    particle.vx += dx / distance * attractionStrength;
                    particle.vy += dy / distance * attractionStrength;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                }
                // Processing: More defined movement (simple swirl)
                else if (cloudState === 'processing') {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const dx = particle.x - centerX;
                    const dy = particle.y - centerY;
                    particle.vx += -dy * 0.005 + (Math.random() - 0.5) * 0.01;
                    particle.vy += dx * 0.005 + (Math.random() - 0.5) * 0.01;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                }
                // Speaking: Pulsing (simple alpha modulation)
                else if (cloudState === 'speaking') {
                    particle.alpha = 0.7 + 0.3 * Math.sin(Date.now() / 100); // Simple pulse
                    particle.color = `rgba(255, 255, 200, ${particle.alpha})`;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                }
                // Error/Uncertainty: Slight chaotic movement
                else if (cloudState === 'error') {
                    particle.vx += (Math.random() - 0.5) * 0.1;
                    particle.vy += (Math.random() - 0.5) * 0.1;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                } else { // Idle as default
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
                    if (particle.y < 0 || particle.y > height) particle.vy *= -1;
                }

                // Keep particles within bounds (simple wrapping)
                if (particle.x < 0) particle.x = width;
                if (particle.x > width) particle.x = 0;
                if (particle.y < 0) particle.y = height;
                if (particle.y > height) particle.y = 0;

                context.beginPath();
                context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                context.fillStyle = particle.color;
                context.fill();
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        initializeParticles();
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [cloudState]); // Re-run effect when cloudState changes

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', background: 'black' }}
        />
    );
};

export default ParticleCloud;