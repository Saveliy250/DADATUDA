import {Link} from "react-router-dom";
import './FiltersPageStyles.css'
import TheaterIcon from "./icons/TheatreIcon.jsx";
import ConcertIcon from "./icons/ConcertIcon.jsx";
import ExhibitionIco from "./icons/ExhibitionIco.jsx";
import StandupIco from "./icons/StandupIco.jsx";
import ExcursionIco from "./icons/ExcursionIco.jsx";
import SportIco from "./icons/SportIco.jsx";
import BarIco from "./icons/BarIco.jsx";
import RestaurantIco from "./icons/RestaurantIco.jsx";
import CafeIco from "./icons/CafeIco.jsx";
import WhiteLogoIco from "./icons/WhiteLogoIco.jsx";
import {useState} from "react";

const FiltersPageHeader = ({onApplyClick}) => {
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

const SubtitleWithArrow = () => {
    return (
        <div className="flex-container">
            <div className="arrow">
                <svg width="34" height="24" viewBox="0 0 34 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12L32 12" stroke="#FFFFFF" strokeWidth="2.35842"/>
                    <path d="M21.2633 22L32.0527 12L21.2633 2" stroke="#FFFFFF" strokeWidth="3.15789" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="subtitle"><>категории<br/>мероприятий</></div>
        </div>
    )
}

const CategoryButton = ({children, dataValue, className, onClick, selected}) => {
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

const CategoryButtons = ({selectedCategories, setSelectedCategories}) => {
    const handleCategoryClick = (category) => {
        setSelectedCategories((prev) =>{
            if (prev.includes(category)) {
                return prev.filter((item) => item !== category);
            } else {
                return [...prev, category];
            }
        })
    }

    return (
        <div className={'categories'}>
            <CategoryButton
                dataValue="theater"
                className={"theater"}
                onClick={() => handleCategoryClick("theater")}
                selected={selectedCategories.includes("theater")}
            >
                <TheaterIcon/>
                Спектакли
            </CategoryButton>
            <CategoryButton
                dataValue="concert"
                className={"concert"}
                onClick={() => handleCategoryClick("concert")}
                selected={selectedCategories.includes("concert")}
            >
                <ConcertIcon />
                Концерты
            </CategoryButton>
            <CategoryButton
                dataValue="exhibition"
                className={"exhibition"}
            onClick={() => handleCategoryClick("exhibition")}
            selected={selectedCategories.includes("exhibition")}
            >
                <ExhibitionIco />
                Выставки
            </CategoryButton>
            <CategoryButton
                dataValue="standup"
                className={"standup"}
            onClick={() => handleCategoryClick("standup")}
            selected={selectedCategories.includes("standup")}
            >
                <StandupIco />
                Стендап
            </CategoryButton>
            <CategoryButton
                dataValue="excursion"
                className={"excursion"}
            onClick={() => handleCategoryClick("excursion")}
            selected={selectedCategories.includes("excursion")}
            >
                <ExcursionIco />
                Экскурсии
            </CategoryButton>
            <CategoryButton
                dataValue="sport"
                className={"sport"}
            onClick={() => handleCategoryClick("sport")}
            selected={selectedCategories.includes("sport")}
            >
                <SportIco />
                Спорт
            </CategoryButton>
            <CategoryButton
                dataValue="bar"
                className={"bar"}
            onClick={() => handleCategoryClick("bar")}
            selected={selectedCategories.includes("bar")}
            >
                <BarIco />
                Бары
            </CategoryButton>
            <CategoryButton
                dataValue="restaurant"
                className={"restaurant"}
            onClick={() => handleCategoryClick("restaurant")}
            selected={selectedCategories.includes("restaurant")}
            >
                <RestaurantIco />
                Рестораны
            </CategoryButton>
            <CategoryButton
                dataValue="cafe"
                className={"cafe"}
            onClick={() => handleCategoryClick("cafe")}
            selected={selectedCategories.includes("cafe")}
            >
                <CafeIco />
                Кофейни
            </CategoryButton>
        </div>
    )
}

const SoloLogoFooter = () => {
    return (
        <footer>
            <WhiteLogoIco/>
        </footer>
    )
}

function Filters() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const handleApplyClick = (event) => {
        console.log(selectedCategories);

    }
    return (
        <>
            <FiltersPageHeader
                onApplyClick={handleApplyClick}
            />
            <SubtitleWithArrow />
            <CategoryButtons
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
            />
            <SoloLogoFooter/>
        </>
    )
}

export default Filters;