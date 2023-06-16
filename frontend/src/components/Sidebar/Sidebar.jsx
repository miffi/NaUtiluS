import React from 'react';
import './sidebar.css';
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri';

import Filter from './components/Filter/Filter';
import Description from './components/Description/Description';

function Sidebar(props) {
    return (
        <>
            <div className='menu-bar' id='menu_bar'>
                <div className='menu-icon'>
                    {props.toggleFilter || props.toggleDesc
                        ? <RiCloseLine color='#eee' size='27' onClick={() => {
                            props.closeFilter();
                            props.closeDesc();
                        }} />
                        : <RiMenu3Line color='#eee' size='27' onClick={() => {
                            props.openDesc();
                            props.openFilter();
                        }} />
                    }
                </div>
                <a href = "#filter" className="filter-button" onClick={
                    () => {
                        props.toggleFilter ? props.closeFilter() : props.openFilter();
                    }
                }>Filter</a>
                <a href = "#description" className="description-button" onClick={
                    () => {
                        props.toggleDesc ? props.closeDesc() : props.openDesc("Click on a module to view its description");
                    }
                }>Description</a>
            </div>
            <div className='content-container'>
                <Filter props/>
                <Description />
            </div>
            
        </>
    );
}

export default Sidebar;

    // const [toggleFilter, setToggleFilter] = useState(false);
    // const [toggleDesc, setToggleDesc] = useState(false);
    

    // function closeFilter() {
    //     maximizeFilter();
    //     setToggleFilter(false);
    //     document.getElementById('filter').style.left = '-40%';
    //     // document.getElementById('menu_content').style.width = '0';
    //     // document.getElementById('menu_content').style.minWidth = '0';
    //     // document.getElementById('menu_content_text').style.display = 'none';
    // }
    // function openFilter() {
    //     if (toggleDesc) {
    //         minimizeFilter();
    //     }
    //     setToggleFilter(true);
    //     document.getElementById('filter').style.left = '100px';
    //     // document.getElementById('menu_content').style.width = '30%';
    //     // document.getElementById('menu_content').style.minWidth = '270px';
    //     // document.getElementById('menu_content_text').style.display = 'block';
    // }

    // function closeDesc() {
    //     if (toggleFilter) {
    //         maximizeFilter();
    //     }
    //     setToggleDesc(false);
    //     document.getElementById('description').style.bottom = '-42%';
    //     // document.getElementById('menu_content').style.width = '0';
    //     // document.getElementById('menu_content').style.minWidth = '0';
    //     // document.getElementById('menu_content_text').style.display = 'none';
    // }
    // function openDesc() {
    //     if (toggleFilter) {
    //         minimizeFilter();
    //     }
    //     setToggleDesc(true);
    //     document.getElementById('description').style.bottom = '0';
    //     // document.getElementById('menu_content').style.width = '30%';
    //     // document.getElementById('menu_content').style.minWidth = '270px';
    //     // document.getElementById('menu_content_text').style.display = 'block';
    // }

    // function minimizeFilter() {
    //     document.getElementById('filter').style.height = '60%';
    // }

    // function maximizeFilter() {
    //     document.getElementById('filter').style.height = '100%';
    // }