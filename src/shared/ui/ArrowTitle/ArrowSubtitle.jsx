import {FilterSubIcon} from "../../../icons/FilterSubIcon.jsx";

export const ArrowSubtitle = ({subtitle, color}) => {
    return (
        <div className="flex-container">
            <FilterSubIcon color={color} />
            <div style={{color: `${color}`}} className='subtitle'>{subtitle}</div>
        </div>
    )
}