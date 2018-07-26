import { firestore, onAuthStateChangedWithClaims, auth } from '../lib/firebase'
import { notBuilding } from '../lib'
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
  unsubAuth: firebase.Unsubscribe = () => {}
  unsubData: firebase.Unsubscribe = () => {}
  componentDidMount() {
    this.setupAuth()
  }
  componentWillUnmount() {
    this.unsubData()
    this.unsubAuth()
  }
  componentDidUpdate(prevProps: CollectionProps<T>) {
    if (prevProps.authPath !== this.props.authPath) {
      this.unsubData()
      this.setupData()
      /*this.setState(
        () => ({ data: [], hasLoaded: false }),
        () => {
          this.setupData()
        },
      )*/
    }
  }
  setupAuth = () => {
    this.unsubAuth = auth.onAuthStateChanged(user => {
      this.unsubData()
      this.setupData()
      /* if (!user) {
        this.setState(({ data }) => (data.length ? { data: [] } : null))
      } else {
        this.setupData()
      }*/
    })
  }
  setupData = async () => {
    if (!auth.currentUser) {
      this.setState(({ data }) => (data.length ? { data: [] } : null))
    } else {
      const { authPath, orderBy } = this.props
      const activeCompany = await auth.activeCompany()
      let collectionRef: firebase.firestore.Query = firestore.collection(
        `companies/${activeCompany}/${authPath}`,
      )
      if (orderBy) {
        collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction)
      }
      this.unsubData = collectionRef.onSnapshot(this.handleSnap)
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
  }
  unsubAuth: firebase.Unsubscribe = () => {}
  unsubData: firebase.Unsubscribe = () => {}
  componentDidMount() {
    this.setupAuth()
  }
  componentWillUnmount() {
    this.unsubData()
    this.unsubAuth()
  }
  componentDidUpdate(prevProps: DocumentProps<T>) {
    if (prevProps.authPath !== this.props.authPath) {
      this.unsubData()
      this.setupData()
      /* this.setState(
        () => ({ data: undefined, hasLoaded: false }),
        () => {
          this.setupData()
        },
      )*/
    }
  }
  setupAuth = () => {
    this.unsubAuth = auth.onAuthStateChanged(user => {
      console.log('auth changed.', { user })
      this.unsubData()
      this.setupData()
      /* if (!user) {
        this.setState(({ data }) => (data ? { data: undefined } : null))
      } else {
        this.setupData()
      }*/
    })
  }
  setupData = async () => {
    console.log('setting up data', { currentUser: auth.currentUser })
    if (!auth.currentUser) {
      this.setState(({ data }) => (data ? { data: undefined } : null))
    } else {
      const activeCompany = await auth.activeCompany()
      const documentRef = firestore.doc(
        `companies/${activeCompany}/${this.props.authPath}`,
      )
      this.unsubData = documentRef.onSnapshot(this.handleSnap)
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
