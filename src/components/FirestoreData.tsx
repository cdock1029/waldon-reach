import {
  firestore,
  onAuthStateChangedWithClaims,
  AuthWithClaims,
} from '../lib/firebase'
import { notBuilding } from '../lib'
import { AuthProviderState } from '../components/Auth'
import React from 'react'

interface CollectionProps<T extends Doc> {
  authPath: string
  initialData?: T[]
  render: (data: T[], hasLoaded: boolean) => any
  transform?: (data: T[]) => T[]
  orderBy?: {
    field: string | firebase.firestore.FieldPath
    direction: firebase.firestore.OrderByDirection
  }
  path?: string
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
  unsub: Array<firebase.Unsubscribe> = []
  componentDidMount() {
    this.attachListener()
  }
  componentDidUpdate(prevProps: CollectionProps<T>) {
    if (prevProps.authPath !== this.props.authPath) {
      this.detachListener()
      this.attachListener()
    }
  }
  componentWillUnmount() {
    this.detachListener()
  }
  attachListener = () => {
    console.log('attachListener')
    if (notBuilding()) {
      const { orderBy, authPath } = this.props
      this.unsub.push(
        onAuthStateChangedWithClaims(['activeCompany'], ({ user, claims }) => {
          if (!user) {
            this.setState(({ data }) => (data.length ? { data: [] } : null))
          } else {
            const { activeCompany } = claims
            let collectionRef: firebase.firestore.Query = firestore.collection(
              `companies/${activeCompany}/${authPath}`,
            )
            if (orderBy) {
              collectionRef = collectionRef.orderBy(
                orderBy.field,
                orderBy.direction,
              )
            }
            this.unsub.push(collectionRef.onSnapshot(this.handleSnap))
          }
        }),
      )
    }
  }
  detachListener = () => {
    console.log('DETACH Listener')
    if (this.unsub.length) {
      this.unsub.forEach(u => u())
    }
  }
  handleSnap = (snap: firebase.firestore.QuerySnapshot) => {
    console.log('handling snap')
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
  authPath: string
  initialData?: T
  render: (data?: T) => any
  transform?: (data: T) => T
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
  unsub: Array<firebase.Unsubscribe> = []
  componentDidUpdate(prevProps: DocumentProps<T>) {
    if (prevProps.authPath !== this.props.authPath) {
      this.detachListener()
      this.attachListener()
    }
  }
  componentWillUnmount() {
    console.log('Doc comp will UNMOUNT')
    this.detachListener()
  }
  attachListener = () => {
    if (notBuilding()) {
      const { authPath } = this.props
      this.unsub.push(
        onAuthStateChangedWithClaims(['activeCompany'], ({ user, claims }) => {
          if (user) {
            const { activeCompany } = claims
            const documentRef = firestore.doc(
              `companies/${activeCompany}/${authPath}`,
            )
            this.unsub.push(documentRef.onSnapshot(this.handleSnap))
          } else {
            this.setState(({ data }) => (data ? { data: undefined } : null))
          }
        }),
      )
    }
  }
  detachListener = () => {
    if (this.unsub.length) {
      this.unsub.forEach(u => u())
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
