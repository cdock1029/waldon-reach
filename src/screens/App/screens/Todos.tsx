import React from 'react'
import { authCollection } from '../../../shared/firebase'
import { map } from 'rxjs/operators'
import { componentFromStream } from 'recompose'

interface Todo {
  id: string
  completed: boolean
  tags?: Array<string | { name: string; id: string; props_name?: string }>
  text: string
}

const Todos = componentFromStream<any>(props$ => {
  const todos$ = authCollection<Todo>('/todos', {
    orderBy: ['createdAt', 'desc'],
  })
  return todos$.pipe(
    map(todos => (
      <div css={{ padding: '3em' }}>
        <h1>todos</h1>
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
      </div>
    )),
  )
})

export default Todos
