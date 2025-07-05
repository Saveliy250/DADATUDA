import { AnimatePresence, motion } from 'framer-motion';

export const MainCardInfo = ({ event, expanded, setExpanded, datePart, timePart, price, handleRefClicked }) => {
    return (
        <AnimatePresence motion="wait">
            {expanded && (
                <motion.div
                    key="details"
                    className={`card-details`}
                    initial={{ y: '40%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '40%', opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="card-details__scroll">
                        <h2>{event.name}</h2>
                        <h3>Адрес:</h3>
                        <p>{event.address}</p>
                        <h3>Время:</h3>
                        <p>
                            Ближайшее {datePart} {timePart}
                        </p>
                        <h3>Цена:</h3>
                        <p>{price}</p>
                        <h3>О мероприятии:</h3>
                        <p>{event.description}</p>
                    </div>
                    <div className="card-details__actions">
                        {event.referralLink && (
                            <a
                                className="card-details__go"
                                href={event.referralLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleRefClicked}
                            >
                                Перейти на сайт мероприятия
                            </a>
                        )}
                        <button
                            className="card-details__hide"
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
