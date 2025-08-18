import React from 'react';

import styles from './FiltersPage.module.css';

import { Button, Transition } from '@mantine/core';

import { useNavigate } from 'react-router-dom';

import { useFilter } from '../../hooks/useFilter';

import { Header } from '../../shared/components/Header/Header';
import { Filters } from './components/Filters/Filters';

const resetButtonTransition = {
    in: { opacity: 1, width: '30%' },
    out: { opacity: 0, width: '0%' },
    transitionProperty: 'opacity, width',
};

export const FiltersPage = () => {
    const navigate = useNavigate();

    const { isDirty, handleApplyFilters, handleResetFilters } = useFilter();

    const handleApplyFiltersAndNavigate = async () => {
        if (isDirty) {
            await handleApplyFilters();
            await navigate('/');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.contentWrapper}>
                <Header title="Фильтры" withIcon={true} handleClick={() => void navigate('/')} />
                <Filters />
            </div>

            <div className={styles.buttonContainer}>
                <Transition mounted={isDirty} transition={resetButtonTransition} duration={300} timingFunction="ease">
                    {(styles) => (
                        <Button
                            onClick={handleResetFilters}
                            radius="lg"
                            style={{
                                ...styles,
                                backgroundColor: '#efefef',
                                color: '#8f8e94',
                                border: 'none',
                                fontWeight: 'inherit',
                                height: 47,
                            }}
                        >
                            Сбросить
                        </Button>
                    )}
                </Transition>

                <Button
                    onClick={handleApplyFiltersAndNavigate}
                    radius="lg"
                    style={{
                        width: isDirty ? '70%' : '100%',
                        backgroundColor: 'var(--color-acid)',
                        transition: 'width 0.1s ease',
                        fontWeight: 'inherit',
                        height: 47,
                        color: 'var(--color-black)',
                    }}
                >
                    {!isDirty ? 'Выберите фильтры' : 'Показать мероприятия'}
                </Button>
            </div>
        </div>
    );
};
