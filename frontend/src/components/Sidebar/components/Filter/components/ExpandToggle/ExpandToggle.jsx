import React, { useState } from 'react'
import './expandToggle.css'
import Switch from 'react-switch'

function ExpandToggle() {
	const [toggleSwitch, setToggleSwitch] = useState(false);

	function handleToggleSwitch() {
		setToggleSwitch(prevBool => !prevBool);
	}

	return (
		<div>
			<div id='expand-toggle-container' className='expand-toggle-container'>
				<Switch id='expand-toggle-switch' className='expand-toggle-switch' checked={toggleSwitch} onChange={handleToggleSwitch}
					uncheckedIcon={false} checkedIcon={false} onColor='#9ca' height={15} width={30}/>
				{toggleSwitch
				? <div className='expand-toggle-label'>Right click shows relationships under the selected departments</div>
				: <div className='expand-toggle-label'>Right click shows all relationships</div>}
			</div>
			<br />
		</div>
	)
}

export default ExpandToggle