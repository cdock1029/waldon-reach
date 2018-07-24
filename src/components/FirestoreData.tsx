import { firestore } from '../lib/firebase'
import { notBuilding } from '../lib'
import { AuthConsumer as Auth, AuthProviderState } from '../components/Auth'
import React from 'react'
import Component from '@reactions/component'

interface CollectionProps<T extends Doc> {
  path: string
  initialData?: T[]
  render: (data: T[], hasLoaded: boolean) => any
  transform?: (data: T[]) => T[]
  orderBy?: {
    field: string | firebase.firestore.FieldPath
    direction: firebase.firestore.OrderByDirection
  }
  auth: AuthProviderState
}
interface CollectionState<T extends Doc> {
  data: T[]
  hasLoaded: boolean
}

export class Collection<T extends Doc> extends React.Component<
  CollectionProps<T>,
  CollectionState<T>
> {
  static defaultProps = {
    initialData: [],
  }
  state: CollectionState<T> = {
    data: this.props.initialData!,
    hasLoaded: false,
  }
  private unsub: () => void
  componentDidMount() {
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
    if (notBuilding() && this.props.auth.user) {
      const { path, orderBy } = this.props
      console.log('attaching listener', { path })
      let collectionRef: firebase.firestore.Query = firestore.collection(path)
      if (orderBy) {
        collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction)
      }
      this.unsub = collectionRef.onSnapshot(this.handleSnap)
    }
  }
  detachListener = () => {
    if (this.unsub) {
      this.unsub()
    }
  }
  handleSnap = (snap: firebase.firestore.QuerySnapshot) => {
    let data: T[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
    if (this.props.transform) {
      data = this.props.transform(data)
    }
    this.setState(() => ({ data, hasLoaded: true }))
  }
  render() {
    return this.props.render(this.state.data, this.state.hasLoaded)
  }
}

interface DocumentProps<T extends Doc> {
  path: string
  initialData?: T
  render: (data?: T) => any
  transform?: (data: T) => T
  auth: AuthProviderState
}
interface DocumentState<T extends Doc> {
  data?: T
}
export class Document<T extends Doc> extends React.Component<
  DocumentProps<T>,
  DocumentState<T>
> {
  constructor(props: DocumentProps<T>) {
    super(props)
    this.state = {
      data: props.initialData,
    }
    this.attachListener()
  }
  unsub: firebase.Unsubscribe
  componentDidUpdate(prevProps: DocumentProps<T>) {
    if (this.props.path !== prevProps.path) {
      // console.log('props changed..')
      this.detachListener()
      this.attachListener()
    }
  }
  componentWillUnmount() {
    this.detachListener()
  }
  attachListener = () => {
    if (notBuilding() && this.props.auth.user) {
      const { path } = this.props
      const documentRef = firestore.doc(path)
      this.unsub = documentRef.onSnapshot(this.handleSnap)
    }
  }
  detachListener = () => {
    if (this.unsub) {
      this.unsub()
    }
  }
  handleSnap = (snap: firebase.firestore.DocumentSnapshot) => {
    let data: T = { id: snap.id, ...snap.data() } as T
    if (this.props.transform) {
      data = this.props.transform(data)
    }
    this.setState(() => ({ data }))
  }
  render() {
    return this.props.render(this.state.data)
  }
}

class FirestoreData extends React.Component<{}, any> {
  static Collection = Collection
  static Document = Document

  render() {
    return null
  }
}

export default FirestoreData
