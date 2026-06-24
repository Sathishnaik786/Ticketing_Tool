import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Box, ChevronRight, Layers, LayoutGrid, Search, Server } from 'lucide-react';
import { apiCall } from '@/services/api';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category_id: string;
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiCall('/v1/esm/catalog/categories', 'GET');
        if (response.success && response.data) {
          setCategories(response.data);
          if (response.data.length > 0) {
            setSelectedCategoryId(response.data[0].id);
          }
        }
      } catch (err: any) {
        toast.error('Failed to load catalog categories: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await apiCall(`/v1/esm/catalog/categories/${selectedCategoryId}/items`, 'GET');
        if (response.success && response.data) {
          setItems(response.data);
        }
      } catch (err: any) {
        toast.error('Failed to load catalog items: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategoryId]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Enterprise Service Catalog
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Request resources, software licenses, operations help, and hardware config setups.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search catalog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Catalog Categories
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm font-medium transition-all shrink-0 md:shrink ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102 font-semibold'
                      : 'hover:bg-accent/40 text-foreground/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 hidden lg:block transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-40 bg-accent/20 border border-border/40 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl p-8 bg-accent/5">
              <Box className="h-12 w-12 text-muted-foreground animate-bounce" />
              <h3 className="mt-4 text-lg font-semibold">No catalog items found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mt-2">
                Try searching for something else or choosing a different category.
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-card hover:bg-accent/10 border border-border/50 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 shadow-sm flex flex-col justify-between cursor-pointer"
                  onClick={() => navigate(`/app/esm/catalog/${item.id}`)}
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Server className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                      {item.description || 'No description available for this service request item.'}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-end text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                    <span>Request Service</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
