import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import axios from '../../api/axiosInstance';

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  background-color: ${props =>
    props.status === 'online' ? 'var(--success)' :
      props.status === 'lagging' ? 'var(--warning)' :
        props.status === 'connecting' ? 'var(--info)' :
          props.status === 'warning' ? 'var(--warning)' :
            props.status === 'error' ? 'var(--danger)' : 'var(--danger)'};
  box-shadow: 0 0 4px ${props =>
    props.status === 'online' ? 'var(--success)' :
      props.status === 'lagging' ? 'var(--warning)' :
        props.status === 'connecting' ? 'var(--info)' :
          props.status === 'warning' ? 'var(--warning)' :
            props.status === 'error' ? 'var(--danger)' : 'var(--danger)'};
`;

const WidgetContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 4px;
  //background: var(--dark);
  //color: var(--light);
  //font-size: 12px;
`;

const StatusText = styled.span`
  margin-left: 6px;
`;

const TermActiveWidget = () => {
  const [status, setStatus] = useState('online');

  const [responseTime, setResponseTime] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const {data} = await axios.get('/api/terminal/status');
        setStatus(data.status);
        setResponseTime(data.responseTime);
        setLastCheck(data.lastCheck);
        setErrors(data.errors);
      } catch (error) {
        console.error('Failed to fetch terminal status:', error);
        setStatus('disconnected');
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'lagging':
        return 'Lagging';
      case 'disconnected':
        return 'Disconnected';
      case 'connecting':
        return 'Connecting';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <WidgetContainer>
      <StatusIndicator status={status}/>
      <span className="adminFont">{getStatusText()}</span>
      {responseTime && <StatusText>{responseTime}ms</StatusText>}
      {errors > 0 && <StatusText>Errors: {errors}</StatusText>}
    </WidgetContainer>
  );
};

export default TermActiveWidget;
