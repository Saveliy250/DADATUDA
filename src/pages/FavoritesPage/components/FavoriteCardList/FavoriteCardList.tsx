import React from 'react';
import styles from './FavoriteCardList.module.css';
import { FavoriteCard } from '../FavoriteCard/FavoriteCard';
import type { FavoritePageEvent } from '../../types';

interface FavoriteCardListProps {
  cardList: FavoritePageEvent[];
  onStarClick: (eventId: string | number) => void;
  onDislike: (eventId: string | number) => void;
}

export const FavoriteCardList = ({ cardList, onStarClick, onDislike }: FavoriteCardListProps) => {
  return (
    <div className={styles.cardList}>
      {cardList.map((item) => (
        <FavoriteCard
          key={String(item.id)}
          event={item}
          onStarClick={onStarClick}
          onDislike={onDislike} 
        />
      ))}
    </div>
  );
};