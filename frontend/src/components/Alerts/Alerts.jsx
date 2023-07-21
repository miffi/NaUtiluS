import React from 'react'
import {Alert} from '@mui/material'
import './alerts.css'

function Alerts() {
	return (
		<div className='alerts=container'>
			<Alert id='alert-max-expand' className='alert-box' severity="info">
        Node can no longer be expanded
      </Alert>
			<Alert id='alert-empty-filter' className='alert-box' severity="warning">
        Filter cannot be empty
      </Alert>
			<Alert id='alert-no-match' className='alert-box' severity="warning">
        No courses match this filter
      </Alert>
			<Alert id='alert-server-down' className='alert-box' severity="error">
				The server is currently down, please try again later
      </Alert>
		</div>
	)
}

export default Alerts