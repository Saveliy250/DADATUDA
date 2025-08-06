import React from 'react';

import styles from './FavoriteCardList.module.css';

import { ArrowSubtitle } from '../../../../shared/components/ArrowSubtitle/ArrowSubtitle';

import { FavoriteCard } from '../FavoriteCard/FavoriteCard';

import { Event } from '../../../../shared/models/event';

interface FavoriteCardListProps {
    cardList: Event[];
    title: string;
    color: string;
    handleClick: (event: Event) => void;
}

export const FavoriteCardList = ({ cardList, title, color, handleClick }: FavoriteCardListProps) => {
    return (
        <>
            <ArrowSubtitle color={color} subtitle={title} />

            <div className={styles.cardList}>
                {cardList.map((item) => (
                    <FavoriteCard key={item.id} event={item} handleClick={() => handleClick(item)} />
                ))}
            </div>
        </>
    );
};
