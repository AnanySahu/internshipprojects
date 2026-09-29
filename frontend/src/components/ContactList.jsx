import React from 'react';
import { Eye, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown, UserX, Plus } from 'lucide-react';

const ContactList = ({
  contacts,
  loading,
  sortBy,
  order,
  onSort,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  isSearching,
}) => {
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4, marginLeft: '4px' }} />;
    }
    return order === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
    );
  };

  if (loading) {
    return (
      <div className="table-card">
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Loading contacts...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <UserX className="empty-icon" />
          <h3>{isSearching ? 'No matching contacts found' : 'Your contact list is empty'}</h3>
          <p>
            {isSearching
              ? 'Try refining your search keyword or clearing the search query.'
              : 'Keep track of all your personal and professional connections in one secure place.'}
          </p>
          {!isSearching && (
            <button className="btn btn-primary" onClick={onAddNew}>
              <Plus size={16} />
              <span>Add Your First Contact</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-wrapper">
        <table className="contacts-table">
          <thead>
            <tr>
              <th
                className="th-sortable"
                onClick={() => onSort('name')}
                title="Sort by name"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Contact</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              <th
                className="th-sortable"
                onClick={() => onSort('email')}
                title="Sort by email"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Email</span>
                  {renderSortIcon('email')}
                </div>
              </th>

              <th>Phone</th>

              <th
                className="th-sortable"
                onClick={() => onSort('company')}
                title="Sort by company"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Company / Role</span>
                  {renderSortIcon('company')}
                </div>
              </th>

              <th
                className="th-sortable"
                onClick={() => onSort('createdAt')}
                title="Sort by date created"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>Added</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>

              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id}>
                {/* Name & Avatar */}
                <td>
                  <div className="contact-name-cell">
                    <div className="contact-avatar">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{contact.name}</div>
                      {contact.address?.city && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {contact.address.city}{contact.address.state ? `, ${contact.address.state}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td>
                  <a
                    href={`mailto:${contact.email}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    title={contact.email}
                  >
                    {contact.email}
                  </a>
                </td>

                {/* Phone */}
                <td>
                  <a
                    href={`tel:${contact.phone}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {contact.phone}
                  </a>
                </td>

                {/* Company & Role */}
                <td>
                  {contact.company?.name ? (
                    <div>
                      <span className="badge-tag">{contact.company.name}</span>
                      {contact.company.jobTitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {contact.company.jobTitle}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                  )}
                </td>

                {/* Created Date */}
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(contact.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Action buttons */}
                <td>
                  <div className="actions-cell">
                    <button
                      className="btn-icon"
                      onClick={() => onView(contact)}
                      title="View details"
                      aria-label={`View ${contact.name}`}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(contact)}
                      title="Edit contact"
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Edit2 size={17} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDelete(contact)}
                      title="Delete contact"
                      aria-label={`Delete ${contact.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;
