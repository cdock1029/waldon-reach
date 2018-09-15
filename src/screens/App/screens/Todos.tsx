import React from 'react'
import { authCollection } from '../../../shared/firebase'
import { TestRx } from '../shared/components/FirestoreData'

interface Todo {
  id: string
  completed: boolean
  tags?: Array<string | { name: string; id: string; props_name?: string }>
  text: string
}

class TodosRx extends TestRx<Todo[]> {}

class Todos extends React.Component<{ path: string }> {
  todos$ = authCollection<Todo>('/todos', { orderBy: ['createdAt', 'desc'] })
  render() {
    return (
      <div css={{ padding: '3em' }}>
        <h1>todos</h1>
        <TodosRx
          observable={this.todos$}
          // where={[['tags', 'array-contains', { hello: 'world' }]]}
          // orderBy={{ field: 'createdAt', direction: 'desc' }}
        >
          {(todos, hasLoaded) => (
            <div>
              <ul>
                {hasLoaded &&
                  todos !== null && (
                    <div>
                      <p>Length: {todos.length}</p>
                      {todos.map(t => (
                        <li key={t.id}>
                          <div>{t.text}</div>
                          {t.tags && (
                            <ul>
                              {t.tags.map((tag, index) => {
                                const key = `${t.id}${index}`
                                if (typeof tag !== 'object') {
                                  return <li key={key}>{tag}</li>
                                } else if (tag.props_name) {
                                  return <p key={key}>{tag.props_name}</p>
                                } else {
                                  return null
                                }
                              })}
                            </ul>
                          )}
                        </li>
                      ))}
                    </div>
                  )}
              </ul>
            </div>
          )}
        </TodosRx>
      </div>
    )
  }
}

export default Todos
