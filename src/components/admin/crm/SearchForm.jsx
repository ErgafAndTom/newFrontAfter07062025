import React, {useEffect, useState} from 'react';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';

const SearchForm = ({props, value, onChangeFunc, handledField}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [text, setText] = useState('');

  const onTextChanged = (e) => {
    let value = e.target.value;
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      setSuggestions(props.sort().filter(v => regex.test(v)));
    } else {
      setSuggestions([]);
    }
    setText(value);
  }

  const suggestionSelected = (value) => {
    setText(value);
    setSuggestions([]);
  }

  const renderSuggestions = () => {
    if (suggestions.length === 0) {
      return null;
    }
    return (
      <ListGroup variant="flush">
        {suggestions.map((item, index) => <ListGroup.Item action key={index} onClick={() => suggestionSelected(item)}>{item}</ListGroup.Item>)}
      </ListGroup>
    );
  }

    // useEffect(() => {
    //     onChangeFunc(formIndex, 'unitName', event)
    // }, [setText]);

  return (
    <Container>
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Control type="text" value={text} onChange={onTextChanged} placeholder="Enter search term" />
        </Form.Group>
      </Form>
      {renderSuggestions()}
    </Container>
  );
}
export default SearchForm;