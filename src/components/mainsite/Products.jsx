import React from 'react';
import ProductItem from './ProductItem';

const products = [
    { id: 1, name: 'Product 1', description: 'Description of Product 1' },
    { id: 2, name: 'Product 2', description: 'Description of Product 2' },
    { id: 3, name: 'Product 3', description: 'Description of Product 3' },
];

const Products = () => {
    return (
        <div>
            <h2>Our Products</h2>
            <div className="product-list">
                {products.map(product => (
                    <ProductItem key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

export default Products;
