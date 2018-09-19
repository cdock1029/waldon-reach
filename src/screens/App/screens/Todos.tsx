import React from 'react'
import { authCollection } from '../../../shared/firebase'
import { Stream } from 'react-streams'
import { map } from 'rxjs/operators'

interface Todo {
  id: string
  completed: boolean
  tags?: Array<string | { name: string; id: string; props_name?: string }>
  text: string
}

class Todos extends React.Component<{ path: string }> {
  render() {
    return (
      <div css={{ padding: '3em' }}>
        <h1>todos</h1>
        <Stream
          pipe={map(todos => ({ todos }))}
          source={authCollection<Todo>('/todos', {
            orderBy: ['createdAt', 'desc'],
          })}
          // where={[['tags', 'array-contains', { hello: 'world' }]]}
          // orderBy={{ field: 'createdAt', direction: 'desc' }}
        >
          {({ todos }: { todos: Todo[] }) => (
            <div>
              <ul>
                {todos !== null && (
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
        </Stream>
      </div>
    )
  }
}

export default Todos
