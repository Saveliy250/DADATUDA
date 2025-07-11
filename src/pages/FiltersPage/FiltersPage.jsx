import { useState } from 'react';

import styles from './FiltersPage.module.css';

import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { RangeSlider } from '@mantine/core';
import 'dayjs/locale/ru';

import { CategoryList } from './components/CategoryList/CategoryList.jsx';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle/ArrowSubtitle.jsx';
import { Header } from '../../shared/components/Header/Header.jsx';

export const FiltersPage = () => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [price, setPrice] = useState([0, 700]);
    const [date, setDate] = useState([]);

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

    return (
        <>
            <Header onApplyClick={handleApplyClick} title="фильтры" withIcon={true} />

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
                            minDate={`${new Date()}`}
                            dropdownType="modal"
                            valueFormat="DD MMM YYYY"
                            size="md"
                            type="range"
                            placeholder="Выберите даты мероприятий"
                            value={date}
                            onChange={setDate}
                        />
                    </DatesProvider>
                </div>
            </div>
        </>
    );
};
