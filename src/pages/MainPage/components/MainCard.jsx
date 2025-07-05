import { useEffect, useRef, useState } from 'react';

import '../mainPage.css';

import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

import { formatDate } from '../../../tools/FormatDate.jsx';
import { sendFeedback } from '../../../tools/api.js';
import { wordCutter } from '../../../tools/wordCutter.js';

import { RoundBackArrowIcon } from '../../../shared/icons/RoundBackArrowIcon.jsx';

import { MainCardInfo } from './MainCardInfo.jsx';
import { MainPageLikeButton } from './MainPageLikeButton.jsx';
import { MainPageDislikeButton } from './MainPageDislikeButton.jsx';

export const MainCard = ({ event, canDrag, loadNext }) => {
    const [slide, setSlide] = useState(0);
    const [datePart, timePart] = formatDate(event.date).split(' ');
    const price = event.price !== '0' ? `${event.price} рублей` : 'Бесплатно';

    const [expanded, setExpanded] = useState(false);
    const start = useRef(Date.now());
    const [moreOpened, setMoreOpened] = useState(false);
    const [refClicked, setRefClicked] = useState(false);

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-250, 250], [-15, 15]);
    const opacity = useTransform(x, [-250, -160, 0, 160, 250], [0, 1, 1, 1, 0]);
    const controls = useAnimation();

    async function handleDragEnd(_, info) {
        const offsetX = info.offset.x;
        const threshold = window.innerWidth * 0.25;

        if (Math.abs(offsetX) < threshold) {
            await controls.start({ x: 0, rotate: 0 });
            return;
        }

        await controls.start({
            x: offsetX < 0 ? -window.innerWidth : window.innerWidth,
            opacity: 0,
            transition: { duration: 0.25 },
        });
        await finishCard(offsetX > 0);
    }

    const [isDragging, setIsDragging] = useState(false);
    function onTap() {
        if (!isDragging) {
            setSlide((n) => (n + 1) % event.imageURL.length);
        }
    }

    function handleRefClicked() {
        setRefClicked(true);
    }

    const openDetails = () => {
        setMoreOpened(true);
        setExpanded(true);
    };

    useEffect(() => {
        start.current = Date.now();
    }, [event.id]);

    async function finishCard(like) {
        console.log(event.imageURL[0], event.referralLink);
        const viewedSeconds = Math.round((Date.now() - start.current) / 1000);
        try {
            sendFeedback(event.id, like, viewedSeconds, moreOpened, refClicked);
        } catch (err) {
            console.warn(err);
        }
        loadNext(event.id);
    }

    return (
        <motion.div
            className="mainCard"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: -1000, right: 1000 }}
            onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
            onDragTransitionEnd={() => setIsDragging(false)}
            animate={controls}
            onTap={onTap}
        >
            <div className="main-card-img-wrapper">
                <img src={event.imageURL[slide]} alt={event.name} className="main-card-img" />
                <motion.div
                    className="card-compact"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="main-card-name-flex">
                        <RoundBackArrowIcon />
                        <p className="main-card-name">{wordCutter(event.name, 6)}</p>
                    </div>
                    <p className="main-card-price">{price}</p>
                    <button
                        className="main-more-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            openDetails();
                        }}
                    >
                        Подробнее
                    </button>
                </motion.div>

                <MainCardInfo
                    event={event}
                    expanded={expanded}
                    datePart={datePart}
                    setExpanded={setExpanded}
                    handleRefClicked={handleRefClicked}
                    price={price}
                    timePart={timePart}
                />

                <MainPageLikeButton controls={controls} finishCard={finishCard} />
                <MainPageDislikeButton controls={controls} finishCard={finishCard} />
            </div>
        </motion.div>
    );
};
