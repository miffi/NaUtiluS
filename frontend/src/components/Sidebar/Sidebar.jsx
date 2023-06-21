import React from 'react';
import './sidebar.css';

import Filter from './components/Filter/Filter';
import Description from './components/Description/Description';

function Sidebar(props) {
	return (
		<>
			<div className='menu-bar' id='menu_bar'>
				<div className='menu-icon'>
					<img src="logo.svg" alt="" />
				</div>
				<a href="#filter" className="filter-button" onClick={
					() => {
						props.toggleFilter ? props.closeFilter() : props.openFilter();
					}
				}>Filter</a>
				<a href="#description" className="description-button" onClick={
					() => {
						props.toggleDesc ? props.closeDesc() : props.openDesc(false, "Click on a node to view course information");
					}
				}>Description</a>
			</div>
			<div className='content-container'>
				<Filter {...props} />
				<Description {...props} />
			</div>

		</>
	);
}

export default Sidebar;