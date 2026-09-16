'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Search, Plus, RefreshCw, Edit2, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AdminProduct, ProductStockStatus } from '@/types/admin';
import { ProductCategory } from '@/types';
import { TableSkeleton } from '@/components/admin/AdminSkeletons';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { ProductFormModal } from '@/components/admin/modals/ProductFormModal';
import { ConfirmDialog } from '@/components/admin/modals/ConfirmDialog';
import styles from './Products.module.css';

const CATEGORIES: ProductCategory[] = ['Hoodies', 'T-Shirts', 'Shoes', 'Jackets', 'Coats', 'Cargos'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<ProductStockStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Inline stock state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);

  const fetchProducts = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.getProducts({
        page: currentPage,
        limit: 8,
        search: searchQuery,
        category: categoryFilter,
        stockStatus: stockFilter,
      });

      setProducts(res.data);
      setTotalProducts(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to synchronize product archive';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, searchQuery, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFormSubmit = async (data: Partial<AdminProduct>) => {
    if (editingProduct) {
      await adminApi.updateProduct(editingProduct.id, data);
    } else {
      await adminApi.createProduct(data);
    }
    fetchProducts(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    await adminApi.deleteProduct(deletingProductId);
    setIsDeleteOpen(false);
    setDeletingProductId(null);
    fetchProducts(true);
  };

  const handleSaveStock = async (id: string) => {
    await adminApi.updateProductStock(id, editingStockVal);
    setEditingStockId(null);
    fetchProducts(true);
  };

  const getStockBadgeClass = (status: ProductStockStatus) => {
    switch (status) {
      case 'in_stock':
        return styles.statusInStock;
      case 'low_stock':
        return styles.statusLowStock;
      default:
        return styles.statusOutOfStock;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Controls: Search, Category, Stock filter, Add button */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search archive by garment name, category, or lore..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.actionsGroup}>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as ProductCategory | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as ProductStockStatus | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt;5)</option>
            <option value="low_stock">Low Stock (1–5)</option>
            <option value="out_of_stock">Archived Out of Stock (0)</option>
          </select>

          <button
            onClick={() => fetchProducts(true)}
            disabled={isRefreshing}
            className={styles.refreshBtn}
            title="Refresh archive inventory"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>SYNC</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormModalOpen(true);
            }}
            className={styles.addBtn}
          >
            <Plus size={15} />
            <span>ENSCRIBE GARMENT</span>
          </button>
        </div>
      </div>

      {/* Main Table or Loading/Empty States */}
      {isLoading ? (
        <TableSkeleton rows={7} columns={7} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => fetchProducts()} isRetrying={isRefreshing} />
      ) : products.length === 0 ? (
        <AdminEmptyState
          title="NO ARCHIVE PIECES FOUND"
          description="No garments match your active query or category parameters."
          kanji="在庫無"
          actionLabel="CLEAR FILTERS"
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
            setStockFilter('all');
          }}
        />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.productsTable}>
              <thead>
                <tr>
                  <th>GARMENT SPECIFICATION</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>DISCOUNT</th>
                  <th>INVENTORY STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <Image
                          src={p.images?.[0] || '/assets/castle/01-entrance.png'}
                          alt={p.name}
                          width={44}
                          height={54}
                          className={styles.productThumb}
                        />
                        <div className={styles.productInfo}>
                          <div className={styles.productName}>{p.name}</div>
                          <div className={styles.productJapanese}>
                            {p.japaneseTitle} // {p.gsm || 500} GSM
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.categoryTag}>{p.category}</span>
                    </td>

                    <td style={{ color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td style={{ color: p.discount ? '#ff8598' : '#8a8594' }}>
                      {p.discount ? `${p.discount}% OFF` : '—'}
                    </td>

                    <td>
                      <div className={styles.stockCell}>
                        {editingStockId === p.id ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Number(e.target.value))}
                              className={styles.stockInput}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className={styles.actionBtn}
                              title="Save stock"
                            >
                              <Check size={13} color="#2ecc71" />
                            </button>
                          </>
                        ) : (
                          <span
                            onClick={() => {
                              setEditingStockId(p.id);
                              setEditingStockVal(p.stock);
                            }}
                            style={{ cursor: 'pointer', textDecoration: 'underline dotted', fontWeight: 600 }}
                            title="Click to edit stock level directly"
                          >
                            {p.stock} units
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${getStockBadgeClass(p.stockStatus)}`}>
                        {p.stockStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actionIcons}>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsFormModalOpen(true);
                          }}
                          className={styles.actionBtn}
                          title="Edit specification"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProductId(p.id);
                            setIsDeleteOpen(true);
                          }}
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          title="Remove from archive"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationBar}>
            <div>
              Showing {products.length} of {totalProducts} archive pieces
            </div>

            <div className={styles.pageControls}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={styles.pageBtn}
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={styles.pageBtn}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        initialData={editingProduct}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="VOID ARCHIVE GARMENT"
        message="Are you certain you wish to purge this piece from the citadel archive? This action will remove it from collection catalogs and customer storefront view."
        confirmLabel="PURGE PIECE"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeletingProductId(null);
        }}
      />
    </div>
  );
}
