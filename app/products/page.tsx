'use client';

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { productsAPI } from "@/lib/api";
import Layout from "@/components/layout";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category_id?: number;
  stock?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://127.0.0.1:8080";

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
      return "https://via.placeholder.com/300x200?text=Produit";
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    let cleanPath = imagePath.trim();
    while (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    return `${API_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔍 Récupération des produits...");
        const res = await productsAPI.getAll();
        console.log("📦 Réponse API complète:", res.data);

        if (!ignore) {
          let productsList: Product[] = [];
          
          // Gérer différents formats de réponse
          if (Array.isArray(res.data)) {
            productsList = res.data;
          } else if (res.data?.data) {
            if (Array.isArray(res.data.data)) {
              productsList = res.data.data;
            } else if (res.data.data?.data && Array.isArray(res.data.data.data)) {
              productsList = res.data.data.data;
            }
          } else if (res.data?.products && Array.isArray(res.data.products)) {
            productsList = res.data.products;
          }
          
          console.log("✅ Produits extraits:", productsList);
          console.log("📊 Nombre de produits:", productsList.length);
          
          setProducts(productsList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("❌ Erreur récupération produits:", err);

          if (err instanceof AxiosError) {
            console.error("Status:", err.response?.status);
            console.error("Data:", err.response?.data);
            
            if (err.response?.status === 404) {
              setError("Aucun produit trouvé");
            } else if (err.response?.status === 500) {
              setError("Erreur serveur, réessayez plus tard");
            } else if (err.response?.status === 401) {
              setError("Vous devez être connecté");
            } else {
              setError(`Impossible de charger les produits (${err.response?.status || 'Erreur réseau'})`);
            }
          } else {
            setError("Une erreur inattendue s'est produite");
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Chargement des produits...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nos Produits</h1>
          <p className="text-gray-600">Découvrez notre sélection de produits de qualité</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <span className="text-8xl mb-4 block">📦</span>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucun produit disponible
            </h2>
            <p className="text-gray-500 mb-6">
              Revenez plus tard pour découvrir nos nouveaux produits
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const imageUrl = getImageUrl(product.image);
                
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error(`❌ Erreur image pour ${product.name}:`, product.image);
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Produit";
                        }}
                      />
                      {product.stock !== undefined && product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Rupture
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(product.price)}
                        </span>
                        
                        {product.stock !== undefined && (
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0
                              ? `${product.stock} en stock`
                              : "Rupture"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
