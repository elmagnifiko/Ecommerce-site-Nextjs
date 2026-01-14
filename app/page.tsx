'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import { productsAPI, categoriesAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image: string | null;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  products_count: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ per_page: 8 }),
        categoriesAPI.getAll(),
      ]);
      
      setProducts(productsRes.data.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Bienvenue sur notre E-Commerce
        </h1>
        <p className="text-xl mb-6">
          Découvrez nos produits de qualité à prix compétitifs
        </p>
        <Link
          href="/products"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
        >
          Voir tous les produits
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {category.products_count} produits
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Produits populaires</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
              Aucun produit disponible pour le moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {Number(product.price).toFixed(2)} €
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}