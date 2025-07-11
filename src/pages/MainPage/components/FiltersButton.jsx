import { Link } from 'react-router-dom';

export const FiltersButton = () => {
    return (
        <Link to={'/filters'}>
            <button className="filter-button">
                <FiltersButton />
                <span>Фильтры</span>
            </button>
        </Link>
    );
};
