import { firestore, auth } from '../lib/firebase'
import React from 'react'

export interface CollectionProps<T extends Doc> {
  authPath: string
  initialData?: T[]
  render: (data: T[], hasLoaded: boolean) => any
  transform?: (data: T[]) => T[]
  orderBy?: {
    field: string | firebase.firestore.FieldPath
    direction: firebase.firestore.OrderByDirection
  }
  where?: Array<WhereParam>
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
    console.log('collection component did mount:', { props: this.props })
    this.setupAuth()
  }
  componentWillUnmount() {
    console.log('coll comp unmount:', this.props.authPath)
    this.unsubData()
    this.unsubAuth()
  }
  componentDidUpdate(prevProps: CollectionProps<T>) {
    const { where: prevWhere } = prevProps
    const { where: newWhere } = this.props
    const prevWhereJSON = JSON.stringify(prevWhere)
    const newWhereJSON = JSON.stringify(newWhere)

    const authPathChanged = prevProps.authPath !== this.props.authPath
    const whereDataChanged = prevWhereJSON !== newWhereJSON
    if (authPathChanged || whereDataChanged) {
      this.unsubData()
      /**
       * we'll leave current data in place to avoid rerender. (only set hasLoaded instead of also data:[]) hasLoaded can be used by client to
       * change interface between new and old data ("render []" for example..)
       * edit: dont wait for setState callback to "setup" next data, just start it..
       */
      this.setState(() => ({ hasLoaded: false }))
      this.setupData()
    }
  }
  setupAuth = () => {
    this.unsubAuth = auth.onAuthStateChanged(user => {
      this.unsubData()
      this.setupData()
    })
  }
  setupData = async () => {
    if (!auth.currentUser) {
      this.setState(({ data }) => (data.length ? { data: [] } : null))
    } else {
      const { authPath, orderBy, where } = this.props
      const activeCompany = await auth.activeCompany()
      let collectionRef: firebase.firestore.Query = firestore.collection(
        `companies/${activeCompany}/${authPath}`,
      )
      if (where) {
        where.forEach(([fp, filtOp, val]) => {
          collectionRef = collectionRef.where(fp, filtOp, val)
        })
      }
      if (orderBy) {
        collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction)
      }
      this.unsubData = collectionRef.onSnapshot(this.handleSnap)
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
  authPath: string
  initialData?: T
  render: (data: T | null, hasLoaded: boolean) => any
  transform?: (data: T) => T
}
interface DocumentState<T extends Doc> {
  data: T | null
  hasLoaded: boolean
}
export class Document<T extends Doc> extends React.Component<
  DocumentProps<T>,
  DocumentState<T>
> {
  constructor(props: DocumentProps<T>) {
    super(props)
    this.state = {
      data: props.initialData || null,
      hasLoaded: false,
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
      /**
       * we'll leave current data in place to avoid rerender.
       * (only set hasLoaded instead of also data: null).
       * hasLoaded can be used by client to change interface
       * between new and old data ("render with null" for example..)
       */
      this.setState(() => ({ hasLoaded: false }))
      this.setupData()
    }
  }
  setupAuth = () => {
    this.unsubAuth = auth.onAuthStateChanged(user => {
      this.unsubData()
      this.setupData()
    })
  }
  setupData = async () => {
    // console.log('setting up data', { currentUser: auth.currentUser })
    if (!auth.currentUser) {
      this.setState(({ data }) => (data ? { data: null } : null))
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
    return this.props.render(this.state.data, this.state.hasLoaded)
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
