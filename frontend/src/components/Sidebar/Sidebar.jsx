import React from 'react';
import './sidebar.css';
import { HiFilter, HiDotsCircleHorizontal, HiSearch, HiQuestionMarkCircle } from "react-icons/hi"
import Filter from './components/Filter/Filter';
import Description from './components/Description/Description';
import Search from './components/Search/Search';
import Help from './components/Help/Help';

function Sidebar(props) {
	return (
		<>
			<div className='menu-bar' id='menu_bar'>
				<HiFilter title='Filter' className='filter-button' id='filter-button' onClick={
					() => {
						if (props.toggleFilter) {
							props.closeFilter();
							document.getElementById('filter-button').style.color = '#9bc';
						} else {
							props.openFilter();
							document.getElementById('filter-button').style.color = '#eee';
						}
					}
				} onMouseEnter={
					() => {
						document.getElementById('filter-button').style.color = '#222';
					}
				} onMouseLeave={
					() => {
						document.getElementById('filter-button').style.color = 
						props.toggleFilter ? '#eee' : '#9bc';
					}
				}/>
				<HiDotsCircleHorizontal id='description-button' title="Course Information" className="description-button" onClick={
					() => {
						if (props.toggleDesc) {
							props.closeDesc();
						} else {
							props.openDesc(false, "Click on a node to view course information");
						}
					}
				} onMouseEnter={
					() => {
						document.getElementById('description-button').style.color = '#222';
					}
				} onMouseLeave={
					() => {
						document.getElementById('description-button').style.color = 
						props.toggleDesc ? '#eee' : '#9bc';
					}
				} />
				<HiSearch id='search-button' title="Search" className="search-button" onClick={
					() => {
						if (props.toggleSearch) {
							props.closeSearch();
							document.getElementById('search-button').style.color = '#9bc';
						} else {
							props.openSearch(); /*TODO*/
							document.getElementById('search-button').style.color = '#eee';
						}
					}
				} onMouseEnter={
					() => {
						document.getElementById('search-button').style.color = '#222';
					}
				} onMouseLeave={
					() => {
						document.getElementById('search-button').style.color = 
						props.toggleSearch ? '#eee' : '#9bc';
					}
				} />
				<HiQuestionMarkCircle id='help-button' title="Help" className="help-button" onClick={
					() => {
						if (props.toggleHelp) {
							props.closeHelp();
							document.getElementById('help-button').style.color = '#9bc';
						} else {
							props.openHelp();
							document.getElementById('help-button').style.color = '#eee';
						}
					}
				} onMouseEnter={
					() => {
						document.getElementById('help-button').style.color = '#222';
					}
				} onMouseLeave={
					() => {
						document.getElementById('help-button').style.color = 
						props.toggleHelp ? '#eee' : '#9bc';
					}
				} />
			</div>
			
			<div className='content-container'>
				<Filter {...props} />
				<Description/>
				<Search {...props} />
				<Help />
			</div>

		</>
	);
}

export default Sidebar;