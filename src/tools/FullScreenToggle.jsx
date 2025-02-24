import React, { useState, useEffect } from 'react';

function FullscreenToggle() {
    // Состояние, показывающее, находимся ли мы в полноэкранном режиме
    const [isFullscreen, setIsFullscreen] = useState(false);

    // При монтировании компонента добавляем слушатель для события fullscreenchange
    useEffect(() => {
        const handleFullscreenChange = () => {
            // document.fullscreenElement не равен null, если включён полноэкранный режим
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        // Очистка при размонтировании
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        const element = document.documentElement;
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
            // Входим в полноэкранный режим, с учетом префиксов для разных браузеров
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => console.error(err));
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen().catch(err => console.error(err));
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen().catch(err => console.error(err));
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen().catch(err => console.error(err));
            }
        } else {
            // Выходим из полноэкранного режима
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.error(err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen().catch(err => console.error(err));
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen().catch(err => console.error(err));
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen().catch(err => console.error(err));
            }
        }
    };

    return (
        <button onClick={toggleFullscreen}>
            {isFullscreen ? 'Выйти из полноэкранного режима' : 'Перейти в полноэкранный режим'}
        </button>
    );
}

export default FullscreenToggle;