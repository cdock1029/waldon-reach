import React from 'react'
import { componentFromStream, createEventHandler } from 'recompose'
import { Observable, of, from, merge, combineLatest } from 'rxjs'
import {
  map,
  mapTo,
  startWith,
  scan,
  pluck,
  switchMap,
  catchError,
  first,
  tap,
  share,
  withLatestFrom,
} from 'rxjs/operators'
import { validate } from 'spected'
const verify: any = validate(
  () => undefined,
  (errorMsgs: string[]) => errorMsgs,
)

export const StreamForm = componentFromStream<any>(propsSubscribable => {
  const props$ = propsSubscribable as Observable<any>

  const { handler: handleSubmit, stream: handleSubmit$ } = createEventHandler()
  const { handler: handleChange, stream: handleChange$ } = createEventHandler()
  const { handler: handleBlur, stream: handleBlur$ } = createEventHandler()
  const { handler: reset, stream: reset$ } = createEventHandler()

  const values$ = props$.pipe(
    first(),
    pluck('initialValues'),
    switchMap(initialValues =>
      merge(
        handleChange$.pipe(
          map((e: React.FormEvent<HTMLInputElement>) => ({
            [e.currentTarget.name]: e.currentTarget.value,
          })),
          scan((acc, value) => {
            return { ...acc, ...value }
          }, initialValues),
        ),
        reset$.pipe(mapTo(initialValues)),
      ).pipe(startWith(initialValues)),
    ),
    share(),
    // tap(VALUES => console.log({ VALUES })),
  )

  const errors$ = props$.pipe(
    first(),
    pluck('rules'),
    switchMap(rules =>
      merge(
        values$.pipe(map(values => verify(rules, values))),
        touched$.pipe(
          withLatestFrom(values$),
          tap(dubs => console.log({ dubs })),
          map(([touched, values]) => verify(rules, values)),
        ),
        reset$.pipe(mapTo({})),
      ).pipe(
        startWith({}),
        tap(vaals => console.log({ vaals })),
      ),
    ),
  )

  const touched$ = merge(
    handleBlur$.pipe(
      map((e: React.FormEvent<HTMLInputElement>) => ({
        [e.currentTarget.name]: true,
      })),
      scan((acc, value) => ({ ...acc, ...value }), {}),
      startWith({}),
    ),
    reset$.pipe(mapTo({})),
  ) // .pipe(share())

  const submitError$ = combineLatest<any, any>(
    props$.pipe(
      first(),
      pluck('onSubmit'),
    ),
    values$,
  ).pipe(
    switchMap(([onSubmit, values]) =>
      merge(
        handleSubmit$.pipe(
          map((e: any) => {
            e.preventDefault()
            return from(onSubmit({ values })).pipe(
              mapTo(undefined),
              catchError((err: Error) => of(err.message)),
            )
          }),
          startWith(undefined),
        ),
        reset$.pipe(mapTo(undefined)),
      ),
    ),
  )

  const state$ = combineLatest(props$, values$, touched$, submitError$, errors$)

  return state$.pipe(
    map(([{ children, ...rest }, values, touched, submitError, errors]) =>
      children({
        ...rest,
        values,
        touched,
        submitError,
        errors,
        reset,
        handleBlur,
        handleChange,
        handleSubmit,
      }),
    ),
  )
})
