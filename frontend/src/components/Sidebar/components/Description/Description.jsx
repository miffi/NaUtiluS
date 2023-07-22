import React from 'react';
import './description.css';

function Description() {
	return (
		<div className="menu-description" id="description">
			<div className='course-info'>
				<h1 id='description_header' className='description-header'>Course Information</h1>
				<div id='description_placeholder' className='description-placeholder'></div>
				<div id='description_content' className='description-content'>
					<div id='course_info' className='course-info'>
						Hello
					</div><br />
					<div id='course_semester' className='course-semester'>
						<div id='semester_label'>Semester</div>
						<div id='semester_content'>1, 2</div>
					</div><br />
					<div id='course_prereq' className='course-prereq'>
						<div id='semester_label'>Prerequisites</div>
						<div id='prereq_content'>1, 2</div>
					</div><br />
				</div>
			</div>
		</div>
	);
}

export default Description;