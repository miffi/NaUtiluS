import React, { useState } from 'react';
import './sidebar.css';
import { RiCloseLine, RiMenu3Line } from 'react-icons/ri';

function Sidebar() {
    const [toggleMenu, setToggleMenu] = useState(false);

    function openMenu() {
        setToggleMenu(false);
        document.getElementById('menu_content').style.width = '0';
        document.getElementById('menu_content_text').style.display = 'none';
    }
    function closeMenu() {
        setToggleMenu(true);
        document.getElementById('menu_content').style.width = '40%';
        document.getElementById('menu_content_text').style.display = 'block';
    }

    return (
        <>
            <div className='menu-bar' id='menu_bar'>
                <div className='menu-icon'>
                    {toggleMenu
                        ? <RiCloseLine color='#eee' size='27' onClick={openMenu} />
                        : <RiMenu3Line color='#eee' size='27' onClick={closeMenu} />
                    }
                </div>
                <a href = '#filter'>Filter</a>
                <a href = '#Description'>Description</a>
            </div>
            <div className='menu-content' id='menu_content'>
                <div className='menu-content-text' id='menu_content_text'>
                    <div className="menu-filter">
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
                    <div className="menu-description">
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