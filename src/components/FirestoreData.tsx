// import {
//   DocumentSnapshot,
//   FieldPath,
//   OrderByDirection,
//   Query,
//   QuerySnapshot,
// } from '@firebase/firestore-types'
import firebase from '@lib/firebase'
import { firestore as fs } from 'firebase'
import React from 'react'

export interface Doc {
  id: string
}

interface CollectionProps<T extends Doc> {
  // collectionRef: CollectionReference | Query
  path: string
  initialData?: T[]
  render: (data: T[]) => any
  transform?: (data: T[]) => T[]
  orderBy?: { field: string | fs.FieldPath; direction: fs.OrderByDirection }
}
interface CollectionState<T extends Doc> {
  data: T[]
  path?: string
}
interface DocumentProps<T extends Doc> {
  // documentRef: DocumentReference
  path: string
  initialData?: T
  render: (data?: T) => any
  transform?: (data: T) => T
}
interface DocumentState<T extends Doc> {
  data?: T
  // documentRef?: any
  // unsub?: () => void
}

export class Collection<T extends Doc> extends React.Component<
  CollectionProps<T>,
  CollectionState<T>
> {
  state: CollectionState<T> = {
    data: this.props.initialData || [],
    path: undefined,
  }
  private unsub: () => void
  componentDidMount() {
    // console.log({ props: this.props })
    // console.log('cDM collection')
    this.attachListener()
  }
  componentDidUpdate(prevProps: CollectionProps<T>) {
    if (this.props.path !== prevProps.path) {
      this.detachListener()
      this.attachListener()
    }
  }
  componentWillUnmount() {
    this.detachListener()
  }
  attachListener = () => {
    const { path, orderBy } = this.props
    let collectionRef: fs.Query = firebase.firestore().collection(path)
    if (orderBy) {
      collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction)
    }
    this.unsub = collectionRef.onSnapshot(this.handleSnap)
  }
  detachListener = () => {
    if (this.unsub) {
      this.unsub()
    }
  }
  handleSnap = (snap: fs.QuerySnapshot) => {
    let data: T[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
    if (this.props.transform) {
      data = this.props.transform(data)
    }
    this.setState(() => ({ data }))
  }
  render() {
    return this.props.render(this.state.data)
  }
}
export class Document<T extends Doc> extends React.Component<
  DocumentProps<T>,
  DocumentState<T>
> {
  state: DocumentState<T> = {
    data: this.props.initialData,
  }
  private unsub: () => void
  componentDidMount() {
    this.attachListener()
  }
  componentDidUpdate(prevProps: DocumentProps<T>) {
    if (this.props.path !== prevProps.path) {
      console.log('props changed..')
      this.detachListener()
      this.attachListener()
    }
  }
  componentWillUnmount() {
    this.detachListener()
  }
  attachListener = () => {
    const { path } = this.props
    const documentRef = firebase.firestore().doc(path)
    this.unsub = documentRef.onSnapshot(this.handleSnap)
  }
  detachListener = () => {
    if (this.unsub) {
      this.unsub()
    }
  }
  handleSnap = (snap: fs.DocumentSnapshot) => {
    let data: T = { id: snap.id, ...snap.data() } as T
    if (this.props.transform) {
      data = this.props.transform(data)
    }
    this.setState(() => ({ data }))
  }
  render() {
    console.log('** render Document **')
    return this.props.render(this.state.data)
  }
}

class FirestoreData extends React.Component<{}, any> {
  static Collection = Collection
  static Document = Document

  render() {
    return null
  }
  /*
  render() {
    return React.Children.map(this.props.children, child => {
      return React.cloneElement(child as React.ReactElement<any>, {
        firestore: this.props.firestore,
        activeCompany: this.props.activeCompany,
      })
      // if (React.isValidElement(child)) {
      // return React.cloneElement(child, {
      //   firestore: this.props.firestore
      // })
      // }
    })
  }*/
}

export default FirestoreData
