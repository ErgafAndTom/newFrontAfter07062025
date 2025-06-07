import React from 'react';
import classNames from 'classNames';


const Button = (props) => {
	return (
		<div className={classNames('ple-toolbar__block', props.className)}>
			<button type="button" title={props.title} onClick={props.onClick}>
				<i className={classNames('ple-sp-ico', 'ple-abs', props.iconclassName)}>{props.title}</i>
			</button>
			{!!props.children && (
				<div className="ple-toolbar__pop">{props.children}</div>
			)}
		</div>
	);
};


export default Button;