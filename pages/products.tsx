"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { productsAPI } from "../lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category_id?: number;
  stock?: number;
}

interface ProductsResponse {
  data: Product[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ URL de base de votre API Laravel
  const API_BASE_URL = "http://127.0.0.1:8080";

  // ✅ Fonction pour construire l'URL complète de l'image
  const getImageUrl = (imagePath: string | undefined): string => {
    console.log("🔍 getImageUrl called with:", imagePath);
    
    if (!imagePath) {
      console.log("❌ No image path provided");
      return "https://via.placeholder.com/300x200?text=Produit";
    }
    
    // Si l'image commence déjà par http, la retourner telle quelle
    if (imagePath.startsWith('http')) {
      console.log("✅ Full URL detected:", imagePath);
      return imagePath;
    }
    
    // Nettoyer le chemin de l'image
    let cleanPath = imagePath.trim();
    
    // Enlever /storage/ si présent au début
    if (cleanPath.startsWith('/storage/')) {
      cleanPath = cleanPath.substring(9); // Enlever '/storage/'
    } else if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.substring(8); // Enlever 'storage/'
    }
    
    // Enlever le slash initial s'il existe
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    const finalUrl = `${API_BASE_URL}/storage/${cleanPath}`;
    console.log("✅ Final URL generated:", finalUrl);
    
    return finalUrl;
  };

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await productsAPI.getAll();

        if (!ignore) {
          console.log("API Response:", res.data);
          
          let productsList: Product[] = [];
          
          if (Array.isArray(res.data)) {
            productsList = res.data;
          } else if (res.data && Array.isArray(res.data.data)) {
            productsList = res.data.data;
          } else if (res.data && res.data.products && Array.isArray(res.data.products)) {
            productsList = res.data.products;
          }
          
          setProducts(productsList);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Erreur récupération produits:", err);

          if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
              setError("Aucun produit trouvé");
            } else if (err.response?.status === 500) {
              setError("Erreur serveur, réessayez plus tard");
            } else if (err.response?.status === 401) {
              setError("Vous devez être connecté");
            } else {
              setError("Impossible de charger les produits");
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
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des produits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nos Produits</h1>

      {products.length === 0 ? (
        <p style={styles.emptyMessage}>Aucun produit disponible pour le moment</p>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => {
            const imageUrl = getImageUrl(product.image);
            console.log(`Product: ${product.name}`);
            console.log(`  - Image path from API: "${product.image}"`);
            console.log(`  - Generated URL: "${imageUrl}"`);
            
            return (
              <div key={product.id} style={styles.card}>
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={styles.image}
                  onError={(e) => {
                    console.error(`Erreur chargement image pour ${product.name}:`, product.image);
                    e.currentTarget.src = "https://via.placeholder.com/300x200?text=Produit";
                  }}
                />
                <div style={styles.cardContent}>
                  <h2 style={styles.productName}>{product.name}</h2>
                  {product.description && (
                    <p style={styles.description}>{product.description}</p>
                  )}
                  <div style={styles.priceContainer}>
                    <span style={styles.price}>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(product.price)}
                    </span>
                    {product.stock !== undefined && (
                      <span
                        style={{
                          ...styles.stock,
                          color: product.stock > 0 ? "#48bb78" : "#e53e3e",
                        }}
                      >
                        {product.stock > 0
                          ? `${product.stock} en stock`
                          : "Rupture de stock"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: '20px', 
    maxWidth: '1200px', 
    margin: '0 auto' 
  },
  loading: { 
    textAlign: 'center' as const, 
    padding: '40px', 
    fontSize: '18px',
    color: '#4a5568'
  },
  error: { 
    color: '#e53e3e', 
    textAlign: 'center' as const, 
    padding: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px'
  },
  retryButton: {
    marginTop: '16px',
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600' as const
  },
  title: { 
    fontSize: '32px', 
    fontWeight: 'bold' as const,
    marginBottom: '32px', 
    textAlign: 'center' as const,
    color: '#2d3748'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '24px' 
  },
  card: { 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    overflow: 'hidden' as const,
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  image: { 
    width: '100%', 
    height: '220px', 
    objectFit: 'cover' as const 
  },
  placeholderImage: {
    width: '100%',
    height: '220px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#a0aec0',
    fontSize: '14px'
  },
  cardContent: { 
    padding: '20px' 
  },
  productName: { 
    fontSize: '20px',
    fontWeight: '600' as const,
    marginBottom: '8px',
    color: '#2d3748'
  },
  description: { 
    color: '#718096', 
    fontSize: '14px', 
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  priceContainer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0'
  },
  price: { 
    fontSize: '22px', 
    fontWeight: 'bold' as const, 
    color: '#2d3748' 
  },
  stock: { 
    fontSize: '13px',
    fontWeight: '500' as const
  },
  emptyMessage: { 
    textAlign: 'center' as const, 
    color: '#718096', 
    padding: '60px 20px',
    fontSize: '18px'
  }
};