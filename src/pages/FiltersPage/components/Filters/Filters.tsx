import React from 'react';

import styles from './Filters.module.css';

import { DatePickerInput } from '@mantine/dates';
import { RangeSlider, TextInput } from '@mantine/core';
import 'dayjs/locale/ru';

import { CategoryList } from '../CategoryList/CategoryList';

import { useFilter } from '../../../../hooks/useFilter';

export const Filters = () => {
    const { selectedCategories, setSelectedCategories, price, setPrice, date, setDate, searchQuery, setSearchQuery } =
        useFilter();

    return (
        <div className={styles.filters}>
            <div className={styles.categoryBlock}>
                <TextInput
                    placeholder="Поиск"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    radius="lg"
                    styles={{
                        input: {
                            backgroundColor: '#efefef',
                            color: '#8f8e94',
                            border: 'none',
                            paddingLeft: 32,
                            paddingRight: 23,
                        },
                    }}
                    leftSection={
                        <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.90757" cy="7.22642" r="6.05757" stroke="#8F8E94" strokeWidth="1.7" />
                            <path
                                d="M16.4133 16.7561C16.7548 17.084 17.2939 17.0786 17.6175 16.7441C17.9411 16.4096 17.9267 15.8726 17.5852 15.5446L16.4133 16.7561ZM11.6309 10.9946L11.0449 11.6004L16.4133 16.7561L16.9993 16.1504L17.5852 15.5446L12.2168 10.3889L11.6309 10.9946Z"
                                fill="#8F8E94"
                            />
                        </svg>
                    }
                />
            </div>

            <div className={styles.categoryBlock}>
                <h3 className={styles.categoryHeader}>Категории</h3>

                <CategoryList selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
            </div>

            <div className={styles.categoryBlock}>
                <h3 className={styles.categoryHeader}>Цена</h3>

                <RangeSlider
                    label={(value) => `${value}₽`}
                    size="md"
                    labelAlwaysOn
                    color="#e5e5e5"
                    min={0}
                    max={10000}
                    minRange={1000}
                    step={100}
                    value={price}
                    onChange={setPrice}
                    styles={{
                        track: { height: 3, backgroundColor: '#e5e5e5' },
                        bar: { height: 3, backgroundColor: '#8f8e94' },
                        thumb: { borderWidth: 0, height: 16, width: 16, backgroundColor: '#8f8e94' },
                        label: { backgroundColor: 'transparent', color: '#8f8e94', fontSize: 14 },
                    }}
                />
            </div>

            <div className={styles.categoryBlock}>
                <h3 className={styles.categoryHeader}>Дата</h3>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <DatePickerInput
                        style={{ flex: 1 }}
                        radius="lg"
                        styles={{ input: { backgroundColor: '#efefef', color: '#8f8e94', border: 'none' } }}
                        minDate={new Date()}
                        dropdownType="modal"
                        valueFormat="DD MMM YYYY"
                        size="md"
                        placeholder="от"
                        value={date[0]}
                        onChange={(newDate) => setDate([newDate ? new Date(newDate) : null, date[1]])}
                    />
                    <DatePickerInput
                        style={{ flex: 1 }}
                        radius="lg"
                        styles={{ input: { backgroundColor: '#efefef', color: '#8f8e94', border: 'none' } }}
                        minDate={date[0] || new Date()}
                        dropdownType="modal"
                        valueFormat="DD MMM YYYY"
                        size="md"
                        placeholder="до"
                        value={date[1]}
                        onChange={(newDate) => setDate([date[0], newDate ? new Date(newDate) : null])}
                    />
                </div>
            </div>
        </div>
    );
};
