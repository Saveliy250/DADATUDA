import React, { useState } from 'react';

import styles from './FiltersPage.module.css';

import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { RangeSlider } from '@mantine/core';
import 'dayjs/locale/ru';

import { CategoryList } from './components/CategoryList/CategoryList';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { Header } from '../../shared/components/Header/Header';

export const FiltersPage: React.FC = () => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [price, setPrice] = useState<[number, number]>([0, 700]);
    const [date, setDate] = useState<[Date | null, Date | null]>([null, null]);

    const handleApplyClick = () => {
        const filterData = {
            category: selectedCategories,
            prices: {
                min: price[0],
                max: price[1],
            },
            dates: {
                from: date[0],
                to: date[1],
            },
        };
        console.log(filterData);
    };

    const handleDateChange = (value: [string | null, string | null]) => {
        const newDates: [Date | null, Date | null] = [
            value[0] ? new Date(value[0]) : null,
            value[1] ? new Date(value[1]) : null,
        ];
        setDate(newDates);
    };

    return (
        <>
            <Header handleClick={handleApplyClick} title="фильтры" withIcon={true} />

            <div className={styles.filters}>
                <div className={styles.categoryBlock}>
                    <ArrowSubtitle
                        color="#FF6CF1"
                        subtitle={
                            <>
                                категории
                                <br />
                                мероприятий
                            </>
                        }
                    />

                    <CategoryList
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />
                </div>

                <div className={styles.categoryBlock}>
                    <ArrowSubtitle
                        color="#FF601C"
                        subtitle={
                            <>
                                цены
                                <br />
                                мероприятий
                            </>
                        }
                    />
                    <RangeSlider
                        label={(value) => `${value} руб`}
                        size="md"
                        color="rgb(255, 96, 28)"
                        min={0}
                        max={1000}
                        value={price}
                        onChange={setPrice}
                    />
                </div>

                <div className={styles.categoryBlock}>
                    <ArrowSubtitle
                        color="#8CF63B"
                        subtitle={
                            <>
                                даты
                                <br />
                                мероприятий
                            </>
                        }
                    />

                    <DatesProvider settings={{ locale: 'ru' }}>
                        <DatePickerInput
                            clearable
                            minDate={new Date()}
                            dropdownType="modal"
                            valueFormat="DD MMM YYYY"
                            size="md"
                            type="range"
                            placeholder="Выберите даты мероприятий"
                            value={date}
                            onChange={handleDateChange}
                        />
                    </DatesProvider>
                </div>
            </div>
        </>
    );
};
