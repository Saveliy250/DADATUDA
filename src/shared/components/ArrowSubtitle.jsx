import { FilterSubIcon } from '../icons/FilterSubIcon.jsx';

export const ArrowSubtitle = ({ withText = true, subtitle, color, className = '' }) => {
    return (
        <div className="flex-container">
            <FilterSubIcon color={color} />
            {withText && (
                <div style={{ color: `${color}` }} className={`subtitle ${className}`}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};
