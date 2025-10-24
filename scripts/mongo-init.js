// MongoDB initialization script
db = db.getSiblingDB('taskflow');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        name: {
          bsonType: 'string',
          minLength: 2
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'user']
        },
        preferences: {
          bsonType: 'object',
          properties: {
            theme: {
              bsonType: 'string',
              enum: ['light', 'dark']
            },
            notifications: {
              bsonType: 'bool'
            }
          }
        }
      }
    }
  }
});

db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status', 'priority', 'assignee'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        description: {
          bsonType: 'string',
          maxLength: 1000
        },
        status: {
          bsonType: 'string',
          enum: ['backlog', 'in-progress', 'in-review', 'done']
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'urgent']
        },
        assignee: {
          bsonType: 'objectId'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
            maxLength: 50
          }
        },
        dueDate: {
          bsonType: 'date'
        },
        estimatedHours: {
          bsonType: 'number',
          minimum: 0,
          maximum: 1000
        },
        actualHours: {
          bsonType: 'number',
          minimum: 0,
          maximum: 1000
        },
        isArchived: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('todos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'completed', 'priority', 'assignee', 'category'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        description: {
          bsonType: 'string',
          maxLength: 500
        },
        completed: {
          bsonType: 'bool'
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high']
        },
        assignee: {
          bsonType: 'objectId'
        },
        category: {
          bsonType: 'string',
          enum: ['personal', 'work', 'shopping', 'health', 'other']
        },
        dueDate: {
          bsonType: 'date'
        },
        isArchived: {
          bsonType: 'bool'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.tasks.createIndex({ assignee: 1, status: 1 });
db.tasks.createIndex({ createdAt: -1 });
db.tasks.createIndex({ dueDate: 1 });
db.tasks.createIndex({ tags: 1 });

db.todos.createIndex({ assignee: 1, completed: 1 });
db.todos.createIndex({ createdAt: -1 });
db.todos.createIndex({ dueDate: 1 });
db.todos.createIndex({ category: 1 });

print('TaskFlow database initialized successfully!');
