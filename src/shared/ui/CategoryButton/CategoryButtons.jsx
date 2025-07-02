export const CategoryButton = ({children, dataValue, className, onClick, selected}) => {
    return (
        <button
            className={`category-btn ${className} ${selected ? 'selected' : ''}`}
            data-value={dataValue}
            onClick={onClick}
        >
            {children}
        </button>
    )
}