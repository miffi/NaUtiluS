import React from 'react';
import './sidebar.css';
import { HiFilter, HiDotsCircleHorizontal, HiSearch, HiQuestionMarkCircle } from "react-icons/hi"
import Filter from './components/Filter/Filter';
import Description from './components/Description/Description';
import Search from './components/Search/Search';
import Help from './components/Help/Help';

function Sidebar(props) {
	const toggleFilter = props.toggleFilter;
	const closeFilter = props.closeFilter;
	const openFilter = props.openFilter;

	const toggleDesc = props.toggleDesc;
	const closeDesc = props.closeDesc;
	const openDesc = props.openDesc;

	const toggleSearch = props.toggleSearch;
	const closeSearch = props.closeSearch;
	const openSearch = props.openSearch;

	const toggleHelp = props.toggleHelp;
	const closeHelp = props.closeHelp;
	const openHelp = props.openHelp;

	return (
		<>
			<div className='menu-bar' id='menu_bar'>
				<HiFilter title='Filter' className='filter-button' id='filter-button' onClick={
					() => {
						if (toggleFilter) {
							closeFilter();
							document.getElementById('filter-button').style.color = '#9bc';
						} else {
							openFilter();
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
						toggleFilter ? '#eee' : '#9bc';
					}
				}/>
				<HiDotsCircleHorizontal id='description-button' title="Course Information" className="description-button" onClick={
					() => {
						if (toggleDesc) {
							closeDesc();
						} else {
							openDesc(false, "Click on a node to view course information");
						}
					}
				} onMouseEnter={
					() => {
						document.getElementById('description-button').style.color = '#222';
					}
				} onMouseLeave={
					() => {
						document.getElementById('description-button').style.color = 
						toggleDesc ? '#eee' : '#9bc';
					}
				} />
				<HiSearch id='search-button' title="Search" className="search-button" onClick={
					() => {
						if (toggleSearch) {
							closeSearch();
							document.getElementById('search-button').style.color = '#9bc';
						} else {
							openSearch(); /*TODO*/
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
						toggleSearch ? '#eee' : '#9bc';
					}
				} />
				<HiQuestionMarkCircle id='help-button' title="Help" className="help-button" onClick={
					() => {
						if (toggleHelp) {
							closeHelp();
							document.getElementById('help-button').style.color = '#9bc';
						} else {
							openHelp();
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
						toggleHelp ? '#eee' : '#9bc';
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