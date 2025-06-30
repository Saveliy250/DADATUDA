import {Link} from "react-router-dom";

export const FiltersPageHeader = ({onApplyClick}) => {
    return (
        <header>
            <Link to={"/"} className="back-arrow" id="applyBtn" onClick={onApplyClick}>
                <svg width="34" height="31" viewBox="0 0 34 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1.5L2 15.5L16 29.5" stroke="#FFFFFF" strokeWidth="2"/>
                    <path d="M15.5 16H32.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </Link>
            <h1>Фильтры</h1>
        </header>
    )
}
