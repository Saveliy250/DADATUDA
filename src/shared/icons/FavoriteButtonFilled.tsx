import React from 'react';

interface FavoriteButtonFilledProps {
    handleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

export const FavoriteButtonFilled = ({ handleClick, className }: FavoriteButtonFilledProps) => {
    return (
        <button className={className} onClick={handleClick}>
            <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M18.9559 0C17.7365 0.019926 16.5437 0.377534 15.498 1.03671C14.4522 1.69589 13.5906 2.63329 13 3.75426C12.4094 2.63329 11.5478 1.69589 10.502 1.03671C9.45627 0.377534 8.26346 0.019926 7.04407 0C5.10021 0.0887265 3.26877 0.982085 1.94989 2.4849C0.631004 3.98772 -0.0681244 5.97784 0.00524241 8.02047C0.00524241 13.1934 5.18798 18.843 9.53473 22.6735C10.5052 23.5303 11.7323 24 13 24C14.2677 24 15.4948 23.5303 16.4653 22.6735C20.812 18.843 25.9948 13.1934 25.9948 8.02047C26.0681 5.97784 25.369 3.98772 24.0501 2.4849C22.7312 0.982085 20.8998 0.0887265 18.9559 0Z"
                    fill="#FF6CF1"
                />
            </svg>
        </button>
    );
};
