import React, { Component } from 'react';


// Для інлайн-стилів використовуйте такі стилі:
const tooltipContainerStyle = {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
    width: 'auto',
    maxWidth: '10vw',

};

const tooltipTextStyle = {
    whiteSpace: 'nowrap',
    visibility: 'hidden',
    width: 'auto',
    // maxWidth: '10vw',
    backgroundColor: '#FBFAF6',
    color: '#575756',
    textAlign: 'center',
    borderRadius: '6px',
    padding: '0.3vw',
    fontFamily: 'Ink Free, sans-serif',
    fontSize: '0.7vw',
    position: 'absolute',
    zIndex: '1',
    bottom: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: '0',
    transition: 'opacity 1s',
    // whiteSpace: 'normal', // Allow wrapping
    wordWrap: 'break-word', // Break long words
    maxWidth: '95vw', // Ensure it doesn't exceed viewport width
    maxHeight: '90vh', // Ensure it doesn't exceed viewport height
    overflow: 'auto', // Allow scrolling if content exceeds height
};

const tooltipTextVisibleStyle = {
    ...tooltipTextStyle,
    visibility: 'visible',
    opacity: 1,
};

// Компонент Tooltip
class Tooltip extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    showTooltip() {
        this.setState({ visible: true });
    }

    hideTooltip() {
        this.setState({ visible: false });
    }

    render() {
        const { text, children } = this.props;
        const { visible } = this.state;

        return (
            <div
                className="tooltip-container"
                style={tooltipContainerStyle}
                onMouseEnter={this.showTooltip}
                onMouseLeave={this.hideTooltip}
            >
                {children}
                <span
                    className="tooltip-text"
                    style={visible ? tooltipTextVisibleStyle : tooltipTextStyle}
                >
                    {text}
                </span>
            </div>
        );
    }
}



export default Tooltip;