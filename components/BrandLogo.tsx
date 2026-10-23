import React from 'react';

interface BrandLogoProps {
    size?: number;
    className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 20, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            style={{ minWidth: size, minHeight: size }}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 ${className}`.trim()}
        >
            <circle cx="256" cy="256" r="240" fill="#161B22" stroke="#30363D" strokeWidth="16" />
            <path
                d="M 104 224 C 104 176 116 140 148 112 C 162 100 178 94 192 106 C 210 122 226 148 256 148 C 286 148 302 122 320 106 C 334 94 350 100 364 112 C 396 140 408 176 408 224 L 408 344 C 408 376 384 400 352 400 L 160 400 C 128 400 104 376 104 344 Z"
                fill="#FFFFFF"
            />
            <path
                d="M 124 200 L 244 300 C 252 306 260 306 268 300 L 388 200"
                fill="none"
                stroke="#161B22"
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M 124 378 L 222 292"
                fill="none"
                stroke="#161B22"
                strokeWidth="16"
                strokeLinecap="round"
            />
            <path
                d="M 388 378 L 290 292"
                fill="none"
                stroke="#161B22"
                strokeWidth="16"
                strokeLinecap="round"
            />
            <circle cx="256" cy="220" r="14" fill="#161B22" />
        </svg>
    );
};
