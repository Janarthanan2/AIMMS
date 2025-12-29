import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getMyNotifications, markNotificationRead } from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const userId = localStorage.getItem('userId');
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (userId) {
      setNotifications([]); // Clear on filter change
      setPage(0);
      setHasMore(true);
      loadNotifications(0, priorityFilter, true);
    }
  }, [userId, priorityFilter]);

  const loadNotifications = async (pageNum, priority, isReset = false) => {
    setLoading(true);
    try {
      const data = await getMyNotifications(userId, pageNum, PAGE_SIZE, priority);
      if (data.length < PAGE_SIZE) setHasMore(false);

      setNotifications(prev => isReset ? data : [...prev, ...data]);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, priorityFilter);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id, userId);
      setNotifications(notifications.map(n =>
        n.notificationId === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  if (!userId) return <div className="p-6">Please log in to view notifications.</div>;

  const Card = ({ note }) => {
    return (
      <StyledWrapper>
        <div className={`card ${note.read ? 'opacity-60' : ''}`}>
          <div className="header">
            <span className="icon">
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" fillRule="evenodd" />
              </svg>
            </span>
            <div className="flex flex-col">
              <p className="alert">
                {note.priority} Priority
                {note.isPinned && <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">PINNED</span>}
              </p>
              {note.createdBy && (
                <span className="text-xs text-gray-500">Posted by: {note.createdBy.name}</span>
              )}
            </div>
          </div>
          <h4 className="font-bold text-gray-800 mt-2">{note.title}</h4>
          <p className="message">
            {note.body}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            {new Date(note.createdAt).toLocaleString()}
          </div>
          <div className="actions">
            {!note.read ? (
              <button className="mark-as-read" onClick={() => handleMarkRead(note.notificationId)}>
                Mark as Read
              </button>
            ) : (
              <button className="read" disabled>
                Read
              </button>
            )}
          </div>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter by:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 grid gap-4">
        {notifications.length > 0 ? (
          notifications.map(n => <Card key={n.notificationId} note={n} />)
        ) : (
          !loading && <div className="text-center py-8 text-gray-500">No notifications found.</div>
        )}
      </div>

      {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}

      {!loading && hasMore && notifications.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

const StyledWrapper = styled.div`
  .card {
    max-width: 100%; /* Adapting max-width to fit list */
    border-width: 1px;
    border-color: rgba(219, 234, 254, 1);
    border-radius: 1rem;
    background-color: rgba(255, 255, 255, 1);
    padding: 1rem;
  }

  .header {
    display: flex;
    align-items: center;
    grid-gap: 1rem;
    gap: 1rem;
  }

  .icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(96, 165, 250, 1);
    padding: 0.5rem;
    color: rgba(255, 255, 255, 1);
  }

  .icon svg {
    height: 1rem;
    width: 1rem;
  }

  .alert {
    font-weight: 600;
    color: rgba(107, 114, 128, 1);
  }

  .message {
    margin-top: 1rem;
    color: rgba(107, 114, 128, 1);
  }

  .actions {
    margin-top: 1.5rem;
  }

  .actions a, .actions button {
    text-decoration: none;
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  .mark-as-read, .read {
    display: inline-block;
    border-radius: 0.5rem;
    width: 100%;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
  }

  .read {
    background-color: rgba(59, 130, 246, 1);
    color: rgba(255, 255, 255, 1);
  }

  .mark-as-read {
    margin-top: 0.5rem;
    background-color: rgba(249, 250, 251, 1);
    color: rgba(107, 114, 128, 1);
    transition: all .15s ease;
  }

  .mark-as-read:hover {
    background-color: rgb(230, 231, 233);
  }`;
