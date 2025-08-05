import React from 'react';

import styles from './MainCardInfo.module.css';

import { AnimatePresence, motion } from 'framer-motion';

import { Event } from '../../../../shared/models/event';

interface MainCardInfoProps {
    event: Event;
    expanded: boolean;
    setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    datePart: string;
    timePart: string;
    price: string;
    handleRefClicked: () => void;
}

export const MainCardInfo: React.FC<MainCardInfoProps> = ({
    event,
    expanded,
    setExpanded,
    datePart,
    timePart,
    price,
    handleRefClicked,
}) => {
    return (
        <AnimatePresence mode="wait">
            {expanded && (
                <motion.div
                    key="details"
                    className={styles.cardDetails}
                    initial={{ y: '40%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '40%', opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.innerInfo}>
                        <h2 className={styles.innerInfoTitle}>{event.name}</h2>
                        <h3 className={styles.innerInfoHeader}>Адрес:</h3>
                        <p className={styles.innerInfoDescription}>{event.address}</p>
                        <h3 className={styles.innerInfoHeader}>Время:</h3>
                        <p className={styles.innerInfoDescription}>
                            Ближайшее {datePart} {timePart}
                        </p>
                        <h3 className={styles.innerInfoHeader}>Цена:</h3>
                        <p className={styles.innerInfoDescription}>{price}</p>
                        <h3 className={styles.innerInfoHeader}>О мероприятии:</h3>
                        <p className={styles.innerInfoDescription}>{event.description}</p>
                    </div>
                    <div className={styles.cardDetailsActions}>
                        {event.referralLink && (
                            <a
                                className={styles.cardDetailsLink}
                                href={event.referralLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleRefClicked}
                            >
                                Перейти на сайт мероприятия
                            </a>
                        )}
                        <button
                            className={styles.cardDetailsHide}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(false);
                            }}
                        >
                            Скрыть
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
