import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createClient } from '@supabase/supabase-js';
import ColumnManager from '../components/tasks/ColumnManager';
import './TasksNew.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TasksNew = () => {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadColumns();
    loadTasks();
  }, []);

  const loadColumns = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('task_columns')
        .select('*')
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      setColumns(data || []);
    } catch (err) {
      setError('שגיאה בטעינת עמודות: ' + err.message);
      console.error('Error loading columns:', err);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          related_order:orders(order_number),
          related_customer:customers(name, phone)
        `)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      setError('שגיאה בטעינת משימות: ' + err.message);
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async (columnData) => {
    try {
      const { error } = await supabase
        .from('task_columns')
        .insert([columnData]);

      if (error) throw error;
      await loadColumns();
    } catch (err) {
      setError('שגיאה בהוספת עמודה: ' + err.message);
    }
  };

  const handleUpdateColumn = async (columnId, updates) => {
    try {
      const { error } = await supabase
        .from('task_columns')
        .update(updates)
        .eq('id', columnId);

      if (error) throw error;
      await loadColumns();
    } catch (err) {
      setError('שגיאה בעדכון עמודה: ' + err.message);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      // Move tasks to first column
      const firstColumn = columns[0];
      if (firstColumn) {
        await supabase
          .from('tasks')
          .update({ column_id: firstColumn.id })
          .eq('column_id', columnId);
      }

      const { error } = await supabase
        .from('task_columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;
      await loadColumns();
      await loadTasks();
    } catch (err) {
      setError('שגיאה במחיקת עמודה: ' + err.message);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    try {
      // Update task column and position
      const updates = {
        column_id: destination.droppableId,
        position: destination.index
      };

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', draggableId);

      if (error) throw error;

      // Reload tasks to get updated positions
      await loadTasks();
    } catch (err) {
      setError('שגיאה בהזזת משימה: ' + err.message);
      console.error('Error moving task:', err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !selectedColumnId) {
      setError('נא למלא את כל השדות');
      return;
    }

    try {
      const columnTasks = tasks.filter(t => t.column_id === selectedColumnId);
      const position = columnTasks.length;

      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          column_id: selectedColumnId,
          position,
          status: 'todo'
        }]);

      if (error) throw error;

      setShowNewTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setSelectedColumnId(null);
      await loadTasks();
    } catch (err) {
      setError('שגיאה ביצירת משימה: ' + err.message);
    }
  };

  const getTasksForColumn = (columnId) => {
    return tasks
      .filter(task => task.column_id === columnId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f59e0b',
      medium: '#6366f1',
      low: '#10b981'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      urgent: 'דחוף',
      high: 'גבוהה',
      medium: 'בינונית',
      low: 'נמוכה'
    };
    return labels[priority] || labels.medium;
  };

  const openNewTaskModal = (columnId) => {
    setSelectedColumnId(columnId);
    setShowNewTaskModal(true);
  };

  return (
    <div className="tasks-new-page">
      <div className="tasks-header">
        <h1>ניהול משימות</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowColumnManager(true)}
        >
          <i className="fas fa-columns"></i> ניהול עמודות
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">טוען משימות...</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="trello-board">
            {columns.map((column) => (
              <div key={column.id} className="trello-column">
                <div
                  className="column-header"
                  style={{ borderTopColor: column.color }}
                >
                  <div className="column-title-section">
                    <div
                      className="column-color-dot"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3>{column.name}</h3>
                    <span className="task-count">
                      {getTasksForColumn(column.id).length}
                    </span>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={() => openNewTaskModal(column.id)}
                    title="הוסף משימה"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-tasks ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {getTasksForColumn(column.id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div className="task-card-header">
                                <h4>{task.title}</h4>
                                <div
                                  className="priority-indicator"
                                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                                  title={getPriorityLabel(task.priority)}
                                />
                              </div>

                              {task.description && (
                                <p className="task-description">{task.description}</p>
                              )}

                              <div className="task-card-footer">
                                {task.related_order && (
                                  <span className="task-meta">
                                    <i className="fas fa-shopping-cart"></i>
                                    {task.related_order.order_number}
                                  </span>
                                )}
                                {task.related_customer && (
                                  <span className="task-meta">
                                    <i className="fas fa-user"></i>
                                    {task.related_customer.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {getTasksForColumn(column.id).length === 0 && (
                        <div className="empty-column-placeholder">
                          <i className="fas fa-inbox"></i>
                          <p>אין משימות בעמודה זו</p>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openNewTaskModal(column.id)}
                          >
                            הוסף משימה ראשונה
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {columns.length === 0 && (
              <div className="no-columns-placeholder">
                <i className="fas fa-columns"></i>
                <h3>לא נמצאו עמודות</h3>
                <p>צור עמודות כדי להתחיל לנהל משימות</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowColumnManager(true)}
                >
                  <i className="fas fa-plus"></i> צור עמודה ראשונה
                </button>
              </div>
            )}
          </div>
        </DragDropContext>
      )}

      {/* Column Manager Modal */}
      {showColumnManager && (
        <ColumnManager
          columns={columns}
          onAddColumn={handleAddColumn}
          onUpdateColumn={handleUpdateColumn}
          onDeleteColumn={handleDeleteColumn}
          onClose={() => setShowColumnManager(false)}
        />
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="modal-overlay" onClick={() => setShowNewTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>משימה חדשה</h2>
              <button className="close-btn" onClick={() => setShowNewTaskModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>כותרת *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="לדוגמה: להדפיס פליירים ללקוח X"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>תיאור</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="פרטים נוספים על המשימה..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>עדיפות</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                  <option value="urgent">דחוף</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewTaskModal(false)}
              >
                ביטול
              </button>
              <button className="btn btn-primary" onClick={handleCreateTask}>
                <i className="fas fa-plus"></i> צור משימה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksNew;
