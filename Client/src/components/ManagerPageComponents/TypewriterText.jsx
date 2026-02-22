import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, delay = 150, deleteDelay = 50, pauseDelay = 2000 }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;
        if (!isDeleting) {
            if (displayText.length < text.length) {
                timeout = setTimeout(() => {
                    setDisplayText(text.slice(0, displayText.length + 1));
                }, delay);
            } else {
                timeout = setTimeout(() => {
                    setIsDeleting(true);
                }, pauseDelay);
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(text.slice(0, displayText.length - 1));
                }, deleteDelay);
            } else {
                setIsDeleting(false);
            }
        }
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, text, delay, deleteDelay, pauseDelay]);

    return (
        <span className="inline-flex items-center">
            {displayText}
            <span className="w-0.5 h-[1.1em] bg-foreground ml-1 animate-pulse"></span>
        </span>
    );
};

export default TypewriterText;
