import React, { useState } from 'react';
import './sidebar.css';
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri';

function Sidebar() {
    const [toggleMenu, setToggleMenu] = useState(true);

    function closeMenu() {
        setToggleMenu(true);
        document.getElementById('menu_content').style.width = '0';
        document.getElementById('menu_content').style.minWidth = '0';
        document.getElementById('menu_content_text').style.display = 'none';
    }
    function openMenu() {
        setToggleMenu(false);
        document.getElementById('menu_content').style.width = '30%';
        document.getElementById('menu_content').style.minWidth = '200px';
        document.getElementById('menu_content_text').style.display = 'block';
    }

    return (
        <>
            <div className='menu-bar' id='menu_bar'>
                <div className='menu-icon'>
                    {toggleMenu
                        ? <RiMenu3Line color='#eee' size='27' onClick={openMenu} />
                        : <RiCloseLine color='#eee' size='27' onClick={closeMenu} />
                    }
                </div>
                <a href = "#filter" className="filter-button" onClick={openMenu}>Filter</a>
                <a href = "#description" className="description-button" onClick={openMenu}>Description</a>
            </div>
            <div className='menu-content' id='menu_content'>
                <div className='menu-content-text' id='menu_content_text'>
                    <div className="menu-filter" id="filter">
                        <h1>Filter</h1>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                        <p>whatever will be inside the filter</p>
                    </div>
                    <div className="menu-description" id="description">
                        <h1>Description</h1>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                        <p>whatever will be inside the description</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;