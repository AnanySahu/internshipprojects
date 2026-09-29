import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ContactList from './components/ContactList';
import ContactModal from './components/ContactModal';
import ViewModal from './components/ViewModal';
import DeleteModal from './components/DeleteModal';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import api from './api/client';
import { Plus, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalContacts: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch contacts with current query parameters
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await api.get(`/contacts?${params.toString()}`);
      setContacts(res.data.contacts || []);
      setPagination(res.data.pagination);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle column sort toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
    setPage(1); // Reset to first page on sort change
  };

  // Search handler
  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1); // Reset to page 1 on new search
  };

  // Contact creation / update handler
  const handleSaveContact = async (formData) => {
    setIsSubmitting(true);
    try {
      if (activeContact) {
        // Edit existing
        const res = await api.patch(`/contacts/${activeContact._id}`, formData);
        showToast('Contact updated successfully', 'success');
        setContacts((prev) =>
          prev.map((c) => (c._id === activeContact._id ? res.data : c))
        );
      } else {
        // Create new
        await api.post('/contacts', formData);
        showToast('Contact created successfully', 'success');
        fetchContacts();
      }
      setIsContactModalOpen(false);
      setActiveContact(null);
    } catch (err) {
      throw err; // Propagate to modal so it displays the message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact deletion handler
  const handleConfirmDelete = async () => {
    if (!activeContact) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/contacts/${activeContact._id}`);
      showToast('Contact deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setActiveContact(null);
      fetchContacts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="header-titles">
          <h1>My Contacts</h1>
          <p>Organize, search, and manage your network effortlessly</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchContacts}
            title="Refresh contacts"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setActiveContact(null);
              setIsContactModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filter Options */}
      <div className="toolbar-card">
        <SearchBar value={search} onChange={handleSearchChange} />

        <div className="toolbar-actions">
          <div className="select-wrapper">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
                setPage(1);
              }}
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="createdAt-asc">Oldest Added</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="company-asc">Company (A → Z)</option>
              <option value="email-asc">Email (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Table List */}
      <ContactList
        contacts={contacts}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        isSearching={!!search.trim()}
        onView={(contact) => {
          setActiveContact(contact);
          setIsViewModalOpen(true);
        }}
        onEdit={(contact) => {
          setActiveContact(contact);
          setIsContactModalOpen(true);
        }}
        onDelete={(contact) => {
          setActiveContact(contact);
          setIsDeleteModalOpen(true);
        }}
        onAddNew={() => {
          setActiveContact(null);
          setIsContactModalOpen(true);
        }}
      />

      {/* Pagination Controls */}
      {contacts.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Contact Create/Edit Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setActiveContact(null);
        }}
        onSubmit={handleSaveContact}
        initialData={activeContact}
        isSubmitting={isSubmitting}
      />

      {/* Contact View Modal */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setActiveContact(null);
        }}
        contact={activeContact}
        onEdit={(contact) => {
          setActiveContact(contact);
          setIsContactModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveContact(null);
        }}
        onConfirm={handleConfirmDelete}
        contactName={activeContact?.name}
        isDeleting={isSubmitting}
      />

      {/* Toast Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

const Main = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      {isAuthenticated ? <Dashboard /> : <AuthModal />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

export default App;
