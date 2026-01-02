import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Tasks.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_to: null
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(id, full_name),
          related_order_data:orders!tasks_related_order_fkey(order_number),
          related_customer_data:customers!tasks_related_customer_fkey(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      setError('שגיאה בטעינת משימות: ' + err.message);
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (!formData.title.trim()) {
        setError('כותרת המשימה היא שדה חובה');
        return;
      }

      if (editingTask) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            due_date: formData.due_date || null,
            completed_at: formData.status === 'done' ? new Date().toISOString() : null
          })
          .eq('id', editingTask.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      setShowModal(false);
      resetForm();
      loadTasks();
    } catch (err) {
      setError('שגיאה בשמירת משימה: ' + err.message);
      console.error('Error saving task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      due_date: task.due_date || '',
      assigned_to: task.assigned_to || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTasks();
    } catch (err) {
      setError('שגיאה במחיקת משימה: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          completed_at: newStatus === 'done' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (err) {
      setError('שגיאה בעדכון סטטוס: ' + err.message);
      console.error('Error updating status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      assigned_to: null
    });
    setEditingTask(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
    cancelled: filteredTasks.filter(t => t.status === 'cancelled')
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'דחוף';
      case 'high': return 'גבוה';
      case 'medium': return 'בינוני';
      case 'low': return 'נמוך';
      default: return priority;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'לביצוע';
      case 'in_progress': return 'בעבודה';
      case 'done': return 'הושלם';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };

  const TaskCard = ({ task }) => (
    <div className="task-card" style={{ borderRightColor: getPriorityColor(task.priority) }}>
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <div className="task-actions">
          <button className="btn-icon" onClick={() => handleEdit(task)} title="ערוך">
            <i className="fas fa-edit"></i>
          </button>
          <button className="btn-icon btn-delete" onClick={() => handleDelete(task.id)} title="מחק">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
          {getPriorityLabel(task.priority)}
        </span>

        {task.due_date && (
          <span className="task-date">
            <i className="fas fa-calendar"></i>
            {new Date(task.due_date).toLocaleDateString('he-IL')}
          </span>
        )}

        {task.related_order_data && (
          <span className="task-order">
            <i className="fas fa-shopping-cart"></i>
            הזמנה {task.related_order_data.order_number}
          </span>
        )}

        {task.related_customer_data && (
          <span className="task-customer">
            <i className="fas fa-user"></i>
            {task.related_customer_data.name}
          </span>
        )}
      </div>

      {task.status !== 'done' && task.status !== 'cancelled' && (
        <div className="task-status-actions">
          {task.status === 'todo' && (
            <button
              className="btn-status btn-start"
              onClick={() => handleStatusChange(task.id, 'in_progress')}
            >
              <i className="fas fa-play"></i> התחל
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              className="btn-status btn-complete"
              onClick={() => handleStatusChange(task.id, 'done')}
            >
              <i className="fas fa-check"></i> סיים
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>ניהול משימות</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus"></i> משימה חדשה
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="tasks-filters">
        <div className="filter-group">
          <label>סטטוס:</label>
          <div className="filter-buttons">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              הכל ({tasks.length})
            </button>
            <button
              className={filterStatus === 'todo' ? 'active' : ''}
              onClick={() => setFilterStatus('todo')}
            >
              לביצוע ({tasksByStatus.todo.length})
            </button>
            <button
              className={filterStatus === 'in_progress' ? 'active' : ''}
              onClick={() => setFilterStatus('in_progress')}
            >
              בעבודה ({tasksByStatus.in_progress.length})
            </button>
            <button
              className={filterStatus === 'done' ? 'active' : ''}
              onClick={() => setFilterStatus('done')}
            >
              הושלם ({tasksByStatus.done.length})
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>עדיפות:</label>
          <div className="filter-buttons">
            <button
              className={filterPriority === 'all' ? 'active' : ''}
              onClick={() => setFilterPriority('all')}
            >
              הכל
            </button>
            <button
              className={filterPriority === 'urgent' ? 'active' : ''}
              onClick={() => setFilterPriority('urgent')}
            >
              דחוף
            </button>
            <button
              className={filterPriority === 'high' ? 'active' : ''}
              onClick={() => setFilterPriority('high')}
            >
              גבוה
            </button>
            <button
              className={filterPriority === 'medium' ? 'active' : ''}
              onClick={() => setFilterPriority('medium')}
            >
              בינוני
            </button>
            <button
              className={filterPriority === 'low' ? 'active' : ''}
              onClick={() => setFilterPriority('low')}
            >
              נמוך
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="loading">טוען משימות...</div>
      ) : (
        <div className="kanban-board">
          <div className="kanban-column">
            <div className="column-header">
              <h3>לביצוע</h3>
              <span className="count">{tasksByStatus.todo.length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus.todo.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <div className="empty-column">אין משימות</div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="column-header">
              <h3>בעבודה</h3>
              <span className="count">{tasksByStatus.in_progress.length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus.in_progress.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <div className="empty-column">אין משימות</div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="column-header">
              <h3>הושלם</h3>
              <span className="count">{tasksByStatus.done.length}</span>
            </div>
            <div className="column-content">
              {tasksByStatus.done.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.done.length === 0 && (
                <div className="empty-column">אין משימות</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'עריכת משימה' : 'משימה חדשה'}</h2>
              <button className="close-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>כותרת *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="כותרת המשימה"
                />
              </div>

              <div className="form-group">
                <label>תיאור</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="פרטים נוספים על המשימה..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>עדיפות</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">נמוך</option>
                    <option value="medium">בינוני</option>
                    <option value="high">גבוה</option>
                    <option value="urgent">דחוף</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>סטטוס</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="todo">לביצוע</option>
                    <option value="in_progress">בעבודה</option>
                    <option value="done">הושלם</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>תאריך יעד</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'עדכן' : 'שמור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
