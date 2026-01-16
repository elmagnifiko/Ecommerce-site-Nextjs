'use client';

import { useState } from 'react';
import Layout from '@/components/layout';
import { productsAPI, categoriesAPI, authAPI } from '@/lib/api';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, apiCall: () => Promise<any>) => {
    setLoading(true);
    setResult(`🔍 Test de ${name}...\n`);
    
    try {
      const response = await apiCall();
      setResult(prev => prev + `\n✅ Succès!\n\nRéponse:\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(prev => prev + `\n❌ Erreur!\n\nStatus: ${error.response?.status}\nMessage: ${error.message}\n\nDétails:\n${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Test des APIs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => testEndpoint('GET /api/products', () => productsAPI.getAll())}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Tester GET /products
          </button>
          
          <button
            onClick={() => testEndpoint('GET /api/categories', () => categoriesAPI.getAll())}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Tester GET /categories
          </button>
          
          <button
            onClick={() => testEndpoint('GET /api/products/1', () => productsAPI.getById(1))}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Tester GET /products/1
          </button>
          
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              setResult(`Token actuel: ${token || 'Aucun token'}`);
            }}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Vérifier le token
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Informations</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>API Base URL:</strong> http://127.0.0.1:8080/api</li>
            <li><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</li>
            <li><strong>Token stocké:</strong> {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Oui' : 'Non'}</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
