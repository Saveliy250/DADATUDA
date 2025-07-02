import '../FiltersPageStyles.css'
import WhiteLogoIco from "../icons/WhiteLogoIco.jsx";
import {useState} from "react";
import {CategoryList} from "../CategoryList.jsx";
import {ArrowSubtitle} from "../shared/ui/ArrowTitle/ArrowSubtitle.jsx";
import {FiltersPageHeader} from "../shared/ui/FiltersPageHeader/FiltersPageHeader.jsx";
import {DatePickerInput, DatesProvider} from "@mantine/dates";
import 'dayjs/locale/ru';
import {RangeSlider} from "@mantine/core";

function FiltersPage() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [price, setPrice] = useState([0, 700]);
    const [date, setDate] = useState([]);

    const handleApplyClick = () => {
        const filterData = {
            category: selectedCategories,
            prices: {
                min: price[0],
                max: price[1]
            },
            dates: {
                from: date[0],
                to: date[1]
            }
        }
        console.log(filterData);
    }

    return (
        <>
            <FiltersPageHeader onApplyClick={handleApplyClick}/>
            <div className="filters">
                <div className='category-block'>
                    <ArrowSubtitle color='#FF6CF1' subtitle={<>категории<br/>мероприятий</>} />
                    <CategoryList
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    />
                </div>
                <div className="price-block">
                    <ArrowSubtitle
                        color='#FF601C'
                        subtitle={<>цены<br/>мероприятий</>}
                    />
                    <RangeSlider
                        label={(value) => `${value} руб`}
                        size='md'
                        color='rgb(255, 96, 28)'
                        min={0}
                        max={1000}
                        value={price}
                        onChange={setPrice}
                    />
                </div>
                <div className="calendar-block">
                    <ArrowSubtitle
                        color='#8CF63B'
                        subtitle={<>даты<br/>мероприятий</>}
                    />
                    <DatesProvider settings={{ locale: 'ru'}}>
                    <DatePickerInput
                        clearable
                        minDate={`${new Date()}`}
                        dropdownType="modal"
                        valueFormat="DD MMM YYYY"
                        size='md'
                        type="range"
                        placeholder="Выберите даты мероприятий"
                        value={date}
                        onChange={setDate}
                    />
                    </DatesProvider>
                </div>
                <footer>
                    <WhiteLogoIco/>
                </footer>
            </div>
        </>
    )
}

export default FiltersPage;