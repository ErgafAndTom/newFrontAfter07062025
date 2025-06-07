import React from 'react';
import Header from "./Header";
import {Route, Routes} from "react-router-dom";
import Home from "./Home";
import Products from "./Products";
import Footer from "./Footer";
import './styles.css';

const products = [
    {id: 1, name: 'Product 1', description: 'Description of Product 1'},
    {id: 2, name: 'Product 2', description: 'Description of Product 2'},
    {id: 3, name: 'Product 3', description: 'Description of Product 3'},
];

const MainSite = () => {
    return (
        <div>
            <Header/>
            <Routes>
                <Route path="/" exact component={<Home/>}/>
                <Route path="/products" component={<Products/>}/>
            </Routes>
            <Footer/>
        </div>
    );
}

export default MainSite;
