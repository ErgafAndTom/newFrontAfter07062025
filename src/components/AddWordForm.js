// src/components/AddWordForm.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addWordSuccess } from '../reducers/wordsSlice';

const AddWordForm = () => {
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const [category, setCategory] = useState('');
    const [meanings, setMeanings] = useState(['']);

    const handleMeaningChange = (index, value) => {
        const newMeanings = [...meanings];
        newMeanings[index] = value;
        setMeanings(newMeanings);
    };

    const addMeaningField = () => {
        setMeanings([...meanings, '']);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newWord = {
            id: Date.now(),
            text,
            category,
            meanings: meanings.map((m, index) => ({ id: index + 1, meaning: m })),
        };
        dispatch(addWordSuccess(newWord));
        setText('');
        setCategory('');
        setMeanings(['']);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div>
                <label>Слово: </label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Категорія: </label>
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Значення: </label>
                {meanings.map((meaning, index) => (
                    <input
                        key={index}
                        type="text"
                        value={meaning}
                        onChange={(e) => handleMeaningChange(index, e.target.value)}
                        required
                    />
                ))}
                <button type="button" onClick={addMeaningField}>
                    Додати значення
                </button>
            </div>
            <button type="submit">Додати слово</button>
        </form>
    );
};

export default AddWordForm;
