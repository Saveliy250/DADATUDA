import React from 'react';
import { Link } from 'react-router-dom';
import { FilterButtonIcon } from '../../../shared/icons/FilterButtonIcon';

export const FiltersButton: React.FC = () => {
    return (
        <Link to={'/filters'}>
            <button className="filter-button">
                <FilterButtonIcon />
                <span>Фильтры</span>
            </button>
        </Link>
    );
};
